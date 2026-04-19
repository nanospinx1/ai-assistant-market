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

  const emp = db.prepare("SELECT * FROM ai_employees WHERE id = ?").get(employee_id) as any;
  if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  const amount = plan === "yearly" ? emp.price_yearly : emp.price_monthly;
  const purchaseId = uuid();

  // Create purchase record only — deployment is created during the 3-stage config flow
  db.prepare(`
    INSERT INTO purchases (id, user_id, employee_id, plan, amount, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `).run(purchaseId, user.id, employee_id, plan, amount);

  return NextResponse.json({ success: true, id: purchaseId });
}
