// Base agent — stateless executor, reconstructed from DB per request

import { AgentConfig, AgentMessage, ChatRequest, ChatResponse, TaskLog } from "./types";
import { getLLMProvider } from "./llm-provider";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";
import { reserveQuota, reconcileUsage, releaseReservation, QuotaExceededError } from "./usage-meter";

export class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Build the system prompt including knowledge sources.
   */
  protected buildSystemPrompt(): string {
    let prompt = this.config.systemPrompt;

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
      // Generate response with model selection
      const llmResponse = await llm.generate(messages, { model });

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
          usage: llmResponse.usage,
          latencyMs: llmResponse.latencyMs,
        })
      );

      // Update task log (completed)
      db.prepare(`
        UPDATE task_logs SET status = 'completed', output = ?, duration_ms = ?, tokens_used = ?
        WHERE id = ?
      `).run(llmResponse.content, llmResponse.latencyMs, llmResponse.usage.totalTokens, taskLogId);

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
        totalTokens: llmResponse.usage.totalTokens,
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

    return deployment?.default_model || "gpt-4o-mini";
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
