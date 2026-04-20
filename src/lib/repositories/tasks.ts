/**
 * Scheduled tasks repository — scheduled_tasks + task_runs tables.
 */
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export interface TaskRow {
  id: string;
  deployment_id: string;
  user_id: string;
  name: string;
  description: string | null;
  schedule_type: string;
  schedule_config: string | null;
  task_prompt: string;
  is_active: number;
  run_count: number;
  last_run_at: string | null;
  created_at: string;
}

/* ---- Read ---- */

export function listByDeployment(deploymentId: string, userId: string): TaskRow[] {
  return getDb()
    .prepare("SELECT * FROM scheduled_tasks WHERE deployment_id = ? AND user_id = ? ORDER BY created_at DESC")
    .all(deploymentId, userId) as TaskRow[];
}

export function listByUser(userId: string): TaskRow[] {
  return getDb()
    .prepare("SELECT * FROM scheduled_tasks WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as TaskRow[];
}

export function findByIdAndUser(id: string, userId: string): TaskRow | undefined {
  return getDb()
    .prepare("SELECT * FROM scheduled_tasks WHERE id = ? AND user_id = ?")
    .get(id, userId) as TaskRow | undefined;
}

/* ---- Write ---- */

export function createTask(params: {
  deploymentId: string;
  userId: string;
  name: string;
  description?: string;
  scheduleType: string;
  scheduleConfig?: Record<string, any>;
  taskPrompt: string;
}): TaskRow {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO scheduled_tasks (id, deployment_id, user_id, name, description, schedule_type, schedule_config, task_prompt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, params.deploymentId, params.userId, params.name,
    params.description || null, params.scheduleType,
    params.scheduleConfig ? JSON.stringify(params.scheduleConfig) : null,
    params.taskPrompt,
  );
  return db.prepare("SELECT * FROM scheduled_tasks WHERE id = ?").get(id) as TaskRow;
}

export function updateTask(id: string, fields: Record<string, unknown>): TaskRow | undefined {
  if (Object.keys(fields).length === 0) return undefined;
  const db = getDb();
  const sets = Object.keys(fields).map((k) => `${k} = ?`);
  const vals = Object.values(fields);
  vals.push(id);
  db.prepare(`UPDATE scheduled_tasks SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
  return db.prepare("SELECT * FROM scheduled_tasks WHERE id = ?").get(id) as TaskRow;
}

export function deleteTask(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM task_runs WHERE task_id = ?").run(id);
  db.prepare("DELETE FROM scheduled_tasks WHERE id = ?").run(id);
}

/* ---- Task runs ---- */

export function listRunsByDeployment(deploymentId: string, userId: string, limit = 50) {
  return getDb().prepare(`
    SELECT tr.*, st.name as task_name, st.schedule_type
    FROM task_runs tr
    JOIN scheduled_tasks st ON tr.task_id = st.id
    WHERE st.deployment_id = ? AND st.user_id = ?
    ORDER BY tr.started_at DESC
    LIMIT ?
  `).all(deploymentId, userId, limit) as any[];
}

export function getTaskStats(deploymentId: string, userId: string) {
  return getDb().prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
      SUM(run_count) as totalRuns
    FROM scheduled_tasks
    WHERE deployment_id = ? AND user_id = ?
  `).get(deploymentId, userId) as { total: number; active: number; totalRuns: number };
}
