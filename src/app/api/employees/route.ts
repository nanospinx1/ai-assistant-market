import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  seedDatabase();
  const db = getDb();

  // Check if a specific employee ID was requested (for deploy page)
  const { searchParams } = new URL(req.url);
  const specificId = searchParams.get("id");

  if (specificId) {
    // Return a single employee by ID (prebuilt, approved community, or user's own)
    const { user } = await requireAuth();
    const employee = db.prepare(`
      SELECT * FROM ai_employees
      WHERE id = ? AND (is_prebuilt = 1 OR publish_status = 'approved' OR created_by = ?)
    `).get(specificId, user?.id ?? "") as any;
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...employee,
      capabilities: JSON.parse(employee.capabilities || "[]"),
      default_tools: employee.default_tools ? JSON.parse(employee.default_tools) : [],
      default_knowledge: employee.default_knowledge ? JSON.parse(employee.default_knowledge) : [],
      is_prebuilt: !!employee.is_prebuilt,
      is_published: !!employee.is_published,
    });
  }

  // List: marketplace shows ONLY public agents (prebuilt + approved community)
  // User's private custom agents are only visible via ?id= param or in Deployments
  const employees = db.prepare(`
    SELECT * FROM ai_employees
    WHERE is_prebuilt = 1
       OR (is_prebuilt = 0 AND publish_status = 'approved')
    ORDER BY rating DESC
  `).all();
  const parsed = employees.map((e: any) => ({
    ...e,
    capabilities: JSON.parse(e.capabilities || "[]"),
    default_tools: e.default_tools ? JSON.parse(e.default_tools) : [],
    is_prebuilt: !!e.is_prebuilt,
    is_published: !!e.is_published,
  }));
  return NextResponse.json(parsed);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const db = getDb();
  const {
    id, name, role, category, description, long_description,
    capabilities, price_monthly, price_yearly, avatar,
    system_prompt, custom_instructions, default_tools, default_knowledge,
  } = body;

  db.prepare(`
    INSERT INTO ai_employees (
      id, name, role, category, description, long_description, capabilities,
      price_monthly, price_yearly, avatar, is_prebuilt, created_by,
      agent_type, default_tools, default_knowledge, custom_instructions
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'custom', ?, ?, ?)
  `).run(
    id, name, role, category, description, long_description,
    JSON.stringify(capabilities), price_monthly, price_yearly, avatar,
    user.id,
    default_tools ? JSON.stringify(default_tools) : null,
    default_knowledge ? JSON.stringify(default_knowledge) : null,
    custom_instructions || system_prompt || null,
  );

  return NextResponse.json({ success: true, id });
}
