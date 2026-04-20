import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const deploymentId = searchParams.get("deploymentId");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

  const db = getDb();

  let query = `
    SELECT ar.*, d.name as deployment_name
    FROM approval_requests ar
    LEFT JOIN deployments d ON ar.deployment_id = d.id
    WHERE ar.user_id = ?
  `;
  const params: any[] = [user.id];

  if (status) {
    query += " AND ar.status = ?";
    params.push(status);
  }
  if (deploymentId) {
    query += " AND ar.deployment_id = ?";
    params.push(deploymentId);
  }

  query += " ORDER BY ar.created_at DESC LIMIT ?";
  params.push(limit);

  // Expire any stale pending requests first
  try {
    db.prepare(`
      UPDATE approval_requests
      SET status = 'expired', decided_at = datetime('now')
      WHERE user_id = ? AND status = 'pending' AND expires_at < datetime('now')
    `).run(user.id);
  } catch {
    // ignore
  }

  const rows = db.prepare(query).all(...params);

  const approvals = (rows as any[]).map((r) => ({
    ...r,
    payload: JSON.parse(r.payload || "{}"),
  }));

  return NextResponse.json({ approvals });
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { id, status, note } = body as {
    id: string;
    status: "approved" | "rejected";
    note?: string;
  };

  if (!id || !["approved", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid request. Provide id and status (approved|rejected)." },
      { status: 400 },
    );
  }

  const db = getDb();

  // Verify ownership and pending status
  const existing = db
    .prepare("SELECT * FROM approval_requests WHERE id = ? AND user_id = ?")
    .get(id, user.id) as any;

  if (!existing) {
    return NextResponse.json({ error: "Approval request not found" }, { status: 404 });
  }

  if (existing.status !== "pending") {
    return NextResponse.json(
      { error: `Request already ${existing.status}` },
      { status: 409 },
    );
  }

  // Check expiry
  if (existing.expires_at && new Date(existing.expires_at).getTime() < Date.now()) {
    db.prepare(
      "UPDATE approval_requests SET status = 'expired', decided_at = datetime('now') WHERE id = ?",
    ).run(id);
    return NextResponse.json({ error: "Request has expired" }, { status: 410 });
  }

  db.prepare(`
    UPDATE approval_requests
    SET status = ?, decided_at = datetime('now'), decision_note = ?
    WHERE id = ?
  `).run(status, note || null, id);

  return NextResponse.json({ success: true, id, status });
}
