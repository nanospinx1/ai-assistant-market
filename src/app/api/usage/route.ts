// GET /api/usage — Get usage summary and quota status for the authenticated user

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getQuotaStatus, getUsageSummary } from "@/lib/agents/usage-meter";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30", 10);

  const quota = getQuotaStatus(user.id);
  const usage = getUsageSummary(user.id, days);

  return NextResponse.json({ quota, usage, period: `${days} days` });
}
