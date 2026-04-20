import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as ToolRepo from "@/lib/repositories/tools";
import * as KnowledgeRepo from "@/lib/repositories/knowledge";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;

  const toolBindings = ToolRepo.getBindingsForDeployment(deploymentId);
  const knowledgeBindings = KnowledgeRepo.getBindingsForDeployment(deploymentId);

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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { type, resourceId, enabled, toolType } = await req.json();

  if (type === "tool") {
    ToolRepo.toggleBinding(deploymentId, resourceId, toolType || "unknown", enabled);
  } else if (type === "knowledge") {
    KnowledgeRepo.toggleBinding(deploymentId, resourceId, enabled);
  }

  return NextResponse.json({ success: true });
}
