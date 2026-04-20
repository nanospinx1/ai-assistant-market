/**
 * Tool connections repository — user_tool_connections + deployment_tool_bindings.
 */
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

/* ---- Global tool connections (Resources page) ---- */

export function listByUser(userId: string) {
  const rows = getDb()
    .prepare("SELECT * FROM user_tool_connections WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as any[];
  return rows.map((c: any) => ({
    id: c.id,
    toolType: c.tool_type,
    name: c.name,
    config: JSON.parse(c.config || "{}"),
    status: c.status,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }));
}

export function createConnection(userId: string, toolType: string, name: string, config: Record<string, any>): string {
  const id = uuid();
  getDb().prepare(`
    INSERT INTO user_tool_connections (id, user_id, tool_type, name, config, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `).run(id, userId, toolType, name, JSON.stringify(config));
  return id;
}

export function deleteConnection(connectionId: string, userId: string): boolean {
  const db = getDb();
  const conn = db.prepare("SELECT id FROM user_tool_connections WHERE id = ? AND user_id = ?").get(connectionId, userId);
  if (!conn) return false;
  db.prepare("DELETE FROM deployment_tool_bindings WHERE connection_id = ?").run(connectionId);
  db.prepare("DELETE FROM user_tool_connections WHERE id = ?").run(connectionId);
  return true;
}

/* ---- Deployment-level bindings ---- */

export function getBindingsForDeployment(deploymentId: string) {
  return getDb()
    .prepare("SELECT * FROM deployment_tool_bindings WHERE deployment_id = ?")
    .all(deploymentId) as any[];
}

export function toggleBinding(deploymentId: string, connectionId: string, toolType: string, enabled: boolean): void {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM deployment_tool_bindings WHERE deployment_id = ? AND connection_id = ?")
    .get(deploymentId, connectionId) as any;

  if (existing) {
    if (enabled) {
      db.prepare("UPDATE deployment_tool_bindings SET enabled = 1 WHERE id = ?").run(existing.id);
    } else {
      db.prepare("DELETE FROM deployment_tool_bindings WHERE id = ?").run(existing.id);
    }
  } else if (enabled) {
    db.prepare(
      "INSERT INTO deployment_tool_bindings (id, deployment_id, connection_id, tool_type, enabled) VALUES (?, ?, ?, ?, 1)"
    ).run(uuid(), deploymentId, connectionId, toolType);
  }
}
