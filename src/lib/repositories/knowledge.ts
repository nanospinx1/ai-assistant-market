/**
 * Knowledge repository — user_knowledge_library + deployment_knowledge_bindings.
 */
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

/* ---- Global knowledge library (Resources page) ---- */

export function listByUser(userId: string) {
  return getDb()
    .prepare("SELECT * FROM user_knowledge_library WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as any[];
}

export function createEntry(userId: string, title: string, content: string, category = "General"): string {
  const id = uuid();
  getDb().prepare(
    "INSERT INTO user_knowledge_library (id, user_id, title, content, category) VALUES (?, ?, ?, ?, ?)"
  ).run(id, userId, title, content, category);
  return id;
}

export function deleteEntry(entryId: string, userId: string): boolean {
  const db = getDb();
  const entry = db.prepare("SELECT id FROM user_knowledge_library WHERE id = ? AND user_id = ?").get(entryId, userId);
  if (!entry) return false;
  db.prepare("DELETE FROM deployment_knowledge_bindings WHERE knowledge_id = ?").run(entryId);
  db.prepare("DELETE FROM user_knowledge_library WHERE id = ?").run(entryId);
  return true;
}

/* ---- Deployment-level bindings ---- */

export function getBindingsForDeployment(deploymentId: string) {
  return getDb()
    .prepare("SELECT * FROM deployment_knowledge_bindings WHERE deployment_id = ?")
    .all(deploymentId) as any[];
}

export function toggleBinding(deploymentId: string, knowledgeId: string, enabled: boolean): void {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM deployment_knowledge_bindings WHERE deployment_id = ? AND knowledge_id = ?")
    .get(deploymentId, knowledgeId) as any;

  if (existing) {
    if (enabled) {
      db.prepare("UPDATE deployment_knowledge_bindings SET enabled = 1 WHERE id = ?").run(existing.id);
    } else {
      db.prepare("DELETE FROM deployment_knowledge_bindings WHERE id = ?").run(existing.id);
    }
  } else if (enabled) {
    db.prepare(
      "INSERT INTO deployment_knowledge_bindings (id, deployment_id, knowledge_id, enabled) VALUES (?, ?, ?, 1)"
    ).run(uuid(), deploymentId, knowledgeId);
  }
}
