import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";

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
    connectedTools: [],
    knowledge: [],
    tasks: [],
    expectations: {
      tone: "Professional",
      qualityStandards: "",
      escalationRules: "",
    },
    completed: false,
  };

  return NextResponse.json({
    deploymentId,
    name: deployment.name,
    status: deployment.status,
    schedule: config.schedule || "",
    tools: config.tools || [],
    onboarding,
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
  const db = getDb();
  const config = JSON.parse(deployment.config || "{}");

  // Merge onboarding data into config
  config.onboarding = {
    ...((config.onboarding as Record<string, unknown>) || {}),
    ...body,
  };

  db.prepare("UPDATE deployments SET config = ? WHERE id = ?").run(
    JSON.stringify(config),
    deploymentId
  );

  return NextResponse.json({ success: true, onboarding: config.onboarding });
}
