// GET /api/deployments/[id]/workspace — Lightweight overview for the agent workspace hub
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id: deploymentId } = await params;
    const { deployment, error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
    if (ownerError) return ownerError;

    const db = getDb();

  // Parent employee info
  const employee = db
    .prepare("SELECT id, name, role, category, description, is_prebuilt, avatar FROM ai_employees WHERE id = ?")
    .get(deployment.employee_id) as any;

  // Recent metrics - EAV format: metric_type + value
  const rawMetrics = db
    .prepare(
      `SELECT metric_type, value, recorded_at
       FROM performance_metrics
       WHERE deployment_id = ?
       ORDER BY recorded_at DESC
       LIMIT 200`
    )
    .all(deploymentId) as any[];

  // Aggregate metrics by type
  const metricsByType: Record<string, number[]> = {};
  for (const m of rawMetrics) {
    if (!metricsByType[m.metric_type]) metricsByType[m.metric_type] = [];
    metricsByType[m.metric_type].push(m.value);
  }
  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
  const sum = (arr: number[]) => arr.reduce((s, v) => s + v, 0);

  const avgAccuracy = Math.round(avg(metricsByType["accuracy"] || []));
  const totalTasks = Math.round(sum(metricsByType["tasks_completed"] || []));
  const avgUptime = parseFloat(avg(metricsByType["uptime"] || []).toFixed(1));
  const avgResponseTime = Math.round(avg(metricsByType["response_time"] || []));

  // Recent activity (last 5 for preview)
  const recentActivity = db
    .prepare(
      `SELECT id, type, title, description, metadata, created_at
       FROM activity_logs
       WHERE deployment_id = ? AND user_id = ?
       ORDER BY created_at DESC
       LIMIT 5`
    )
    .all(deploymentId, user.id) as any[];

  // Active scheduled tasks count
  const taskStats = db
    .prepare(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
         SUM(run_count) as totalRuns
       FROM scheduled_tasks
       WHERE deployment_id = ? AND user_id = ?`
    )
    .get(deploymentId, user.id) as any;

  // Conversation count
  const convStats = db
    .prepare(
      `SELECT COUNT(*) as total FROM conversations WHERE deployment_id = ?`
    )
    .get(deploymentId) as any;

  const config = JSON.parse(deployment.config || "{}");

  return NextResponse.json({
    agent: {
      deploymentId,
      name: deployment.name,
      status: deployment.status,
      createdAt: deployment.created_at,
      deployedAt: deployment.deployed_at,
      employeeName: employee?.name || deployment.name,
      employeeRole: employee?.role || "",
      employeeCategory: employee?.category || "",
      employeeDescription: employee?.description || "",
      isPrebuilt: employee?.is_prebuilt === 1,
      schedule: config.schedule || "",
      tools: config.tools || [],
    },
    metrics: {
      accuracy: avgAccuracy,
      totalTasks,
      uptime: avgUptime,
      avgResponseTime,
      dataPoints: rawMetrics.length,
    },
    recentActivity: recentActivity.map((a: any) => ({
      id: a.id,
      action: a.type || a.title,
      details: a.description || a.title,
      metadata: a.metadata ? JSON.parse(a.metadata) : null,
      createdAt: a.created_at,
    })),
    tasks: {
      total: taskStats?.total || 0,
      active: taskStats?.active || 0,
      totalRuns: taskStats?.totalRuns || 0,
    },
    conversations: {
      total: convStats?.total || 0,
    },
  });
  } catch (err: any) {
    console.error("Workspace API error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
