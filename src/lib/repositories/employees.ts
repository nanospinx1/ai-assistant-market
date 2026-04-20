/**
 * Employee repository — SQL access for ai_employees table.
 */
import { getDb } from "@/lib/db";

export interface EmployeeRow {
  id: string;
  name: string;
  role: string;
  category: string;
  description: string;
  long_description: string | null;
  capabilities: string;
  price_monthly: number;
  price_yearly: number | null;
  rating: number;
  reviews_count: number;
  avatar: string;
  is_prebuilt: number;
  created_by: string | null;
  agent_type: string | null;
  system_prompt: string | null;
  custom_instructions: string | null;
  default_tools: string | null;
  default_knowledge: string | null;
  is_published: number | null;
  publish_status: string | null;
}

/** Parse JSON fields on an employee row for API consumption. */
export function serializeEmployee(e: EmployeeRow) {
  return {
    ...e,
    capabilities: JSON.parse(e.capabilities || "[]"),
    default_tools: e.default_tools ? JSON.parse(e.default_tools) : [],
    default_knowledge: e.default_knowledge ? JSON.parse(e.default_knowledge) : [],
    is_prebuilt: !!e.is_prebuilt,
    is_published: !!e.is_published,
  };
}

/* ---- Read ---- */

export function findById(id: string): EmployeeRow | undefined {
  return getDb().prepare("SELECT * FROM ai_employees WHERE id = ?").get(id) as EmployeeRow | undefined;
}

/** Public marketplace listing: prebuilt + approved community agents. */
export function listPublic(): EmployeeRow[] {
  return getDb().prepare(`
    SELECT * FROM ai_employees
    WHERE is_prebuilt = 1 OR (is_prebuilt = 0 AND publish_status = 'approved')
    ORDER BY rating DESC
  `).all() as EmployeeRow[];
}

/** Single employee visible to a specific user (prebuilt, approved, or own). */
export function findAccessible(id: string, userId: string): EmployeeRow | undefined {
  return getDb().prepare(`
    SELECT * FROM ai_employees
    WHERE id = ? AND (is_prebuilt = 1 OR publish_status = 'approved' OR created_by = ?)
  `).get(id, userId) as EmployeeRow | undefined;
}

/* ---- Write ---- */

export function createCustom(params: {
  id: string;
  name: string;
  role: string;
  category: string;
  description: string;
  longDescription?: string;
  capabilities: string[];
  priceMonthly: number;
  priceYearly?: number;
  avatar: string;
  createdBy: string;
  defaultTools?: string[];
  defaultKnowledge?: string[];
  customInstructions?: string;
}): void {
  getDb().prepare(`
    INSERT INTO ai_employees (
      id, name, role, category, description, long_description, capabilities,
      price_monthly, price_yearly, avatar, is_prebuilt, created_by,
      agent_type, default_tools, default_knowledge, custom_instructions
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'custom', ?, ?, ?)
  `).run(
    params.id, params.name, params.role, params.category,
    params.description, params.longDescription || null,
    JSON.stringify(params.capabilities),
    params.priceMonthly, params.priceYearly || null,
    params.avatar, params.createdBy,
    params.defaultTools ? JSON.stringify(params.defaultTools) : null,
    params.defaultKnowledge ? JSON.stringify(params.defaultKnowledge) : null,
    params.customInstructions || null,
  );
}

/** Update publish status fields for marketplace submission. */
export function updatePublishStatus(
  id: string,
  fields: { is_published?: number; publish_status?: string; publish_submitted_at?: string },
): void {
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(fields)) {
    sets.push(`${k} = ?`);
    vals.push(v);
  }
  if (sets.length === 0) return;
  vals.push(id);
  getDb().prepare(`UPDATE ai_employees SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
}
