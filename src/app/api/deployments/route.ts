import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";
import { requireAuth } from "@/lib/auth";
import { recommendModel } from "@/lib/agents/model-recommender";
import { seedDeploymentKnowledge } from "@/lib/agents/agent-registry";
import { logActivity } from "@/lib/activity-logger";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  seedDatabase();
  const db = getDb();
  const userId = user.id;

  const deployments = db.prepare(`
    SELECT d.*, e.name as employee_name, e.role as employee_role, e.avatar as employee_avatar,
           e.category as employee_category, e.agent_type as agent_type,
           e.is_published as is_published, e.publish_status as publish_status
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
    agentType: d.agent_type,
    isPublished: !!d.is_published,
    publishStatus: d.publish_status,
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
    INSERT INTO deployments (id, user_id, employee_id, name, status, config, default_model, model_tier)
    VALUES (?, ?, ?, ?, 'configuring', ?, ?, ?)
  `).run(id, user.id, employee_id, name, JSON.stringify(config), recommendation.modelId, recommendation.tier);

  // Seed default knowledge sources for this agent type
  const agentType = employee?.agent_type || "generic";
  seedDeploymentKnowledge(id, agentType);

  // Log deployment creation
  try {
    logActivity({
      deploymentId: id,
      userId: user.id,
      type: "status_change",
      title: "Deployment created",
      description: `Deployed "${name}" with model ${recommendation.modelDisplayName}`,
      metadata: {
        employeeId: employee_id,
        modelId: recommendation.modelId,
        tier: recommendation.tier,
      },
      status: "success",
    });
  } catch {
    // never break main flow
  }

  // Create notification for new deployment
  createNotification({
    userId: user.id,
    deploymentId: id,
    type: "task_complete",
    title: "New agent deployed",
    message: `"${name}" is live with model ${recommendation.modelDisplayName}`,
    link: `/deploy/${id}`,
  });

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

  // Log status change
  try {
    const labels: Record<string, string> = {
      active: "resumed",
      paused: "paused",
      stopped: "stopped",
      archived: "archived",
    };
    logActivity({
      deploymentId: id,
      userId: user.id,
      type: "status_change",
      title: `Deployment ${labels[status] || status}`,
      description: `Status changed to ${status}`,
      metadata: { previousStatus: (dep as any).status, newStatus: status },
      status: "success",
    });
  } catch {
    // never break main flow
  }

  // Create notification for status change
  const statusLabels: Record<string, string> = {
    active: "resumed",
    paused: "paused",
    stopped: "stopped",
    archived: "archived",
  };
  createNotification({
    userId: user.id,
    deploymentId: id,
    type: "status_change",
    title: `Agent ${statusLabels[status] || status}`,
    message: `Deployment status changed to ${status}`,
    link: `/deploy/${id}`,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const db = getDb();
  const { id } = body;

  const dep = db.prepare("SELECT * FROM deployments WHERE id = ? AND user_id = ?").get(id, user.id) as any;
  if (!dep) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });

  // Log activity BEFORE deleting so it persists
  try {
    logActivity({
      deploymentId: id,
      userId: user.id,
      type: "status_change",
      title: `Employee "${dep.name}" deleted`,
      description: `Permanently removed from workforce`,
      metadata: { deletedName: dep.name },
      status: "success",
    });
  } catch {
    // never break main flow
  }

  try {
    // FK pragma must be set OUTSIDE the transaction in SQLite
    db.pragma("foreign_keys = OFF");
    const deleteAll = db.transaction(() => {
      const tables = [
        "conversations",
        "messages",
        "performance_metrics",
        "knowledge_sources",
        "notifications",
        "scheduled_tasks",
        "task_runs",
        "task_logs",
        "usage_logs",
        "deployment_tool_bindings",
        "tool_execution_logs",
      ];
      for (const table of tables) {
        try {
          db.prepare(`DELETE FROM ${table} WHERE deployment_id = ?`).run(id);
        } catch {
          // table may not exist or column name differs — skip
        }
      }
      db.prepare("DELETE FROM deployments WHERE id = ?").run(id);
    });
    deleteAll();
    db.pragma("foreign_keys = ON");
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to delete" }, { status: 500 });
  }

  try {
    createNotification({
      userId: user.id,
      type: "status_change",
      title: "Employee deleted",
      message: `"${dep.name}" has been permanently deleted`,
      link: "/deploy",
    });
  } catch {
    // never break main flow
  }

  return NextResponse.json({ success: true });
}
