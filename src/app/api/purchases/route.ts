import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const { user_id, employee_id, plan } = body;

  const emp = db.prepare("SELECT * FROM ai_employees WHERE id = ?").get(employee_id) as any;
  if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  const amount = plan === "yearly" ? emp.price_yearly : emp.price_monthly;
  const purchaseId = uuid();

  db.prepare(`
    INSERT INTO purchases (id, user_id, employee_id, plan, amount, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `).run(purchaseId, user_id, employee_id, plan, amount);

  return NextResponse.json({ success: true, id: purchaseId });
}
