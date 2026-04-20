import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as ApprovalRepo from "@/lib/repositories/approvals";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

  // Expire stale pending requests first
  try { ApprovalRepo.expirePending(); } catch { /* ignore */ }

  const { rows } = ApprovalRepo.listByUser(user.id, { status, limit, offset: 0 });

  const approvals = rows.map((r: any) => ({
    ...r,
    payload: JSON.parse(r.payload || r.metadata || "{}"),
  }));

  return NextResponse.json({ approvals });
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id, status, note } = await req.json() as { id: string; status: "approved" | "rejected"; note?: string };

  if (!id || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Provide id and status (approved|rejected)." }, { status: 400 });
  }

  const existing = ApprovalRepo.findByIdAndUser(id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Approval request not found" }, { status: 404 });
  }
  if (existing.status !== "pending") {
    return NextResponse.json({ error: `Request already ${existing.status}` }, { status: 409 });
  }
  if (existing.expires_at && new Date(existing.expires_at).getTime() < Date.now()) {
    ApprovalRepo.updateStatus(id, "expired");
    return NextResponse.json({ error: "Request has expired" }, { status: 410 });
  }

  ApprovalRepo.updateStatus(id, status, note);
  return NextResponse.json({ success: true, id, status });
}
