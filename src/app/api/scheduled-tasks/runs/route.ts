import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as TaskRepo from "@/lib/repositories/tasks";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json({ error: "taskId is required" }, { status: 400 });
  }

  const task = TaskRepo.findByIdAndUser(taskId, user.id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const runs = getDb()
    .prepare("SELECT * FROM task_runs WHERE task_id = ? ORDER BY started_at DESC LIMIT 20")
    .all(taskId);

  return NextResponse.json({ runs });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { taskId, deploymentId, status, result, errorText } = await req.json();
  if (!taskId || !deploymentId) {
    return NextResponse.json({ error: "taskId and deploymentId are required" }, { status: 400 });
  }

  const task = TaskRepo.findByIdAndUser(taskId, user.id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const db = getDb();
  const id = uuidv4();
  db.prepare(`
    INSERT INTO task_runs (id, task_id, deployment_id, status, result, error, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, taskId, deploymentId, status || "success", result ? JSON.stringify(result) : null, errorText || null, new Date().toISOString());

  db.prepare("UPDATE scheduled_tasks SET last_run_at = datetime('now'), run_count = run_count + 1 WHERE id = ?").run(taskId);

  const run = db.prepare("SELECT * FROM task_runs WHERE id = ?").get(id);
  return NextResponse.json({ run }, { status: 201 });
}
