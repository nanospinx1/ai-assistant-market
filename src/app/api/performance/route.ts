import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  seedDatabase();
  const db = getDb();
  const userId = user.id;

  const summary = db.prepare(`
    SELECT d.id as deployment_id, d.name as deployment_name, d.status,
      e.name as employee_name, e.avatar as employee_avatar, e.category as employee_category,
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
    id: s.deployment_id,
    name: s.deployment_name,
    deploymentId: s.deployment_id,
    deploymentName: s.deployment_name,
    employeeName: s.employee_name,
    employeeAvatar: s.employee_avatar,
    employeeCategory: s.employee_category,
    avgTasks: s.avg_tasks,
    avgResponseTime: s.avg_response_time,
    avgAccuracy: s.avg_accuracy,
    avgUptime: s.avg_uptime,
  }));

  return NextResponse.json(mapped);
}
