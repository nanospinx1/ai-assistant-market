import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";
import { v4 as uuidv4 } from "uuid";

/**
 * GET /api/deployments/[id]/config-versions
 * List all config versions for a deployment (newest first)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const db = getDb();
  const versions = db
    .prepare(
      "SELECT * FROM config_versions WHERE deployment_id = ? ORDER BY version DESC"
    )
    .all(deploymentId);

  return NextResponse.json({ versions });
}

/**
 * POST /api/deployments/[id]/config-versions
 * Save current config as a new version and apply changes.
 * Body: { configSnapshot, changedFields, changeSummary }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { deployment, error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const body = await req.json();
  const { configSnapshot, changedFields, changeSummary } = body;

  const db = getDb();

  // Get latest version number
  const latest = db
    .prepare(
      "SELECT MAX(version) as maxVer FROM config_versions WHERE deployment_id = ?"
    )
    .get(deploymentId) as { maxVer: number | null } | undefined;

  const nextVersion = (latest?.maxVer || 0) + 1;

  // If version 1, also save the "before" snapshot as v0
  if (nextVersion === 1) {
    const currentConfig = JSON.parse(deployment.config || "{}");
    db.prepare(
      `INSERT INTO config_versions (id, deployment_id, version, config_snapshot, changed_fields, change_summary)
       VALUES (?, ?, 0, ?, '[]', 'Initial configuration')`
    ).run(uuidv4(), deploymentId, JSON.stringify(currentConfig));
  }

  // Insert new version
  db.prepare(
    `INSERT INTO config_versions (id, deployment_id, version, config_snapshot, changed_fields, change_summary)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    uuidv4(),
    deploymentId,
    nextVersion,
    JSON.stringify(configSnapshot || {}),
    JSON.stringify(changedFields || []),
    changeSummary || ""
  );

  // Apply the new config to the deployment
  db.prepare("UPDATE deployments SET config = ? WHERE id = ?").run(
    JSON.stringify(configSnapshot),
    deploymentId
  );

  // Log activity
  try {
    logActivity({
      deploymentId,
      userId: user.id,
      type: "config_change",
      title: `Configuration updated (v${nextVersion})`,
      description: changeSummary || `Config version ${nextVersion} applied`,
      metadata: {
        version: nextVersion,
        changedFields,
      },
      status: "success",
    });
  } catch {
    // never break main flow
  }

  return NextResponse.json({
    success: true,
    version: nextVersion,
  });
}
