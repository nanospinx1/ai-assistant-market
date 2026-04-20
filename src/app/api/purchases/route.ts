import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as EmployeeRepo from "@/lib/repositories/employees";
import * as UserRepo from "@/lib/repositories/users";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { employee_id, plan } = await req.json();
  if (!employee_id) {
    return NextResponse.json({ error: "employee_id is required" }, { status: 400 });
  }

  const emp = EmployeeRepo.findById(employee_id);
  if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  const dbUser = UserRepo.findUserById(user.id);
  if (!dbUser) {
    return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
  }

  const selectedPlan = plan || "monthly";
  const amount = selectedPlan === "yearly" ? (emp.price_yearly || emp.price_monthly * 10) : emp.price_monthly;
  const purchaseId = uuid();

  try {
    getDb().prepare(`
      INSERT INTO purchases (id, user_id, employee_id, plan, amount, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `).run(purchaseId, user.id, employee_id, selectedPlan, amount);

    return NextResponse.json({ success: true, id: purchaseId });
  } catch (e: any) {
    console.error("Purchase error:", e.message);
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}
