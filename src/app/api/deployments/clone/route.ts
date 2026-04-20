import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { v4 as uuid } from "uuid";
import { logActivity } from "@/lib/activity-logger";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { deploymentId, newName } = body as {
    deploymentId: string;
    newName?: string;
  };

  if (!deploymentId) {
    return NextResponse.json(
      { error: "deploymentId is required" },
      { status: 400 }
    );
  }

  const db = getDb();

  // Fetch the original deployment and verify ownership
  const original = db
    .prepare("SELECT * FROM deployments WHERE id = ? AND user_id = ?")
    .get(deploymentId, user.id) as any;

  if (!original) {
    return NextResponse.json(
      { error: "Deployment not found" },
      { status: 404 }
    );
  }

  const originalConfig = JSON.parse(original.config || "{}");
  const cloneName = newName?.trim() || `${original.name} (Copy)`;
  const newId = uuid();

  db.prepare(`
    INSERT INTO deployments (id, user_id, employee_id, name, status, config, default_model, model_tier, created_at)
    VALUES (?, ?, ?, ?, 'configuring', ?, ?, ?, datetime('now'))
  `).run(
    newId,
    user.id,
    original.employee_id,
    cloneName,
    JSON.stringify(originalConfig),
    original.default_model,
    original.model_tier
  );

  // Log the clone activity on the original deployment
  try {
    logActivity({
      deploymentId: original.id,
      userId: user.id,
      type: "status_change",
      title: "Deployment cloned",
      description: `Cloned as "${cloneName}"`,
      metadata: { clonedDeploymentId: newId },
      status: "success",
    });
  } catch {
    // never break main flow
  }

  return NextResponse.json({ success: true, id: newId, name: cloneName });
}
