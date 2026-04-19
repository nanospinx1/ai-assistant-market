import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  seedDatabase();
  const db = getDb();
  const employees = db.prepare("SELECT * FROM ai_employees ORDER BY rating DESC").all();
  const parsed = employees.map((e: any) => ({
    ...e,
    capabilities: JSON.parse(e.capabilities || "[]"),
    is_prebuilt: !!e.is_prebuilt,
  }));
  return NextResponse.json(parsed);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const db = getDb();
  const { id, name, role, category, description, long_description, capabilities, price_monthly, price_yearly, avatar } = body;

  db.prepare(`
    INSERT INTO ai_employees (id, name, role, category, description, long_description, capabilities, price_monthly, price_yearly, avatar, is_prebuilt, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(id, name, role, category, description, long_description, JSON.stringify(capabilities), price_monthly, price_yearly, avatar, user.id);

  return NextResponse.json({ success: true, id });
}
