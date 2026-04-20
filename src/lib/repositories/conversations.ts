/**
 * Conversations repository — conversations + messages tables.
 */
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

/* ---- Conversations ---- */

export function listByDeployment(deploymentId: string, limit = 50) {
  return getDb()
    .prepare(`
      SELECT * FROM conversations
      WHERE deployment_id = ?
      ORDER BY updated_at DESC LIMIT ?
    `)
    .all(deploymentId, limit) as any[];
}

export function findOrCreate(deploymentId: string, conversationId?: string): string {
  const db = getDb();
  if (conversationId) {
    const existing = db.prepare("SELECT id FROM conversations WHERE id = ? AND deployment_id = ?").get(conversationId, deploymentId) as any;
    if (existing) return existing.id;
  }
  const id = uuid();
  db.prepare("INSERT INTO conversations (id, deployment_id, title) VALUES (?, ?, 'New Conversation')").run(id, deploymentId);
  return id;
}

export function updateTitle(conversationId: string, title: string): void {
  getDb().prepare("UPDATE conversations SET title = ?, updated_at = datetime('now') WHERE id = ?").run(title, conversationId);
}

/* ---- Messages ---- */

export function getMessages(conversationId: string) {
  return getDb()
    .prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC")
    .all(conversationId) as any[];
}

export function addMessage(params: {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
}): string {
  const id = uuid();
  getDb().prepare(
    "INSERT INTO messages (id, conversation_id, role, content, metadata) VALUES (?, ?, ?, ?, ?)"
  ).run(id, params.conversationId, params.role, params.content, params.metadata ? JSON.stringify(params.metadata) : null);
  // Bump conversation updated_at
  getDb().prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(params.conversationId);
  return id;
}

export function getConversationStats(deploymentId: string) {
  return getDb().prepare(`
    SELECT
      COUNT(DISTINCT c.id) as totalConversations,
      COUNT(m.id) as totalMessages
    FROM conversations c
    LEFT JOIN messages m ON m.conversation_id = c.id
    WHERE c.deployment_id = ?
  `).get(deploymentId) as { totalConversations: number; totalMessages: number };
}
