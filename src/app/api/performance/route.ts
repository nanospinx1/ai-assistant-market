import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

export async function GET(req: NextRequest) {
  seedDatabase();
  const db = getDb();
  const deploymentId = req.nextUrl.searchParams.get("deploymentId");
  const userId = req.nextUrl.searchParams.get("userId");
  const days = parseInt(req.nextUrl.searchParams.get("days") || "30");

  if (deploymentId) {
    const metrics = db.prepare(`
      SELECT * FROM performance_metrics
      WHERE deployment_id = ?
      ORDER BY recorded_at DESC
      LIMIT ?
    `).all(deploymentId, days * 4);

    return NextResponse.json(metrics);
  }

  if (userId) {
    const summary = db.prepare(`
      SELECT d.id as deployment_id, d.name as deployment_name, d.status,
        e.name as employee_name, e.avatar as employee_avatar,
        ROUND(AVG(CASE WHEN pm.metric_type = 'tasks_completed' THEN pm.value END), 1) as avg_tasks,
        ROUND(AVG(CASE WHEN pm.metric_type = 'response_time' THEN pm.value END), 2) as avg_response_time,
        ROUND(AVG(CASE WHEN pm.metric_type = 'accuracy' THEN pm.value END), 1) as avg_accuracy,
        ROUND(AVG(CASE WHEN pm.metric_type = 'uptime' THEN pm.value END), 1) as avg_uptime
      FROM deployments d
      JOIN ai_employees e ON d.employee_id = e.id
      LEFT JOIN performance_metrics pm ON d.id = pm.deployment_id
      WHERE d.user_id = ?
      GROUP BY d.id
    `).all(userId);

    const mapped = summary.map((s: any) => ({
      ...s,
      deploymentId: s.deployment_id,
      deploymentName: s.deployment_name,
      employeeName: s.employee_name,
      employeeAvatar: s.employee_avatar,
      avgTasks: s.avg_tasks,
      avgResponseTime: s.avg_response_time,
      avgAccuracy: s.avg_accuracy,
      avgUptime: s.avg_uptime,
    }));

    return NextResponse.json(mapped);
  }

  return NextResponse.json({ error: "deploymentId or userId required" }, { status: 400 });
}
