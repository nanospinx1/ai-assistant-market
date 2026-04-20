import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as KnowledgeRepo from "@/lib/repositories/knowledge";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const entries = KnowledgeRepo.listByUser(user.id);
  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { title, content, category } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }

  const id = KnowledgeRepo.createEntry(user.id, title, content, category || "General");
  return NextResponse.json({ success: true, id });
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const entryId = new URL(req.url).searchParams.get("id");
  if (!entryId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const deleted = KnowledgeRepo.deleteEntry(entryId, user.id);
  if (!deleted) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
