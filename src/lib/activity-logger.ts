import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export type ActivityType =
  | "chat"
  | "tool_call"
  | "error"
  | "status_change"
  | "onboarding"
  | "task_complete"
  | "config_change";

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

/**
 * Log an activity event. Wrapped internally so failures never propagate.
 */
export function logActivity(params: LogActivityParams): void {
  try {
    const db = getDb();
    const id = uuidv4();
    db.prepare(
      `INSERT INTO activity_logs (id, deployment_id, user_id, type, title, description, metadata, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      params.deploymentId,
      params.userId,
      params.type,
      params.title,
      params.description ?? null,
      params.metadata ? JSON.stringify(params.metadata) : null,
      params.status ?? "success"
    );
  } catch (err) {
    // Never let logging break the calling code
    console.error("[activity-logger] Failed to log activity:", err);
  }
}
