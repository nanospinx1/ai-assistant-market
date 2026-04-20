import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as EmployeeRepo from "@/lib/repositories/employees";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specificId = searchParams.get("id");

  if (specificId) {
    const { user } = await requireAuth();
    const employee = EmployeeRepo.findAccessible(specificId, user?.id ?? "");
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json(EmployeeRepo.serializeEmployee(employee));
  }

  const employees = EmployeeRepo.listPublic();
  const parsed = employees.map((e) => EmployeeRepo.serializeEmployee(e));
  return NextResponse.json(parsed);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const {
    id, name, role, category, description, long_description,
    capabilities, price_monthly, price_yearly, avatar,
    system_prompt, custom_instructions, default_tools, default_knowledge,
  } = body;

  EmployeeRepo.createCustom({
    id, name, role, category, description,
    longDescription: long_description,
    capabilities: capabilities || [],
    priceMonthly: price_monthly,
    priceYearly: price_yearly,
    avatar,
    createdBy: user.id,
    defaultTools: default_tools,
    defaultKnowledge: default_knowledge,
    customInstructions: custom_instructions || system_prompt,
  });

  return NextResponse.json({ success: true, id });
}
