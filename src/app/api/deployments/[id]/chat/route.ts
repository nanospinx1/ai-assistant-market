// POST /api/deployments/[id]/chat — Send a message and get agent response
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import { buildAgentFromDeployment } from "@/lib/agents/agent-registry";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  try {
    const { message, conversationId } = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const agent = buildAgentFromDeployment(deploymentId);
    const response = await agent.chat(user.id, {
      message: message.trim(),
      conversationId,
    });

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Chat error:", err);

    // Return 429 for quota exceeded
    if (err.name === "QuotaExceededError") {
      return NextResponse.json({ error: err.message, code: "QUOTA_EXCEEDED" }, { status: 429 });
    }

    return NextResponse.json({ error: err.message || "Chat failed" }, { status: 500 });
  }
}
