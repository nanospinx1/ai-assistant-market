import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getQuotaStatus } from "@/lib/agents/usage-meter";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

const PLAN_DETAILS: Record<string, { price: number; agents: number | string; prioritySupport: boolean; customModels: boolean; apiAccess: boolean; sla: string }> = {
  free:         { price: 0,   agents: 2,           prioritySupport: false, customModels: false, apiAccess: false, sla: "-" },
  starter:      { price: 29,  agents: 5,           prioritySupport: false, customModels: false, apiAccess: true,  sla: "99%" },
  professional: { price: 79,  agents: 15,          prioritySupport: true,  customModels: true,  apiAccess: true,  sla: "99.9%" },
  enterprise:   { price: 199, agents: "Unlimited", prioritySupport: true,  customModels: true,  apiAccess: true,  sla: "99.99%" },
};

const PLAN_TOKEN_LIMITS: Record<string, number> = {
  free: 100_000,
  starter: 500_000,
  professional: 2_000_000,
  enterprise: 10_000_000,
};

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  seedDatabase();
  const db = getDb();
  const quota = getQuotaStatus(user.id);

  // Per-deployment usage breakdown
  const deploymentUsage = db.prepare(`
    SELECT
      d.id as deployment_id,
      d.name as deployment_name,
      e.name as agent_name,
      COALESCE(SUM(ul.total_tokens), 0) as tokens_used,
      COALESCE(SUM(ul.cost_usd), 0) as cost_usd,
      MAX(ul.created_at) as last_active
    FROM deployments d
    JOIN ai_employees e ON d.employee_id = e.id
    LEFT JOIN usage_logs ul ON ul.deployment_id = d.id
    WHERE d.user_id = ?
    GROUP BY d.id, d.name, e.name
    ORDER BY tokens_used DESC
  `).all(user.id);

  const currentPlan = quota.plan || "free";
  const details = PLAN_DETAILS[currentPlan] || PLAN_DETAILS.free;

  // Mock renewal date: 30 days from now
  const renewalDate = new Date();
  renewalDate.setDate(renewalDate.getDate() + 30);

  // Mock invoice history: last 3 months
  const now = new Date();
  const invoices = [0, 1, 2].map((monthsAgo) => {
    const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    return {
      id: `inv-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      date: date.toISOString().split("T")[0],
      plan: currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1),
      amount: details.price,
      status: "Paid" as const,
    };
  });

  return NextResponse.json({
    plan: {
      name: currentPlan,
      ...details,
      tokenQuota: quota.monthlyLimit,
      renewalDate: renewalDate.toISOString().split("T")[0],
    },
    usage: {
      tokensUsed: quota.tokensUsed,
      tokensRemaining: quota.tokensAvailable,
      monthlyLimit: quota.monthlyLimit,
      percentUsed: quota.percentUsed,
    },
    deploymentUsage,
    invoices,
    allPlans: Object.entries(PLAN_DETAILS).map(([name, info]) => ({
      name,
      ...info,
      tokenQuota: PLAN_TOKEN_LIMITS[name],
    })),
  });
}
