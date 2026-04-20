/**
 * User repository — SQL access for users and user_settings tables.
 */
import { getDb } from "@/lib/db";
import bcryptjs from "bcryptjs";

export interface UserRow {
  id: string;
  email: string;
  name: string;
  company: string | null;
  password: string;
  created_at: string;
}

export interface UserSettingsRow {
  user_id: string;
  company_name: string | null;
  industry: string | null;
  company_size: string | null;
  team_size: string | null;
  customer_volume: string | null;
  business_type: string | null;
  notification_email_errors: number;
  notification_email_tasks: number;
  notification_email_weekly: number;
  notification_inapp: string;
  notification_status_alerts: number;
  default_model_tier: string;
  updated_at: string;
}

/* ---- Read ---- */

export function findUserById(id: string): UserRow | undefined {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
}

export function findUserByEmail(email: string): UserRow | undefined {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
}

export function getUserSettings(userId: string): UserSettingsRow {
  const db = getDb();
  let settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(userId) as UserSettingsRow | undefined;
  if (!settings) {
    db.prepare("INSERT INTO user_settings (user_id) VALUES (?)").run(userId);
    settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(userId) as UserSettingsRow;
  }
  return settings;
}

/* ---- Write ---- */

export function createUser(id: string, email: string, name: string, hashedPassword: string, company?: string): void {
  getDb().prepare(
    "INSERT INTO users (id, email, name, password, company) VALUES (?, ?, ?, ?, ?)"
  ).run(id, email, name, hashedPassword, company || null);
}

export function updateUserName(userId: string, name: string): void {
  getDb().prepare("UPDATE users SET name = ? WHERE id = ?").run(name, userId);
}

export function updateUserPassword(userId: string, hashedPassword: string): void {
  getDb().prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, userId);
}

export function updateSettings(userId: string, fields: Record<string, unknown>): void {
  if (Object.keys(fields).length === 0) return;
  const db = getDb();
  // Ensure row exists
  const existing = db.prepare("SELECT user_id FROM user_settings WHERE user_id = ?").get(userId);
  if (!existing) db.prepare("INSERT INTO user_settings (user_id) VALUES (?)").run(userId);

  const setClauses = Object.keys(fields).map((k) => `${k} = ?`).join(", ");
  const values = Object.values(fields);
  db.prepare(`UPDATE user_settings SET ${setClauses}, updated_at = datetime('now') WHERE user_id = ?`)
    .run(...values, userId);
}

/** Validate a plain-text password against the stored hash. */
export function verifyPassword(plain: string, hash: string): boolean {
  return bcryptjs.compareSync(plain, hash);
}

export function hashPassword(plain: string): string {
  return bcryptjs.hashSync(plain, 10);
}
