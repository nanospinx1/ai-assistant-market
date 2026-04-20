/**
 * Deployment repository — SQL access for deployments table.
 */
import { getDb } from "@/lib/db";

export interface DeploymentRow {
  id: string;
  user_id: string;
  employee_id: string;
  name: string;
  status: string;
  config: string;
  deployed_at: string | null;
  created_at: string;
  default_model: string | null;
  model_tier: string | null;
  agent_snapshot: string | null;
}

/* ---- Read ---- */

export function findByUser(userId: string): DeploymentRow[] {
  return getDb().prepare(`
    SELECT d.*, e.name as employee_name, e.role as employee_role, e.avatar as employee_avatar,
           e.category as employee_category, e.agent_type as agent_type,
           e.is_published as is_published, e.publish_status as publish_status
    FROM deployments d
    JOIN ai_employees e ON d.employee_id = e.id
    WHERE d.user_id = ?
    ORDER BY d.created_at DESC
  `).all(userId) as any[];
}

export function findById(id: string): DeploymentRow | undefined {
  return getDb().prepare("SELECT * FROM deployments WHERE id = ?").get(id) as DeploymentRow | undefined;
}

export function findByIdAndUser(id: string, userId: string): DeploymentRow | undefined {
  return getDb().prepare("SELECT * FROM deployments WHERE id = ? AND user_id = ?").get(id, userId) as DeploymentRow | undefined;
}

/* ---- Write ---- */

export function create(params: {
  id: string;
  userId: string;
  employeeId: string;
  name: string;
  config: string;
  defaultModel: string;
  modelTier: string;
}): void {
  getDb().prepare(`
    INSERT INTO deployments (id, user_id, employee_id, name, status, config, default_model, model_tier)
    VALUES (?, ?, ?, ?, 'configuring', ?, ?, ?)
  `).run(params.id, params.userId, params.employeeId, params.name, params.config, params.defaultModel, params.modelTier);
}

export function cloneDeployment(params: {
  newId: string;
  userId: string;
  employeeId: string;
  name: string;
  config: string;
  defaultModel: string | null;
  modelTier: string | null;
}): void {
  getDb().prepare(`
    INSERT INTO deployments (id, user_id, employee_id, name, status, config, default_model, model_tier, created_at)
    VALUES (?, ?, ?, ?, 'configuring', ?, ?, ?, datetime('now'))
  `).run(params.newId, params.userId, params.employeeId, params.name, params.config, params.defaultModel, params.modelTier);
}

export function updateStatus(id: string, status: string): void {
  if (status === "active") {
    getDb().prepare("UPDATE deployments SET status = ?, deployed_at = datetime('now') WHERE id = ?").run(status, id);
  } else {
    getDb().prepare("UPDATE deployments SET status = ? WHERE id = ?").run(status, id);
  }
}

export function updateConfig(id: string, config: string): void {
  getDb().prepare("UPDATE deployments SET config = ? WHERE id = ?").run(config, id);
}

export function activate(id: string): void {
  getDb().prepare("UPDATE deployments SET status = 'active', deployed_at = datetime('now') WHERE id = ?").run(id);
}

/**
 * Hard-delete a deployment and all related rows.
 * Uses an explicit transaction since FK cascades are inconsistent.
 */
export function deleteWithCascade(id: string): void {
  const db = getDb();
  db.pragma("foreign_keys = OFF");
  const run = db.transaction(() => {
    const related = [
      "conversations", "messages", "performance_metrics", "knowledge_sources",
      "notifications", "scheduled_tasks", "task_runs", "task_logs",
      "usage_logs", "deployment_tool_bindings", "deployment_knowledge_bindings",
      "tool_execution_logs", "activity_logs", "approval_requests", "config_versions",
    ];
    for (const table of related) {
      try { db.prepare(`DELETE FROM ${table} WHERE deployment_id = ?`).run(id); } catch { /* table may not exist */ }
    }
    db.prepare("DELETE FROM deployments WHERE id = ?").run(id);
  });
  run();
  db.pragma("foreign_keys = ON");
}
