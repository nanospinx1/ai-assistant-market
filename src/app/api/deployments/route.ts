import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

export async function GET(req: NextRequest) {
  seedDatabase();
  const db = getDb();
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const deployments = db.prepare(`
    SELECT d.*, e.name as employee_name, e.role as employee_role, e.avatar as employee_avatar, e.category as employee_category
    FROM deployments d
    JOIN ai_employees e ON d.employee_id = e.id
    WHERE d.user_id = ?
    ORDER BY d.created_at DESC
  `).all(userId);

  const parsed = deployments.map((d: any) => ({
    ...d,
    config: JSON.parse(d.config || "{}"),
    employeeName: d.employee_name,
    employeeRole: d.employee_role,
    employeeAvatar: d.employee_avatar,
    employeeCategory: d.employee_category,
  }));

  return NextResponse.json(parsed);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const { id, user_id, employee_id, name, config } = body;

  db.prepare(`
    INSERT INTO deployments (id, user_id, employee_id, name, status, config)
    VALUES (?, ?, ?, ?, 'configuring', ?)
  `).run(id, user_id, employee_id, name, JSON.stringify(config));

  return NextResponse.json({ success: true, id });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const { id, status } = body;

  if (status === "active") {
    db.prepare("UPDATE deployments SET status = ?, deployed_at = datetime('now') WHERE id = ?").run(status, id);
  } else {
    db.prepare("UPDATE deployments SET status = ? WHERE id = ?").run(status, id);
  }

  return NextResponse.json({ success: true });
}
