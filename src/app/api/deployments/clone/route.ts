import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as DeploymentRepo from "@/lib/repositories/deployments";
import * as ActivityRepo from "@/lib/repositories/activity";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { deploymentId, newName } = await req.json() as { deploymentId: string; newName?: string };
  if (!deploymentId) {
    return NextResponse.json({ error: "deploymentId is required" }, { status: 400 });
  }

  const original = DeploymentRepo.findByIdAndUser(deploymentId, user.id);
  if (!original) {
    return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
  }

  const cloneName = newName?.trim() || `${original.name} (Copy)`;
  const newId = require("uuid").v4();

  DeploymentRepo.cloneDeployment({
    newId,
    userId: user.id,
    employeeId: original.employee_id,
    name: cloneName,
    config: original.config || "{}",
    defaultModel: original.default_model,
    modelTier: original.model_tier,
  });

  ActivityRepo.log({
    deploymentId: original.id, userId: user.id, type: "status_change",
    title: "Deployment cloned", description: `Cloned as "${cloneName}"`,
    metadata: { clonedDeploymentId: newId }, status: "success",
  });

  return NextResponse.json({ success: true, id: newId, name: cloneName });
}
