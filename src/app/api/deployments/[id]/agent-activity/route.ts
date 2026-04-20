import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import * as ActivityRepo from "@/lib/repositories/activity";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { deployment, error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);
  const typeFilter = url.searchParams.get("type") || undefined;

  const { activities, stats } = ActivityRepo.listAgentActivity(deploymentId, { typeFilter, limit });

  const parsed = activities.map((row: any) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    status: row.status,
    createdAt: row.created_at,
  }));

  const summary = {
    totalOperations: stats.reduce((sum: number, s: any) => sum + s.count, 0),
    chatInteractions: stats.find((s: any) => s.type === "chat")?.count || 0,
    toolCalls: stats.find((s: any) => s.type === "tool_call")?.count || 0,
    tasksCompleted: stats.find((s: any) => s.type === "task_complete")?.count || 0,
    errors: stats.reduce((sum: number, s: any) => sum + s.errors, 0),
  };

  return NextResponse.json({
    activities: parsed,
    summary,
    deployment: {
      id: deployment.id,
      name: deployment.name,
      status: deployment.status,
    },
  });
}
