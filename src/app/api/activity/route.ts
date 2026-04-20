import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as ActivityRepo from "@/lib/repositories/activity";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const url = new URL(req.url);
  const deploymentId = url.searchParams.get("deploymentId") || undefined;
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  const typeFilter = url.searchParams.get("type") || undefined;

  const { rows, total } = ActivityRepo.listByUser(user.id, { deploymentId, typeFilter, limit, offset });

  const parsed = rows.map((row: any) => ({
    id: row.id,
    deploymentId: row.deployment_id,
    deploymentName: row.deployment_name,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    description: row.description,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    status: row.status,
    createdAt: row.created_at,
  }));

  return NextResponse.json({
    activities: parsed,
    total,
    hasMore: offset + limit < total,
  });
}
