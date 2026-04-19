// POST /api/marketplace/submit — Submit a custom agent to the global marketplace
// GET /api/marketplace/submit — List user's submissions
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { employeeId } = body;

  if (!employeeId) {
    return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
  }

  const db = getDb();

  // Verify the employee exists and belongs to the user (custom employee)
  const employee = db
    .prepare("SELECT * FROM ai_employees WHERE id = ? AND created_by = ?")
    .get(employeeId, user.id) as any;

  if (!employee) {
    return NextResponse.json(
      { error: "Employee not found or you don't have permission to submit it" },
      { status: 404 }
    );
  }

  // Check for existing submission
  const existing = db
    .prepare("SELECT * FROM marketplace_submissions WHERE employee_id = ? AND status IN ('pending', 'approved')")
    .get(employeeId) as any;

  if (existing) {
    return NextResponse.json(
      { error: "This employee has already been published to the marketplace" },
      { status: 409 }
    );
  }

  // Create immutable snapshot of the employee at submission time
  const snapshot = JSON.stringify({
    id: employee.id,
    name: employee.name,
    role: employee.role,
    description: employee.description,
    category: employee.category,
    capabilities: employee.capabilities,
    price_monthly: employee.price_monthly,
    price_yearly: employee.price_yearly,
    system_prompt: employee.system_prompt,
    agent_type: employee.agent_type,
    submitted_at: new Date().toISOString(),
  });

  const submissionId = uuid();
  db.prepare(`
    INSERT INTO marketplace_submissions (id, employee_id, submitted_by, status, snapshot)
    VALUES (?, ?, ?, 'approved', ?)
  `).run(submissionId, employeeId, user.id, snapshot);

  // Auto-approve for MVP: mark the employee as published
  db.prepare(`
    UPDATE ai_employees SET is_published = 1, publish_status = 'approved', publisher_name = ?
    WHERE id = ?
  `).run(user.name || user.email, employeeId);

  return NextResponse.json({ success: true, id: submissionId, status: "approved" });
}

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const db = getDb();
  const submissions = db
    .prepare(
      `SELECT ms.*, e.name as employee_name, e.role as employee_role
       FROM marketplace_submissions ms
       JOIN ai_employees e ON ms.employee_id = e.id
       WHERE ms.submitted_by = ?
       ORDER BY ms.created_at DESC`
    )
    .all(user.id);

  const parsed = submissions.map((s: any) => ({
    ...s,
    snapshot: JSON.parse(s.snapshot || "{}"),
    employeeName: s.employee_name,
    employeeRole: s.employee_role,
    createdAt: s.created_at,
  }));

  return NextResponse.json(parsed);
}
