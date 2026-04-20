// POST /api/marketplace/submit — Submit a custom agent to the global marketplace
// GET /api/marketplace/submit — List user's submissions
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";
import * as EmployeeRepo from "@/lib/repositories/employees";
import * as NotificationRepo from "@/lib/repositories/notifications";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { employeeId, specialty, toolIntegrations, bestFor, useCases } = body;

  if (!employeeId) {
    return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
  }

  const db = getDb();

  // Verify the employee exists and belongs to the user
  const employee = db
    .prepare("SELECT * FROM ai_employees WHERE id = ? AND created_by = ?")
    .get(employeeId, user.id) as any;

  if (!employee) {
    return NextResponse.json({ error: "Employee not found or you don't have permission" }, { status: 404 });
  }

  // Check for existing submission
  const existing = db
    .prepare("SELECT * FROM marketplace_submissions WHERE employee_id = ? AND status IN ('pending', 'approved')")
    .get(employeeId) as any;

  if (existing) {
    return NextResponse.json({ error: "This employee has already been published to the marketplace" }, { status: 409 });
  }

  // Quality gate validation
  const errors: string[] = [];
  if (!specialty || typeof specialty !== "string" || specialty.trim().length < 100) {
    errors.push("Specialty description must be at least 100 characters");
  }
  if (!Array.isArray(toolIntegrations) || toolIntegrations.length < 2) {
    errors.push("At least 2 tool integrations are required");
  }
  if (!Array.isArray(bestFor) || bestFor.length < 1) {
    errors.push("At least 1 target audience tag is required");
  }
  if (!Array.isArray(useCases) || useCases.length < 2) {
    errors.push("At least 2 sample use cases are required");
  } else {
    const validCases = useCases.filter((uc: any) => uc.title && uc.description && uc.outcome);
    if (validCases.length < 2) {
      errors.push("Each use case must have a title, description, and outcome");
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: "Quality gates not met", details: errors }, { status: 422 });
  }

  const portfolio = {
    specialty: specialty.trim(),
    toolIntegrations: toolIntegrations.map((t: any) => ({ name: t.name || "", note: t.note || "" })),
    bestFor: bestFor.filter((t: unknown) => typeof t === "string"),
    useCases: useCases.map((uc: any) => ({ title: uc.title || "", description: uc.description || "", outcome: uc.outcome || "" })),
  };

  const snapshot = JSON.stringify({
    id: employee.id, name: employee.name, role: employee.role,
    description: employee.description, category: employee.category,
    capabilities: employee.capabilities,
    price_monthly: employee.price_monthly, price_yearly: employee.price_yearly,
    agent_type: employee.agent_type,
    submitted_at: new Date().toISOString(),
    publisher: user.name || user.email,
    ...portfolio,
  });

  const submissionId = uuid();

  // Auto-approve for now (TODO: admin review dashboard)
  db.prepare(`
    INSERT INTO marketplace_submissions (id, employee_id, submitted_by, status, snapshot)
    VALUES (?, ?, ?, 'approved', ?)
  `).run(submissionId, employeeId, user.id, snapshot);

  EmployeeRepo.updatePublishStatus(employeeId, {
    is_published: 1,
    publish_status: "approved",
  });

  db.prepare("UPDATE ai_employees SET publisher_name = ? WHERE id = ?").run(user.name || user.email, employeeId);

  NotificationRepo.create({
    userId: user.id,
    type: "publish_update",
    title: "Agent published to marketplace",
    message: `"${employee.name}" is now live on the marketplace`,
    link: "/marketplace",
  });

  return NextResponse.json({ success: true, id: submissionId, status: "approved" });
}

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const db = getDb();
  const employeeIdFilter = req.nextUrl.searchParams.get("employeeId");

  let submissions: unknown[];
  if (employeeIdFilter) {
    submissions = db
      .prepare(`SELECT ms.*, e.name as employee_name, e.role as employee_role
         FROM marketplace_submissions ms JOIN ai_employees e ON ms.employee_id = e.id
         WHERE ms.submitted_by = ? AND ms.employee_id = ? ORDER BY ms.submitted_at DESC`)
      .all(user.id, employeeIdFilter);
  } else {
    submissions = db
      .prepare(`SELECT ms.*, e.name as employee_name, e.role as employee_role
         FROM marketplace_submissions ms JOIN ai_employees e ON ms.employee_id = e.id
         WHERE ms.submitted_by = ? ORDER BY ms.submitted_at DESC`)
      .all(user.id);
  }

  const parsed = (submissions as any[]).map((s: any) => ({
    ...s,
    snapshot: JSON.parse(s.snapshot || "{}"),
    employeeName: s.employee_name,
    employeeRole: s.employee_role,
    createdAt: s.created_at,
  }));

  return NextResponse.json(parsed);
}
