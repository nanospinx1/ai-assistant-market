import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { v4 as uuid } from "uuid";

/**
 * GET /api/knowledge — List user's global knowledge library
 */
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const db = getDb();
  const entries = db
    .prepare("SELECT * FROM user_knowledge_library WHERE user_id = ? ORDER BY created_at DESC")
    .all(user.id) as any[];

  return NextResponse.json({ entries });
}

/**
 * POST /api/knowledge — Add a global knowledge entry
 */
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { title, content, category } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }

  const db = getDb();
  const id = uuid();

  db.prepare(
    "INSERT INTO user_knowledge_library (id, user_id, title, content, category) VALUES (?, ?, ?, ?, ?)"
  ).run(id, user.id, title, content, category || "General");

  return NextResponse.json({ success: true, id });
}

/**
 * DELETE /api/knowledge — Remove a global knowledge entry
 */
export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const entryId = searchParams.get("id");

  if (!entryId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const db = getDb();
  const entry = db.prepare("SELECT * FROM user_knowledge_library WHERE id = ? AND user_id = ?").get(entryId, user.id);
  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  db.prepare("DELETE FROM deployment_knowledge_bindings WHERE knowledge_id = ?").run(entryId);
  db.prepare("DELETE FROM user_knowledge_library WHERE id = ?").run(entryId);

  return NextResponse.json({ success: true });
}
