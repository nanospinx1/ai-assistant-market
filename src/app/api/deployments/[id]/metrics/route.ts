// GET /api/deployments/[id]/metrics — Get performance metrics for a deployment
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const db = getDb();
  const days = parseInt(req.nextUrl.searchParams.get("days") || "30");

  const metrics = db
    .prepare(
      `SELECT * FROM performance_metrics
       WHERE deployment_id = ?
       ORDER BY recorded_at DESC
       LIMIT ?`
    )
    .all(deploymentId, days * 4);

  return NextResponse.json(metrics);
}
