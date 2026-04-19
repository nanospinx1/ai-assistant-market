// POST /api/deployments/[id]/activate — Activate a deployment and seed knowledge
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { seedDeploymentKnowledge } from "@/lib/agents/agent-registry";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: deploymentId } = await params;
  const { deployment, error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const db = getDb();

  // Get employee info to determine agent type
  const employee = db
    .prepare("SELECT agent_type FROM ai_employees WHERE id = ?")
    .get(deployment.employee_id) as any;

  const agentType = employee?.agent_type || "generic";

  // Seed default knowledge sources
  seedDeploymentKnowledge(deploymentId, agentType);

  // Update status to active
  db.prepare("UPDATE deployments SET status = 'active', deployed_at = datetime('now') WHERE id = ?").run(
    deploymentId
  );

  return NextResponse.json({ success: true, status: "active" });
}
