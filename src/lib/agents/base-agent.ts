// Base agent — stateless executor, reconstructed from DB per request

import { AgentConfig, AgentMessage, ChatRequest, ChatResponse, TaskLog } from "./types";
import { getLLMProvider } from "./llm-provider";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";
import { reserveQuota, reconcileUsage, releaseReservation, QuotaExceededError } from "./usage-meter";
import { buildFullSystemPrompt } from "./agent-prompts";
import { getToolSchemas, executeTool } from "../tools/tool-executor";

const MAX_TOOL_ROUNDS = 5; // prevent infinite tool-calling loops

export class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Build the system prompt by merging:
   * 1. Agent-type-specific prompt with customer config (from agent-prompts.ts)
   * 2. Knowledge sources loaded from the database
   */
  protected buildSystemPrompt(): string {
    // Use the data-driven prompt builder if we have a known agent type
    let prompt: string;
    if (this.config.agentType && this.config.agentType !== "generic") {
      prompt = buildFullSystemPrompt(this.config.agentType, this.config.deploymentConfig || {});
    } else {
      // Fallback: use whatever systemPrompt was passed in config (custom agents)
      prompt = this.config.systemPrompt || "You are a helpful AI assistant. Respond professionally and helpfully to all requests.";
    }

    // Append knowledge sources
    if (this.config.knowledgeSources.length > 0) {
      prompt += "\n\n--- Knowledge Base ---\n";
      for (const source of this.config.knowledgeSources) {
        prompt += `\n[${source.sourceType.toUpperCase()}: ${source.title}]\n${source.content}\n`;
      }
    }

    return prompt;
  }

  /**
   * Load conversation history from the database.
   */
  protected loadHistory(conversationId: string): AgentMessage[] {
    const db = getDb();
    const rows = db
      .prepare("SELECT role, content, metadata FROM messages WHERE conversation_id = ? ORDER BY created_at ASC")
      .all(conversationId) as any[];

    return rows.map((r) => ({
      role: r.role,
      content: r.content,
      metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
    }));
  }

  /**
   * Process a chat request — the main entry point.
   * Reserves quota → calls LLM → reconciles usage → persists results.
   */
  async chat(userId: string, request: ChatRequest): Promise<ChatResponse> {
    const db = getDb();
    const llm = getLLMProvider();

    // Find or create conversation
    let conversationId = request.conversationId;
    if (!conversationId) {
      conversationId = uuid();
      db.prepare(`
        INSERT INTO conversations (id, deployment_id, user_id, title, status)
        VALUES (?, ?, ?, ?, 'active')
      `).run(conversationId, this.config.deploymentId, userId, this.generateTitle(request.message));
    }

    // Insert user message
    const userMsgId = uuid();
    db.prepare(`
      INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, 'user', ?)
    `).run(userMsgId, conversationId, request.message);

    // Create task log (running)
    const taskLogId = uuid();
    db.prepare(`
      INSERT INTO task_logs (id, deployment_id, conversation_id, task_type, input, status)
      VALUES (?, ?, ?, 'chat', ?, 'running')
    `).run(taskLogId, this.config.deploymentId, conversationId, request.message);

    // Build message array for LLM
    const systemPrompt = this.buildSystemPrompt();
    const history = this.loadHistory(conversationId);
    const messages: AgentMessage[] = [
      { role: "system", content: systemPrompt },
      ...history,
    ];

    // Resolve model: deployment default → fallback
    const model = this.resolveModel();

    // Reserve quota before LLM call (estimate ~2K tokens per request)
    const estimatedTokens = 2000;
    let reserved = false;
    try {
      reserveQuota(userId, estimatedTokens);
      reserved = true;
    } catch (err: any) {
      if (err instanceof QuotaExceededError) {
        db.prepare("UPDATE task_logs SET status = 'failed', output = ? WHERE id = ?")
          .run(err.message, taskLogId);
        throw err;
      }
      // Non-quota errors: proceed without reservation (metering still happens)
    }

    try {
      // Get tool schemas if agent has tools configured
      const enabledTools = this.config.deploymentConfig?.tools || [];
      const toolSchemas = getToolSchemas(enabledTools);

      // Generate response with model selection (and tools if available)
      let llmResponse = await llm.generate(messages, {
        model,
        ...(toolSchemas.length > 0 ? { tools: toolSchemas } : {}),
      });

      // Tool-calling loop: execute tool calls and feed results back to LLM
      let toolRounds = 0;
      let totalTokens = llmResponse.usage.totalTokens;
      while (llmResponse.finishReason === "tool_call" && llmResponse.toolCalls && toolRounds < MAX_TOOL_ROUNDS) {
        toolRounds++;

        // Add assistant message with tool_calls metadata to history
        messages.push({
          role: "assistant",
          content: llmResponse.content || "",
          metadata: {
            tool_calls: llmResponse.toolCalls.map((tc) => ({
              id: tc.id,
              type: "function",
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
            })),
          },
        });

        // Execute each tool call and add results as "tool" role messages
        for (const tc of llmResponse.toolCalls) {
          const result = await executeTool(
            tc.name,
            tc.arguments,
            this.config.deploymentId,
            conversationId,
            userId
          );
          // Tool results go back as role=tool messages (OpenAI format)
          messages.push({
            role: "system" as any, // will be mapped to "tool" in provider
            content: JSON.stringify(result.output || result.error),
            metadata: { tool_call_id: tc.id, _role: "tool" },
          });
        }

        // Call LLM again with tool results
        llmResponse = await llm.generate(
          // Re-map messages: convert _role=tool entries for the provider
          messages.map((m) =>
            m.metadata?._role === "tool"
              ? { ...m, role: "system" as any } // The provider formats these with tool_call_id
              : m
          ),
          { model, ...(toolSchemas.length > 0 ? { tools: toolSchemas } : {}) }
        );
        totalTokens += llmResponse.usage.totalTokens;
      }

      // Insert assistant message
      const assistantMsgId = uuid();
      db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content, metadata)
        VALUES (?, ?, 'assistant', ?, ?)
      `).run(
        assistantMsgId,
        conversationId,
        llmResponse.content,
        JSON.stringify({
          model: llmResponse.model,
          usage: { ...llmResponse.usage, totalTokens },
          latencyMs: llmResponse.latencyMs,
          toolRounds: toolRounds > 0 ? toolRounds : undefined,
        })
      );

      // Update task log (completed)
      db.prepare(`
        UPDATE task_logs SET status = 'completed', output = ?, duration_ms = ?, tokens_used = ?
        WHERE id = ?
      `).run(llmResponse.content, llmResponse.latencyMs, totalTokens, taskLogId);

      // Update conversation timestamp
      db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conversationId);

      // Reconcile metering — log actual usage and update quota
      reconcileUsage(userId, reserved ? estimatedTokens : 0, {
        userId,
        deploymentId: this.config.deploymentId,
        conversationId,
        taskLogId,
        model: llmResponse.model,
        provider: process.env.LLM_PROVIDER || "mock",
        promptTokens: llmResponse.usage.promptTokens,
        completionTokens: llmResponse.usage.completionTokens,
        totalTokens,
        latencyMs: llmResponse.latencyMs,
        status: "success",
      });

      const taskLog: TaskLog = {
        id: taskLogId,
        deploymentId: this.config.deploymentId,
        conversationId,
        taskType: "chat",
        input: request.message,
        output: llmResponse.content,
        status: "completed",
        durationMs: llmResponse.latencyMs,
        tokensUsed: llmResponse.usage.totalTokens,
        createdAt: new Date().toISOString(),
      };

      return {
        conversationId,
        message: { role: "assistant", content: llmResponse.content },
        taskLog,
      };
    } catch (error: any) {
      // Release reservation on failure
      if (reserved) {
        releaseReservation(userId, estimatedTokens);
      }

      // Log error usage
      try {
        reconcileUsage(userId, 0, {
          userId,
          deploymentId: this.config.deploymentId,
          conversationId,
          taskLogId,
          model: model || "unknown",
          provider: process.env.LLM_PROVIDER || "mock",
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          status: "error",
          errorMessage: error.message,
        });
      } catch {
        // Don't let metering errors mask the original error
      }

      // Update task log (failed)
      db.prepare(`
        UPDATE task_logs SET status = 'failed', output = ? WHERE id = ?
      `).run(error.message || "Unknown error", taskLogId);

      throw error;
    }
  }

  /**
   * Resolve which model to use for this deployment.
   * Checks deployment record for default_model, falls back to gpt-4.1-mini.
   */
  private resolveModel(): string {
    const db = getDb();
    const deployment = db
      .prepare("SELECT default_model FROM deployments WHERE id = ?")
      .get(this.config.deploymentId) as any;

    return deployment?.default_model || process.env.LLM_MODEL || "llama-3.3-70b-versatile";
  }

  /**
   * Generate a conversation title from the first message.
   */
  private generateTitle(firstMessage: string): string {
    const trimmed = firstMessage.trim();
    if (trimmed.length <= 50) return trimmed;
    return trimmed.substring(0, 47) + "...";
  }
}
