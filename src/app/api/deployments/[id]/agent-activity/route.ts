import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/deployments/[id]/agent-activity
 * Returns agent operational activity — what the agent has done (tasks, interactions, tool calls).
 * Excludes user config actions (those go to the dashboard's recent activity).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const db = getDb();

  // Verify ownership
  const dep = db
    .prepare("SELECT id, name, status, employee_id, config, created_at FROM deployments WHERE id = ? AND user_id = ?")
    .get(deploymentId, user.id) as any;
  if (!dep) {
    return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);
  const typeFilter = url.searchParams.get("type");

  // Agent-operational activity types (not user config actions)
  const agentTypes = ["chat", "tool_call", "task_complete", "error"];
  let typeCondition: string;
  const params2: (string | number)[] = [deploymentId];

  if (typeFilter && typeFilter !== "all") {
    const types = typeFilter.split(",").filter((t) => agentTypes.includes(t.trim()));
    if (types.length > 0) {
      typeCondition = `AND a.type IN (${types.map(() => "?").join(",")})`;
      params2.push(...types);
    } else {
      typeCondition = `AND a.type IN (${agentTypes.map(() => "?").join(",")})`;
      params2.push(...agentTypes);
    }
  } else {
    typeCondition = `AND a.type IN (${agentTypes.map(() => "?").join(",")})`;
    params2.push(...agentTypes);
  }

  const activities = db
    .prepare(
      `SELECT a.id, a.type, a.title, a.description, a.metadata, a.status, a.created_at
       FROM activity_logs a
       WHERE a.deployment_id = ? ${typeCondition}
       ORDER BY a.created_at DESC
       LIMIT ?`
    )
    .all(...params2, limit) as any[];

  const parsed = activities.map((row: any) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    status: row.status,
    createdAt: row.created_at,
  }));

  // Also provide summary stats
  const stats = db
    .prepare(
      `SELECT type, COUNT(*) as count, SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors
       FROM activity_logs
       WHERE deployment_id = ? AND type IN (${agentTypes.map(() => "?").join(",")})
       GROUP BY type`
    )
    .all(deploymentId, ...agentTypes) as any[];

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
      id: dep.id,
      name: dep.name,
      status: dep.status,
    },
  });
}
