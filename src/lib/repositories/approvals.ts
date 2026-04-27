/**
 * Approval requests repository — approval_requests table.
 * Schema columns: id, deployment_id, user_id, tool_name, action, title,
 *   description, payload, status, decided_at, decision_note, expires_at, created_at
 */
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";

export interface ApprovalRow {
  id: string;
  deployment_id: string;
  user_id: string;
  tool_name: string;
  action: string;
  title: string;
  description: string | null;
  payload: string | null;
  status: ApprovalStatus;
  decision_note: string | null;
  decided_at: string | null;
  expires_at: string | null;
  created_at: string;
}

/* ---- Read ---- */

export function listByUser(userId: string, opts: { status?: string; limit: number; offset: number }) {
  const conditions: string[] = ["user_id = ?"];
  const params: (string | number)[] = [userId];
  if (opts.status) {
    conditions.push("status = ?");
    params.push(opts.status);
  }
  const where = conditions.join(" AND ");
  const total = (getDb().prepare(`SELECT COUNT(*) as c FROM approval_requests WHERE ${where}`).get(...params) as any).c;
  const rows = getDb()
    .prepare(`SELECT * FROM approval_requests WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, opts.limit, opts.offset) as ApprovalRow[];
  return { rows, total };
}

export function findById(id: string): ApprovalRow | undefined {
  return getDb().prepare("SELECT * FROM approval_requests WHERE id = ?").get(id) as ApprovalRow | undefined;
}

export function findByIdAndUser(id: string, userId: string): ApprovalRow | undefined {
  return getDb()
    .prepare("SELECT * FROM approval_requests WHERE id = ? AND user_id = ?")
    .get(id, userId) as ApprovalRow | undefined;
}

export function countByStatus(userId: string) {
  return getDb()
    .prepare(`
      SELECT status, COUNT(*) as count
      FROM approval_requests WHERE user_id = ?
      GROUP BY status
    `)
    .all(userId) as { status: string; count: number }[];
}

/* ---- Write ---- */

export function create(params: {
  deploymentId: string;
  userId: string;
  toolName: string;
  action: string;
  title: string;
  description?: string;
  payload?: Record<string, unknown>;
  expiresAt?: string;
}): string {
  const id = uuid();
  getDb().prepare(`
    INSERT INTO approval_requests (id, deployment_id, user_id, tool_name, action, title, description, payload, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, params.deploymentId, params.userId, params.toolName, params.action, params.title,
    params.description ?? null,
    params.payload ? JSON.stringify(params.payload) : null,
    params.expiresAt ?? null,
  );
  return id;
}

export function updateStatus(id: string, status: ApprovalStatus, decisionNote?: string): boolean {
  const result = getDb().prepare(`
    UPDATE approval_requests
    SET status = ?, decision_note = ?, decided_at = datetime('now')
    WHERE id = ?
  `).run(status, decisionNote ?? null, id);
  return result.changes > 0;
}

/** Expire stale pending approvals. */
export function expirePending(): number {
  const result = getDb().prepare(`
    UPDATE approval_requests
    SET status = 'expired', reviewed_at = datetime('now')
    WHERE status = 'pending' AND expires_at IS NOT NULL AND expires_at < datetime('now')
  `).run();
  return result.changes;
}

/** Check whether a deployment action needs approval. */
export function checkRequired(_deploymentId: string, _action: string): boolean {
  // Approval settings are not yet stored in user_settings.
  // Return false (no approval required) until this feature is built out.
  return false;
}
