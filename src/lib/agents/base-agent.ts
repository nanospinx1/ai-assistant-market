// Base agent — stateless executor, reconstructed from DB per request

import { AgentConfig, AgentMessage, ChatRequest, ChatResponse, TaskLog } from "./types";
import { getLLMProvider } from "./llm-provider";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

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
   * Atomic: creates/finds conversation, inserts messages, logs task, all in one flow.
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
    // Remove the user message we just inserted (it's already at the end of history)
    // Actually history includes it since we inserted before loading, so it's fine
    const messages: AgentMessage[] = [
      { role: "system", content: systemPrompt },
      ...history,
    ];

    try {
      // Generate response
      const llmResponse = await llm.generate(messages);

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
      // Update task log (failed)
      db.prepare(`
        UPDATE task_logs SET status = 'failed', output = ? WHERE id = ?
      `).run(error.message || "Unknown error", taskLogId);

      throw error;
    }
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
