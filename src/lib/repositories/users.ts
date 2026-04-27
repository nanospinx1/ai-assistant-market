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
  email_verified: number;
  verify_code: string | null;
  verify_code_expires_at: string | null;
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

/* ---- Email Verification ---- */

export function generateVerifyCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function setVerifyCode(userId: string, code: string): void {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min
  getDb().prepare(
    "UPDATE users SET verify_code = ?, verify_code_expires_at = ?, email_verified = 0 WHERE id = ?"
  ).run(code, expiresAt, userId);
}

export function verifyEmail(userId: string, code: string): boolean {
  const user = getDb().prepare(
    "SELECT verify_code, verify_code_expires_at FROM users WHERE id = ?"
  ).get(userId) as { verify_code: string | null; verify_code_expires_at: string | null } | undefined;

  if (!user || !user.verify_code || user.verify_code !== code) return false;

  // Check expiry
  if (user.verify_code_expires_at && new Date(user.verify_code_expires_at) < new Date()) {
    return false;
  }

  getDb().prepare(
    "UPDATE users SET email_verified = 1, verify_code = NULL, verify_code_expires_at = NULL WHERE id = ?"
  ).run(userId);
  return true;
}

export function isEmailVerified(userId: string): boolean {
  const row = getDb().prepare("SELECT email_verified FROM users WHERE id = ?").get(userId) as { email_verified: number } | undefined;
  return row?.email_verified === 1;
}
