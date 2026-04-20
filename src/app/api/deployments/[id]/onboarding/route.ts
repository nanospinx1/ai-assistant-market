import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import * as EmployeeRepo from "@/lib/repositories/employees";
import * as DeploymentRepo from "@/lib/repositories/deployments";
import * as ActivityRepo from "@/lib/repositories/activity";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { deployment, error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const config = JSON.parse(deployment.config || "{}");
  const onboarding = config.onboarding || {
    connectedTools: [], knowledge: [], tasks: [],
    expectations: { tone: "Professional", qualityStandards: "", escalationRules: "" },
    completed: false,
  };

  const employee = EmployeeRepo.findById(deployment.employee_id);
  const capabilities = employee?.capabilities ? JSON.parse(employee.capabilities) : [];

  return NextResponse.json({
    deploymentId,
    name: deployment.name,
    status: deployment.status,
    schedule: config.schedule || "",
    tools: config.tools || [],
    approvalSettings: config.approvalSettings || { email: true, crm: false, calendar: true },
    approvalRules: config.approvalRules || null,
    reviewedTabs: config.reviewedTabs || [],
    onboarding,
    agentProfile: {
      employeeId: employee?.id,
      name: employee?.name,
      role: employee?.role,
      category: employee?.category,
      description: employee?.description,
      longDescription: employee?.long_description,
      capabilities,
      systemPrompt: employee?.system_prompt || "",
      customInstructions: employee?.custom_instructions || "",
      isCustom: employee?.is_prebuilt !== 1,
    },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { deployment, error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const body = await req.json();
  const config = JSON.parse(deployment.config || "{}");

  if (body.approvalSettings) { config.approvalSettings = body.approvalSettings; delete body.approvalSettings; }
  if (body.approvalRules) { config.approvalRules = body.approvalRules; delete body.approvalRules; }
  if (body.reviewedTabs) { config.reviewedTabs = body.reviewedTabs; delete body.reviewedTabs; }

  config.onboarding = { ...((config.onboarding as Record<string, unknown>) || {}), ...body };

  DeploymentRepo.updateConfig(deploymentId, JSON.stringify(config));

  ActivityRepo.log({
    deploymentId, userId: user.id, type: "onboarding",
    title: body.completed ? "Onboarding completed" : "Onboarding updated",
    description: body.completed ? "Agent onboarding has been completed" : "Onboarding configuration was updated",
    metadata: { completed: !!body.completed },
    status: "success",
  });

  return NextResponse.json({ success: true, onboarding: config.onboarding });
}
