// GET /api/deployments/[id]/conversations — List conversations for a deployment
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const db = getDb();
  const conversationId = req.nextUrl.searchParams.get("conversationId");

  if (conversationId) {
    // Get messages for a specific conversation
    const messages = db
      .prepare(
        `SELECT id, role, content, metadata, created_at as createdAt
         FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`
      )
      .all(conversationId);

    return NextResponse.json({ messages });
  }

  // List all conversations
  const conversations = db
    .prepare(
      `SELECT c.id, c.title, c.status, c.created_at as createdAt, c.updated_at as updatedAt,
              (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as messageCount
       FROM conversations c
       WHERE c.deployment_id = ? AND c.user_id = ?
       ORDER BY c.updated_at DESC`
    )
    .all(deploymentId, user.id);

  return NextResponse.json({ conversations });
}
