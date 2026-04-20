/**
 * Activity logs repository — activity_logs table.
 */
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export type ActivityType = "chat" | "tool_call" | "error" | "status_change" | "onboarding" | "task_complete" | "config_change";
export type ActivityStatus = "success" | "error" | "pending" | "warning";

export interface LogActivityParams {
  deploymentId: string;
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  status?: ActivityStatus;
}

/** Log an activity event. Never throws — failures are logged and swallowed. */
export function log(params: LogActivityParams): void {
  try {
    getDb().prepare(
      `INSERT INTO activity_logs (id, deployment_id, user_id, type, title, description, metadata, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      uuid(), params.deploymentId, params.userId, params.type, params.title,
      params.description ?? null,
      params.metadata ? JSON.stringify(params.metadata) : null,
      params.status ?? "success",
    );
  } catch (err) {
    console.error("[activity] Failed to log:", err);
  }
}

export function listByUser(
  userId: string,
  opts: { deploymentId?: string; typeFilter?: string; limit: number; offset: number },
) {
  const conditions: string[] = ["a.user_id = ?"];
  const params: (string | number)[] = [userId];

  if (opts.deploymentId) {
    conditions.push("a.deployment_id = ?");
    params.push(opts.deploymentId);
  }
  if (opts.typeFilter) {
    const types = opts.typeFilter.split(",").map((t) => t.trim()).filter(Boolean);
    if (types.length > 0) {
      conditions.push(`a.type IN (${types.map(() => "?").join(",")})`);
      params.push(...types);
    }
  }

  const where = conditions.join(" AND ");

  const countRow = getDb()
    .prepare(`SELECT COUNT(*) as total FROM activity_logs a WHERE ${where}`)
    .get(...params) as { total: number };

  const rows = getDb()
    .prepare(`
      SELECT a.*, d.name as deployment_name
      FROM activity_logs a
      LEFT JOIN deployments d ON a.deployment_id = d.id
      WHERE ${where}
      ORDER BY a.created_at DESC LIMIT ? OFFSET ?
    `)
    .all(...params, opts.limit, opts.offset) as any[];

  return { rows, total: countRow?.total ?? 0 };
}

/** Agent-operational activity for a specific deployment. */
export function listAgentActivity(
  deploymentId: string,
  opts: { typeFilter?: string; limit: number },
) {
  const agentTypes = ["chat", "tool_call", "task_complete", "error"];
  const params: (string | number)[] = [deploymentId];
  let typeCondition: string;

  if (opts.typeFilter && opts.typeFilter !== "all") {
    const types = opts.typeFilter.split(",").filter((t) => agentTypes.includes(t.trim()));
    const effective = types.length > 0 ? types : agentTypes;
    typeCondition = `AND a.type IN (${effective.map(() => "?").join(",")})`;
    params.push(...effective);
  } else {
    typeCondition = `AND a.type IN (${agentTypes.map(() => "?").join(",")})`;
    params.push(...agentTypes);
  }

  const activities = getDb().prepare(`
    SELECT a.id, a.type, a.title, a.description, a.metadata, a.status, a.created_at
    FROM activity_logs a
    WHERE a.deployment_id = ? ${typeCondition}
    ORDER BY a.created_at DESC LIMIT ?
  `).all(...params, opts.limit) as any[];

  const stats = getDb().prepare(`
    SELECT type, COUNT(*) as count, SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors
    FROM activity_logs
    WHERE deployment_id = ? AND type IN (${agentTypes.map(() => "?").join(",")})
    GROUP BY type
  `).all(deploymentId, ...agentTypes) as any[];

  return { activities, stats };
}

/** Recent activity preview (for workspace hub). */
export function recentForDeployment(deploymentId: string, userId: string, limit = 5) {
  return getDb().prepare(`
    SELECT id, type, title, description, metadata, created_at
    FROM activity_logs
    WHERE deployment_id = ? AND user_id = ?
    ORDER BY created_at DESC LIMIT ?
  `).all(deploymentId, userId, limit) as any[];
}
