import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// GET /api/scheduled-tasks/runs?taskId=X — Get run history for a task
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json({ error: "taskId is required" }, { status: 400 });
  }

  const db = getDb();
  const task = db
    .prepare("SELECT * FROM scheduled_tasks WHERE id = ? AND user_id = ?")
    .get(taskId, user.id);

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const runs = db
    .prepare("SELECT * FROM task_runs WHERE task_id = ? ORDER BY started_at DESC LIMIT 20")
    .all(taskId);

  return NextResponse.json({ runs });
}

// POST /api/scheduled-tasks/runs — Create a run record (used by "Run Now")
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { taskId, deploymentId, status, result, errorText } = body;

  if (!taskId || !deploymentId) {
    return NextResponse.json({ error: "taskId and deploymentId are required" }, { status: 400 });
  }

  const db = getDb();
  const task = db
    .prepare("SELECT * FROM scheduled_tasks WHERE id = ? AND user_id = ?")
    .get(taskId, user.id);

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const id = uuidv4();
  db.prepare(
    `INSERT INTO task_runs (id, task_id, deployment_id, status, result, error, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    taskId,
    deploymentId,
    status || "success",
    result ? JSON.stringify(result) : null,
    errorText || null,
    new Date().toISOString()
  );

  // Update the parent task
  db.prepare(
    "UPDATE scheduled_tasks SET last_run_at = datetime('now'), run_count = run_count + 1 WHERE id = ?"
  ).run(taskId);

  const run = db.prepare("SELECT * FROM task_runs WHERE id = ?").get(id);
  return NextResponse.json({ run }, { status: 201 });
}
