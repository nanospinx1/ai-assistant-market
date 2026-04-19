import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const db = getDb();
  const { employee_id, plan } = body;

  if (!employee_id) {
    return NextResponse.json({ error: "employee_id is required" }, { status: 400 });
  }

  const emp = db.prepare("SELECT * FROM ai_employees WHERE id = ?").get(employee_id) as any;
  if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  // Verify user exists in DB (JWT may have stale ID after DB reset)
  const dbUser = db.prepare("SELECT id FROM users WHERE id = ?").get(user.id) as any;
  if (!dbUser) {
    return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
  }

  const selectedPlan = plan || "monthly";
  const amount = selectedPlan === "yearly" ? (emp.price_yearly || emp.price_monthly * 10) : emp.price_monthly;
  const purchaseId = uuid();

  try {
    db.prepare(`
      INSERT INTO purchases (id, user_id, employee_id, plan, amount, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `).run(purchaseId, user.id, employee_id, selectedPlan, amount);

    return NextResponse.json({ success: true, id: purchaseId });
  } catch (e: any) {
    console.error("Purchase error:", e.message);
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}
