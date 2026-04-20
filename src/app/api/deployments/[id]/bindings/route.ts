import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { v4 as uuid } from "uuid";

/**
 * GET /api/deployments/[id]/bindings — Get tool + knowledge bindings for a deployment
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const db = getDb();

  const toolBindings = db
    .prepare("SELECT * FROM deployment_tool_bindings WHERE deployment_id = ?")
    .all(deploymentId) as any[];

  const knowledgeBindings = db
    .prepare("SELECT * FROM deployment_knowledge_bindings WHERE deployment_id = ?")
    .all(deploymentId) as any[];

  return NextResponse.json({
    toolBindings: toolBindings.map((b: any) => ({
      connectionId: b.connection_id,
      toolType: b.tool_type,
      enabled: !!b.enabled,
    })),
    knowledgeBindings: knowledgeBindings.map((b: any) => ({
      knowledgeId: b.knowledge_id,
      enabled: !!b.enabled,
    })),
  });
}

/**
 * POST /api/deployments/[id]/bindings — Toggle a global tool or knowledge entry for this deployment
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const body = await req.json();
  const { type, resourceId, enabled, toolType } = body;

  const db = getDb();

  if (type === "tool") {
    const existing = db
      .prepare("SELECT * FROM deployment_tool_bindings WHERE deployment_id = ? AND connection_id = ?")
      .get(deploymentId, resourceId) as any;

    if (existing) {
      if (enabled) {
        db.prepare("UPDATE deployment_tool_bindings SET enabled = 1 WHERE id = ?").run(existing.id);
      } else {
        db.prepare("DELETE FROM deployment_tool_bindings WHERE id = ?").run(existing.id);
      }
    } else if (enabled) {
      db.prepare(
        "INSERT INTO deployment_tool_bindings (id, deployment_id, connection_id, tool_type, enabled) VALUES (?, ?, ?, ?, 1)"
      ).run(uuid(), deploymentId, resourceId, toolType || "unknown");
    }
  } else if (type === "knowledge") {
    const existing = db
      .prepare("SELECT * FROM deployment_knowledge_bindings WHERE deployment_id = ? AND knowledge_id = ?")
      .get(deploymentId, resourceId) as any;

    if (existing) {
      if (enabled) {
        db.prepare("UPDATE deployment_knowledge_bindings SET enabled = 1 WHERE id = ?").run(existing.id);
      } else {
        db.prepare("DELETE FROM deployment_knowledge_bindings WHERE id = ?").run(existing.id);
      }
    } else if (enabled) {
      db.prepare(
        "INSERT INTO deployment_knowledge_bindings (id, deployment_id, knowledge_id, enabled) VALUES (?, ?, ?, 1)"
      ).run(uuid(), deploymentId, resourceId);
    }
  }

  return NextResponse.json({ success: true });
}
