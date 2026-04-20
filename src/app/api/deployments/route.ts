import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { recommendModel } from "@/lib/agents/model-recommender";
import { seedDeploymentKnowledge } from "@/lib/agents/agent-registry";
import * as DeploymentRepo from "@/lib/repositories/deployments";
import * as EmployeeRepo from "@/lib/repositories/employees";
import * as ActivityRepo from "@/lib/repositories/activity";
import * as NotificationRepo from "@/lib/repositories/notifications";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const deployments = DeploymentRepo.findByUser(user.id);
  const parsed = deployments.map((d: any) => ({
    ...d,
    config: JSON.parse(d.config || "{}"),
    employeeName: d.employee_name,
    employeeRole: d.employee_role,
    employeeAvatar: d.employee_avatar,
    employeeCategory: d.employee_category,
    agentType: d.agent_type,
    isPublished: !!d.is_published,
    publishStatus: d.publish_status,
    deployedAt: d.deployed_at,
    createdAt: d.created_at,
  }));

  return NextResponse.json(parsed);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { id, employee_id, name, config } = body;

  const employee = EmployeeRepo.findById(employee_id);
  const capabilities = employee?.capabilities ? JSON.parse(employee.capabilities) : [];

  const recommendation = recommendModel({
    agentType: employee?.agent_type || "generic",
    toolsCount: Array.isArray(config?.tools) ? config.tools.length : 0,
    dataSourcesCount: Array.isArray(config?.dataSources) ? config.dataSources.length : 0,
    capabilitiesCount: capabilities.length,
    knowledgeContentSize: employee?.agent_type ? 2000 : 0,
    schedule: config?.schedule || "24/7 Always On",
  });

  DeploymentRepo.create({
    id,
    userId: user.id,
    employeeId: employee_id,
    name,
    config: config || {},
    defaultModel: recommendation.modelId,
    modelTier: recommendation.tier,
  });

  seedDeploymentKnowledge(id, employee?.agent_type || "generic");

  ActivityRepo.log({
    deploymentId: id,
    userId: user.id,
    type: "status_change",
    title: "Deployment created",
    description: `Deployed "${name}" with model ${recommendation.modelDisplayName}`,
    metadata: { employeeId: employee_id, modelId: recommendation.modelId, tier: recommendation.tier },
  });

  NotificationRepo.create({
    userId: user.id,
    deploymentId: id,
    type: "task_complete",
    title: "New agent deployed",
    message: `"${name}" is live with model ${recommendation.modelDisplayName}`,
    link: `/deploy/${id}`,
  });

  return NextResponse.json({
    success: true,
    id,
    model: {
      id: recommendation.modelId,
      displayName: recommendation.modelDisplayName,
      tier: recommendation.tier,
      tierLabel: recommendation.tierLabel,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id, status } = await req.json();
  const dep = DeploymentRepo.findByIdAndUser(id, user.id);
  if (!dep) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });

  DeploymentRepo.updateStatus(id, status);

  const labels: Record<string, string> = { active: "resumed", paused: "paused", stopped: "stopped", archived: "archived" };
  ActivityRepo.log({
    deploymentId: id,
    userId: user.id,
    type: "status_change",
    title: `Deployment ${labels[status] || status}`,
    description: `Status changed to ${status}`,
    metadata: { previousStatus: dep.status, newStatus: status },
  });

  NotificationRepo.create({
    userId: user.id,
    deploymentId: id,
    type: "status_change",
    title: `Agent ${labels[status] || status}`,
    message: `Deployment status changed to ${status}`,
    link: `/deploy/${id}`,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await req.json();
  const dep = DeploymentRepo.findByIdAndUser(id, user.id);
  if (!dep) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });

  ActivityRepo.log({
    deploymentId: id,
    userId: user.id,
    type: "status_change",
    title: `Employee "${dep.name}" deleted`,
    description: "Permanently removed from workforce",
    metadata: { deletedName: dep.name },
  });

  try {
    DeploymentRepo.deleteWithCascade(id);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to delete" }, { status: 500 });
  }

  NotificationRepo.create({
    userId: user.id,
    type: "status_change",
    title: "Employee deleted",
    message: `"${dep.name}" has been permanently deleted`,
    link: "/deploy",
  });

  return NextResponse.json({ success: true });
}
