import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { v4 as uuid } from "uuid";
import { validateToolConnection, getAvailableTools } from "@/lib/tools/tool-executor";

/**
 * GET /api/integrations — List user's tool connections + available tools
 */
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const db = getDb();

  // User's configured connections
  const connections = db
    .prepare("SELECT * FROM user_tool_connections WHERE user_id = ? ORDER BY created_at DESC")
    .all(user.id) as any[];

  const parsed = connections.map((c: any) => ({
    id: c.id,
    toolType: c.tool_type,
    name: c.name,
    config: JSON.parse(c.config || "{}"),
    status: c.status,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }));

  // Available tool types
  const availableTools = getAvailableTools();

  return NextResponse.json({
    connections: parsed,
    availableTools,
  });
}

/**
 * POST /api/integrations — Create or update a tool connection
 */
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { toolType, name, config } = body;

  if (!toolType || !name) {
    return NextResponse.json({ error: "toolType and name are required" }, { status: 400 });
  }

  // Validate the connection config
  const validation = validateToolConnection(toolType, config || {});
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const db = getDb();
  const id = uuid();

  db.prepare(`
    INSERT INTO user_tool_connections (id, user_id, tool_type, name, config, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `).run(id, user.id, toolType, name, JSON.stringify(config || {}));

  return NextResponse.json({ success: true, id });
}

/**
 * DELETE /api/integrations — Remove a tool connection
 */
export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const connectionId = searchParams.get("id");

  if (!connectionId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const db = getDb();

  // Verify ownership
  const conn = db.prepare("SELECT * FROM user_tool_connections WHERE id = ? AND user_id = ?").get(connectionId, user.id);
  if (!conn) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  // Remove bindings first, then connection
  db.prepare("DELETE FROM deployment_tool_bindings WHERE connection_id = ?").run(connectionId);
  db.prepare("DELETE FROM user_tool_connections WHERE id = ?").run(connectionId);

  return NextResponse.json({ success: true });
}
