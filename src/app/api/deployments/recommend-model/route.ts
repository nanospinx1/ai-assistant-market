// POST /api/deployments/recommend-model — Predict complexity and recommend optimal model

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { recommendModel, RecommendationInput } from "@/lib/agents/model-recommender";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { employeeId, tools, dataSources, schedule } = body;

  if (!employeeId) {
    return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
  }

  const db = getDb();

  // Look up the employee to get agent type and capabilities
  const employee = db
    .prepare("SELECT * FROM ai_employees WHERE id = ?")
    .get(employeeId) as any;

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const capabilities = employee.capabilities ? JSON.parse(employee.capabilities) : [];

  // Estimate knowledge content size from existing knowledge sources or defaults
  let knowledgeContentSize = 0;
  if (employee.agent_type === "customer-support") {
    knowledgeContentSize = 3000; // default FAQ size
  }

  const input: RecommendationInput = {
    agentType: employee.agent_type || "generic",
    toolsCount: Array.isArray(tools) ? tools.length : 0,
    dataSourcesCount: Array.isArray(dataSources) ? dataSources.length : 0,
    capabilitiesCount: capabilities.length,
    knowledgeContentSize,
    schedule: schedule || "24/7 Always On",
  };

  const recommendation = recommendModel(input);

  return NextResponse.json({
    recommendation,
    employee: {
      id: employee.id,
      name: employee.name,
      agentType: employee.agent_type,
      role: employee.role,
    },
  });
}
