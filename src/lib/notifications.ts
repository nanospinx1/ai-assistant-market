import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export type NotificationType =
  | "error"
  | "task_complete"
  | "status_change"
  | "quota_warning"
  | "onboarding_reminder"
  | "publish_update";

export interface CreateNotificationParams {
  userId: string;
  deploymentId?: string;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
}

/**
 * Create a notification for a user. Wrapped in try/catch so it never breaks callers.
 */
export function createNotification(params: CreateNotificationParams): void {
  try {
    const db = getDb();
    const id = uuidv4();
    db.prepare(
      `INSERT INTO notifications (id, user_id, deployment_id, type, title, message, link)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      params.userId,
      params.deploymentId ?? null,
      params.type,
      params.title,
      params.message ?? null,
      params.link ?? null
    );
  } catch (err) {
    console.error("[notifications] Failed to create notification:", err);
  }
}
