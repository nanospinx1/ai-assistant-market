import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export interface ApprovalRequest {
  id: string;
  deployment_id: string;
  user_id: string;
  tool_name: string;
  action: string;
  title: string;
  description: string | null;
  payload: string;
  status: "pending" | "approved" | "rejected" | "expired";
  decided_at: string | null;
  decision_note: string | null;
  expires_at: string | null;
  created_at: string;
}

/**
 * Create a new approval request for a high-stakes agent action.
 * Returns the approval ID.
 */
export function createApprovalRequest(params: {
  deploymentId: string;
  userId: string;
  toolName: string;
  action: string;
  title: string;
  description?: string;
  payload: Record<string, any>;
  expiresInMinutes?: number;
}): string {
  const db = getDb();
  const id = uuid();
  const expiresInMinutes = params.expiresInMinutes ?? 60;
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

  try {
    db.prepare(`
      INSERT INTO approval_requests (id, deployment_id, user_id, tool_name, action, title, description, payload, status, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      id,
      params.deploymentId,
      params.userId,
      params.toolName,
      params.action,
      params.title,
      params.description ?? null,
      JSON.stringify(params.payload),
      expiresAt,
    );
  } catch (err) {
    console.error("[approval] Failed to create approval request:", err);
    throw err;
  }

  return id;
}

/**
 * Check whether a deployment requires approval for a specific tool + action.
 * Reads the deployment's config.approvalSettings.
 */
export function checkApprovalRequired(
  deploymentId: string,
  toolName: string,
  _action: string,
): boolean {
  try {
    const db = getDb();
    const row = db
      .prepare("SELECT config FROM deployments WHERE id = ?")
      .get(deploymentId) as { config: string } | undefined;

    if (!row) return false;

    const config = JSON.parse(row.config || "{}");
    const approvalSettings = config.approvalSettings as Record<string, boolean> | undefined;

    if (!approvalSettings) return false;

    // toolName can be display name ("Email") or type id ("email")
    const normalised = toolName.toLowerCase();
    return approvalSettings[normalised] === true;
  } catch {
    return false;
  }
}

/**
 * Get the current status of an approval request.
 * Automatically marks expired requests.
 */
export function getApprovalStatus(
  approvalId: string,
): "pending" | "approved" | "rejected" | "expired" {
  const db = getDb();
  const row = db
    .prepare("SELECT status, expires_at FROM approval_requests WHERE id = ?")
    .get(approvalId) as { status: string; expires_at: string | null } | undefined;

  if (!row) return "expired";

  // Check if pending request has expired
  if (row.status === "pending" && row.expires_at) {
    const expiresAt = new Date(row.expires_at).getTime();
    if (Date.now() > expiresAt) {
      try {
        db.prepare(
          "UPDATE approval_requests SET status = 'expired', decided_at = datetime('now') WHERE id = ? AND status = 'pending'",
        ).run(approvalId);
      } catch {
        // ignore
      }
      return "expired";
    }
  }

  return row.status as "pending" | "approved" | "rejected" | "expired";
}
