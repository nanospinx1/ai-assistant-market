import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";
import { requireAuth } from "@/lib/auth";
import { recommendModel } from "@/lib/agents/model-recommender";
import { seedDeploymentKnowledge } from "@/lib/agents/agent-registry";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  seedDatabase();
  const db = getDb();
  const userId = user.id;

  const deployments = db.prepare(`
    SELECT d.*, e.name as employee_name, e.role as employee_role, e.avatar as employee_avatar, e.category as employee_category
    FROM deployments d
    JOIN ai_employees e ON d.employee_id = e.id
    WHERE d.user_id = ?
    ORDER BY d.created_at DESC
  `).all(userId);

  const parsed = deployments.map((d: any) => ({
    ...d,
    config: JSON.parse(d.config || "{}"),
    employeeName: d.employee_name,
    employeeRole: d.employee_role,
    employeeAvatar: d.employee_avatar,
    employeeCategory: d.employee_category,
    deployedAt: d.deployed_at,
    createdAt: d.created_at,
  }));

  return NextResponse.json(parsed);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const db = getDb();
  const { id, employee_id, name, config } = body;

  // Server-side model recommendation (authoritative — not client-supplied)
  const employee = db.prepare("SELECT * FROM ai_employees WHERE id = ?").get(employee_id) as any;
  const capabilities = employee?.capabilities ? JSON.parse(employee.capabilities) : [];

  const recommendation = recommendModel({
    agentType: employee?.agent_type || "generic",
    toolsCount: Array.isArray(config?.tools) ? config.tools.length : 0,
    dataSourcesCount: Array.isArray(config?.dataSources) ? config.dataSources.length : 0,
    capabilitiesCount: capabilities.length,
    knowledgeContentSize: employee?.agent_type ? 2000 : 0,
    schedule: config?.schedule || "24/7 Always On",
  });

  db.prepare(`
    INSERT INTO deployments (id, user_id, employee_id, name, status, config, default_model, model_tier, deployed_at)
    VALUES (?, ?, ?, ?, 'active', ?, ?, ?, datetime('now'))
  `).run(id, user.id, employee_id, name, JSON.stringify(config), recommendation.modelId, recommendation.tier);

  // Seed default knowledge sources for this agent type
  const agentType = employee?.agent_type || "generic";
  seedDeploymentKnowledge(id, agentType);

  return NextResponse.json({
    success: true,
    id,
    model: {
      id: recommendation.modelId,
      displayName: recommendation.modelDisplayName,
      tier: recommendation.tier,
      tierLabel: recommendation.tierLabel,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const db = getDb();
  const { id, status } = body;

  // Verify ownership
  const dep = db.prepare("SELECT * FROM deployments WHERE id = ? AND user_id = ?").get(id, user.id);
  if (!dep) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });

  if (status === "active") {
    db.prepare("UPDATE deployments SET status = ?, deployed_at = datetime('now') WHERE id = ?").run(status, id);
  } else {
    db.prepare("UPDATE deployments SET status = ? WHERE id = ?").run(status, id);
  }

  return NextResponse.json({ success: true });
}
