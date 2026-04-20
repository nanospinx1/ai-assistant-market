import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as PerformanceRepo from "@/lib/repositories/performance";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const summary = PerformanceRepo.getUserPerformanceSummary(user.id);

  const mapped = summary.map((s: any) => ({
    ...s,
    id: s.deployment_id,
    name: s.deployment_name,
    deploymentId: s.deployment_id,
    deploymentName: s.deployment_name,
    employeeName: s.employee_name,
    employeeAvatar: s.employee_avatar,
    employeeCategory: s.employee_category,
    employeeRole: s.employee_role,
    avgTasks: s.avg_tasks,
    avgResponseTime: s.avg_response_time,
    avgAccuracy: s.avg_accuracy,
    avgUptime: s.avg_uptime,
  }));

  return NextResponse.json(mapped);
}
