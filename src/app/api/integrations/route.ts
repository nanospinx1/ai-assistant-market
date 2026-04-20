import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as ToolRepo from "@/lib/repositories/tools";
import { validateToolConnection, getAvailableTools } from "@/lib/tools/tool-executor";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const connections = ToolRepo.listByUser(user.id);
  const availableTools = getAvailableTools();

  return NextResponse.json({ connections, availableTools });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { toolType, name, config } = await req.json();
  if (!toolType || !name) {
    return NextResponse.json({ error: "toolType and name are required" }, { status: 400 });
  }

  const validation = validateToolConnection(toolType, config || {});
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const id = ToolRepo.createConnection(user.id, toolType, name, config || {});
  return NextResponse.json({ success: true, id });
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const connectionId = new URL(req.url).searchParams.get("id");
  if (!connectionId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const deleted = ToolRepo.deleteConnection(connectionId, user.id);
  if (!deleted) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
