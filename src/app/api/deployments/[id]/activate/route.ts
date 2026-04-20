import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import * as EmployeeRepo from "@/lib/repositories/employees";
import * as DeploymentRepo from "@/lib/repositories/deployments";
import { seedDeploymentKnowledge } from "@/lib/agents/agent-registry";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { deployment, error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const employee = EmployeeRepo.findById(deployment.employee_id);
  const agentType = employee?.agent_type || "generic";

  seedDeploymentKnowledge(deploymentId, agentType);
  DeploymentRepo.activate(deploymentId);

  return NextResponse.json({ success: true, status: "active" });
}
