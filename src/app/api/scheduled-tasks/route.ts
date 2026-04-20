import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyDeploymentOwnership } from "@/lib/auth";
import * as TaskRepo from "@/lib/repositories/tasks";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const deploymentId = req.nextUrl.searchParams.get("deploymentId");

  if (deploymentId) {
    const { error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
    if (ownerError) return ownerError;
    const tasks = TaskRepo.listByDeployment(deploymentId, user.id);
    return NextResponse.json({ tasks });
  }

  const tasks = TaskRepo.listByUser(user.id);
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { deploymentId, name, description, scheduleType, scheduleConfig, taskPrompt } = await req.json();

  if (!deploymentId || !name || !scheduleType || !taskPrompt) {
    return NextResponse.json({ error: "deploymentId, name, scheduleType, and taskPrompt are required" }, { status: 400 });
  }

  const validTypes = ["daily", "weekly", "monthly", "custom"];
  if (!validTypes.includes(scheduleType)) {
    return NextResponse.json({ error: `scheduleType must be one of: ${validTypes.join(", ")}` }, { status: 400 });
  }

  const { error: ownerError } = verifyDeploymentOwnership(deploymentId, user.id);
  if (ownerError) return ownerError;

  const task = TaskRepo.createTask({ deploymentId, userId: user.id, name, description, scheduleType, scheduleConfig, taskPrompt });
  return NextResponse.json({ task }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id, name, description, scheduleType, scheduleConfig, taskPrompt, isActive } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Task id is required" }, { status: 400 });
  }

  const existing = TaskRepo.findByIdAndUser(id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const fields: Record<string, unknown> = {};
  if (name !== undefined) fields.name = name;
  if (description !== undefined) fields.description = description;
  if (scheduleType !== undefined) fields.schedule_type = scheduleType;
  if (scheduleConfig !== undefined) fields.schedule_config = JSON.stringify(scheduleConfig);
  if (taskPrompt !== undefined) fields.task_prompt = taskPrompt;
  if (isActive !== undefined) fields.is_active = isActive ? 1 : 0;

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const task = TaskRepo.updateTask(id, fields);
  return NextResponse.json({ task });
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Task id is required" }, { status: 400 });
  }

  const existing = TaskRepo.findByIdAndUser(id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  TaskRepo.deleteTask(id);
  return NextResponse.json({ success: true });
}
