import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// GET /api/scheduled-tasks?deploymentId=X — List scheduled tasks
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const db = getDb();
  const deploymentId = req.nextUrl.searchParams.get("deploymentId");

  if (deploymentId) {
    const { error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
    if (ownerError) return ownerError;

    const tasks = db
      .prepare("SELECT * FROM scheduled_tasks WHERE deployment_id = ? AND user_id = ? ORDER BY created_at DESC")
      .all(deploymentId, user.id);
    return NextResponse.json({ tasks });
  }

  const tasks = db
    .prepare("SELECT * FROM scheduled_tasks WHERE user_id = ? ORDER BY created_at DESC")
    .all(user.id);
  return NextResponse.json({ tasks });
}

// POST /api/scheduled-tasks — Create a new scheduled task
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { deploymentId, name, description, scheduleType, scheduleConfig, taskPrompt } = body;

  if (!deploymentId || !name || !scheduleType || !taskPrompt) {
    return NextResponse.json(
      { error: "deploymentId, name, scheduleType, and taskPrompt are required" },
      { status: 400 }
    );
  }

  const validTypes = ["daily", "weekly", "monthly", "custom"];
  if (!validTypes.includes(scheduleType)) {
    return NextResponse.json(
      { error: `scheduleType must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  const { error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const db = getDb();
  const id = uuidv4();
  const configJson = scheduleConfig ? JSON.stringify(scheduleConfig) : null;

  db.prepare(
    `INSERT INTO scheduled_tasks (id, deployment_id, user_id, name, description, schedule_type, schedule_config, task_prompt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, deploymentId, user.id, name, description || null, scheduleType, configJson, taskPrompt);

  const task = db.prepare("SELECT * FROM scheduled_tasks WHERE id = ?").get(id);
  return NextResponse.json({ task }, { status: 201 });
}

// PATCH /api/scheduled-tasks — Update a task
export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { id, name, description, scheduleType, scheduleConfig, taskPrompt, isActive } = body;

  if (!id) {
    return NextResponse.json({ error: "Task id is required" }, { status: 400 });
  }

  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM scheduled_tasks WHERE id = ? AND user_id = ?")
    .get(id, user.id) as Record<string, unknown> | undefined;

  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (name !== undefined) { updates.push("name = ?"); values.push(name); }
  if (description !== undefined) { updates.push("description = ?"); values.push(description); }
  if (scheduleType !== undefined) { updates.push("schedule_type = ?"); values.push(scheduleType); }
  if (scheduleConfig !== undefined) { updates.push("schedule_config = ?"); values.push(JSON.stringify(scheduleConfig)); }
  if (taskPrompt !== undefined) { updates.push("task_prompt = ?"); values.push(taskPrompt); }
  if (isActive !== undefined) { updates.push("is_active = ?"); values.push(isActive ? 1 : 0); }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  values.push(id);
  db.prepare(`UPDATE scheduled_tasks SET ${updates.join(", ")} WHERE id = ?`).run(...values);

  const task = db.prepare("SELECT * FROM scheduled_tasks WHERE id = ?").get(id);
  return NextResponse.json({ task });
}

// DELETE /api/scheduled-tasks?id=X — Delete a task
export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Task id is required" }, { status: 400 });
  }

  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM scheduled_tasks WHERE id = ? AND user_id = ?")
    .get(id, user.id);

  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  db.prepare("DELETE FROM task_runs WHERE task_id = ?").run(id);
  db.prepare("DELETE FROM scheduled_tasks WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}
