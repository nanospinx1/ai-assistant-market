import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import * as PerformanceRepo from "@/lib/repositories/performance";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
  const metrics = PerformanceRepo.getMetrics(deploymentId, days);

  return NextResponse.json(metrics);
}
