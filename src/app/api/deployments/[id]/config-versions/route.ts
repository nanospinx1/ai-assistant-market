import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import * as ActivityRepo from "@/lib/repositories/activity";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const versions = getDb()
    .prepare("SELECT * FROM config_versions WHERE deployment_id = ? ORDER BY version DESC")
    .all(deploymentId);

  return NextResponse.json({ versions });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { deployment, error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const { configSnapshot, changedFields, changeSummary } = await req.json();
  const db = getDb();

  const latest = db
    .prepare("SELECT MAX(version) as maxVer FROM config_versions WHERE deployment_id = ?")
    .get(deploymentId) as { maxVer: number | null } | undefined;

  const nextVersion = (latest?.maxVer || 0) + 1;

  if (nextVersion === 1) {
    const currentConfig = JSON.parse(deployment.config || "{}");
    db.prepare(
      `INSERT INTO config_versions (id, deployment_id, version, config_snapshot, changed_fields, change_summary)
       VALUES (?, ?, 0, ?, '[]', 'Initial configuration')`
    ).run(uuidv4(), deploymentId, JSON.stringify(currentConfig));
  }

  db.prepare(
    `INSERT INTO config_versions (id, deployment_id, version, config_snapshot, changed_fields, change_summary)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(uuidv4(), deploymentId, nextVersion, JSON.stringify(configSnapshot || {}), JSON.stringify(changedFields || []), changeSummary || "");

  db.prepare("UPDATE deployments SET config = ? WHERE id = ?").run(JSON.stringify(configSnapshot), deploymentId);

  ActivityRepo.log({
    deploymentId, userId: user.id, type: "config_change",
    title: `Configuration updated (v${nextVersion})`,
    description: changeSummary || `Config version ${nextVersion} applied`,
    metadata: { version: nextVersion, changedFields },
    status: "success",
  });

  return NextResponse.json({ success: true, version: nextVersion });
}
