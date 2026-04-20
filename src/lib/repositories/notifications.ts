/**
 * Notifications repository — notifications table.
 */
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

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

/** Create a notification. Never throws — failures are logged and swallowed. */
export function create(params: CreateNotificationParams): void {
  try {
    getDb().prepare(
      `INSERT INTO notifications (id, user_id, deployment_id, type, title, message, link)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(uuid(), params.userId, params.deploymentId ?? null, params.type, params.title, params.message ?? null, params.link ?? null);
  } catch (err) {
    console.error("[notifications] Failed to create:", err);
  }
}

export function listByUser(userId: string, unreadOnly: boolean, limit: number) {
  let query = "SELECT * FROM notifications WHERE user_id = ?";
  const params: (string | number)[] = [userId];
  if (unreadOnly) { query += " AND is_read = 0"; }
  query += " ORDER BY created_at DESC LIMIT ?";
  params.push(limit);
  return getDb().prepare(query).all(...params) as any[];
}

export function unreadCount(userId: string): number {
  return (getDb().prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0").get(userId) as any).count;
}

export function markAllRead(userId: string): void {
  getDb().prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0").run(userId);
}

export function markRead(userId: string, ids: string[]): void {
  const placeholders = ids.map(() => "?").join(", ");
  getDb().prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${placeholders})`).run(userId, ...ids);
}
