import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const db = getDb();
  const url = new URL(req.url);
  const deploymentId = url.searchParams.get("deploymentId");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  const typeFilter = url.searchParams.get("type"); // comma-separated

  const conditions: string[] = ["a.user_id = ?"];
  const params: (string | number)[] = [user.id];

  if (deploymentId) {
    conditions.push("a.deployment_id = ?");
    params.push(deploymentId);
  }

  if (typeFilter) {
    const types = typeFilter.split(",").map((t) => t.trim()).filter(Boolean);
    if (types.length > 0) {
      conditions.push(`a.type IN (${types.map(() => "?").join(",")})`);
      params.push(...types);
    }
  }

  const where = conditions.join(" AND ");

  const countRow = db
    .prepare(`SELECT COUNT(*) as total FROM activity_logs a WHERE ${where}`)
    .get(...params) as { total: number };
  const total = countRow?.total ?? 0;

  const activities = db
    .prepare(
      `SELECT a.*, d.name as deployment_name
       FROM activity_logs a
       LEFT JOIN deployments d ON a.deployment_id = d.id
       WHERE ${where}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as any[];

  const parsed = activities.map((row) => ({
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
