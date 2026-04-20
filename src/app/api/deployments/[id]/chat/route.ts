// POST /api/deployments/[id]/chat — Send a message and get agent response
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import { buildAgentFromDeployment } from "@/lib/agents/agent-registry";
import { logActivity } from "@/lib/activity-logger";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  try {
    const { message, conversationId, sandbox } = await req.json();
    const isSandbox = sandbox === true;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const agent = buildAgentFromDeployment(deploymentId);
    const response = await agent.chat(user.id, {
      message: message.trim(),
      conversationId,
    });

    // Only log to activity when NOT in sandbox mode
    if (!isSandbox) {
      try {
        const res = response as unknown as Record<string, unknown>;
        logActivity({
          deploymentId,
          userId: user.id,
          type: "chat",
          title: "Chat message",
          description: message.trim().slice(0, 200),
          metadata: {
            conversationId: response.conversationId ?? conversationId,
            tokensUsed: res.tokensUsed,
          },
          status: "success",
        });

        // Log any tool calls that occurred
        const toolCalls = res.toolCalls as any[] | undefined;
        if (toolCalls && Array.isArray(toolCalls)) {
          for (const tc of toolCalls) {
            logActivity({
              deploymentId,
              userId: user.id,
              type: "tool_call",
              title: `Tool call: ${tc.name || tc.tool || "unknown"}`,
              description: tc.result?.slice?.(0, 200),
              metadata: { tool: tc.name || tc.tool, duration: tc.duration },
              status: tc.error ? "error" : "success",
            });
          }
        }
      } catch {
        // never break main flow
      }
    }

    return NextResponse.json({ ...response, sandbox: isSandbox });
  } catch (err: any) {
    console.error("Chat error:", err);

    // Log the error
    try {
      logActivity({
        deploymentId,
        userId: user.id,
        type: "error",
        title: "Chat error",
        description: err.message || "Unknown error",
        status: "error",
      });
    } catch {
      // never break main flow
    }

    // Create error notification
    createNotification({
      userId: user.id,
      deploymentId,
      type: "error",
      title: "Chat error",
      message: err.message || "An error occurred during chat",
      link: `/deploy/${deploymentId}`,
    });

    // Return 429 for quota exceeded
    if (err.name === "QuotaExceededError") {
      return NextResponse.json({ error: err.message, code: "QUOTA_EXCEEDED" }, { status: 429 });
    }

    return NextResponse.json({ error: err.message || "Chat failed" }, { status: 500 });
  }
}
