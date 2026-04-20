import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import * as ConversationRepo from "@/lib/repositories/conversations";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const conversationId = req.nextUrl.searchParams.get("conversationId");

  if (conversationId) {
    const messages = ConversationRepo.getMessages(conversationId);
    return NextResponse.json({ messages });
  }

  const conversations = ConversationRepo.listByDeployment(deploymentId);
  return NextResponse.json({ conversations });
}
