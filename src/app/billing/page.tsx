"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/layout/Providers";
import {
  CreditCard,
  Crown,
  Zap,
  ArrowUpRight,
  Check,
  X,
  Download,
  ChevronUp,
  ChevronDown,
  FileText,
} from "lucide-react";

interface PlanInfo {
  name: string;
  price: number;
  agents: number | string;
  prioritySupport: boolean;
  customModels: boolean;
  apiAccess: boolean;
  sla: string;
  tokenQuota: number;
  renewalDate: string;
}

interface UsageInfo {
  tokensUsed: number;
  tokensRemaining: number;
  monthlyLimit: number;
  percentUsed: number;
}

interface DeploymentUsage {
  deployment_id: string;
  deployment_name: string;
  agent_name: string;
  tokens_used: number;
  cost_usd: number;
  last_active: string | null;
}

interface Invoice {
  id: string;
  date: string;
  plan: string;
  amount: number;
  status: string;
}

interface PlanOption {
  name: string;
  price: number;
  agents: number | string;
  prioritySupport: boolean;
  customModels: boolean;
  apiAccess: boolean;
  sla: string;
  tokenQuota: number;
}

interface BillingData {
  plan: PlanInfo;
  usage: UsageInfo;
  deploymentUsage: DeploymentUsage[];
  invoices: Invoice[];
  allPlans: PlanOption[];
}

const PLAN_ORDER = ["free", "starter", "professional", "enterprise"];

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function formatCost(n: number): string {
  return `$${n.toFixed(4)}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function usageColor(percent: number): string {
  if (percent > 90) return "#ef4444";
  if (percent > 70) return "#f59e0b";
  return "#22c55e";
}

function usageGradient(percent: number): string {
  if (percent > 90) return "linear-gradient(90deg, #ef4444, #dc2626)";
  if (percent > 70) return "linear-gradient(90deg, #f59e0b, #d97706)";
  return "linear-gradient(90deg, #22c55e, #16a34a)";
}

export default function BillingPage() {
  const { user } = useAuth();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (!user) return;
    fetch("/api/billing")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const sortedDeployments = useMemo(() => {
    if (!data) return [];
    const sorted = [...data.deploymentUsage];
    sorted.sort((a, b) =>
      sortDir === "desc" ? b.tokens_used - a.tokens_used : a.tokens_used - b.tokens_used
    );
    return sorted;
  }, [data, sortDir]);

  const maxTokens = useMemo(() => {
    if (!sortedDeployments.length) return 1;
    return Math.max(...sortedDeployments.map((d) => d.tokens_used), 1);
  }, [sortedDeployments]);

  function handlePlanAction(planName: string) {
    alert(`Plan change to "${planName}" coming soon.`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
          />
          <p className="text-sm text-[var(--text-muted)]">Loading billing info…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--text-muted)]">Failed to load billing data.</p>
      </div>
    );
  }

  const { plan, usage, invoices, allPlans } = data;
  const currentPlanIndex = PLAN_ORDER.indexOf(plan.name);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
          <CreditCard size={28} />
          Billing & Subscription
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Manage your plan, monitor usage, and view invoices.
        </p>
      </div>

      {/* Section A: Current Plan Card */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-primary)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
              }}
            >
              <Crown size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] capitalize">
                {plan.name} Plan
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {plan.price === 0 ? "Free" : `$${plan.price}/month`}
                {" · "}
                {formatTokens(plan.tokenQuota)} tokens/month
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-[var(--text-muted)]">
              Renews {formatDate(plan.renewalDate)}
            </p>
            {plan.name !== "enterprise" && (
              <button
                onClick={() => {
                  const nextPlan = PLAN_ORDER[currentPlanIndex + 1];
                  if (nextPlan) handlePlanAction(nextPlan);
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #7C3AED)",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
                }}
              >
                <ArrowUpRight size={16} />
                Upgrade
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">
              {formatTokens(usage.tokensUsed)} of {formatTokens(usage.monthlyLimit)} tokens used
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: usageColor(usage.percentUsed) }}
            >
              {usage.percentUsed}%
            </span>
          </div>
          <div
            className="w-full h-3 rounded-full overflow-hidden"
            style={{ background: "var(--bg-surface, rgba(255,255,255,0.05))" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(usage.percentUsed, 100)}%`,
                background: usageGradient(usage.percentUsed),
              }}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            {formatTokens(usage.tokensRemaining)} tokens remaining this period
          </p>
        </div>
      </div>

      {/* Section B: Plan Comparison Grid */}
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Zap size={20} />
          Compare Plans
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allPlans.map((p) => {
            const isCurrent = p.name === plan.name;
            const planIndex = PLAN_ORDER.indexOf(p.name);
            const isUpgrade = planIndex > currentPlanIndex;
            const isDowngrade = planIndex < currentPlanIndex;

            return (
              <div
                key={p.name}
                className="rounded-2xl p-5 border relative flex flex-col"
                style={{
                  background: "var(--bg-card)",
                  borderColor: isCurrent ? "transparent" : "var(--border-primary)",
                  borderWidth: "2px",
                  ...(isCurrent
                    ? {
                        borderImage: "linear-gradient(135deg, #4F46E5, #7C3AED) 1",
                      }
                    : {}),
                }}
              >
                {isCurrent && (
                  <span
                    className="absolute -top-3 left-4 px-3 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
                  >
                    Current Plan
                  </span>
                )}
                <h3 className="text-base font-bold text-[var(--text-primary)] capitalize mt-1">
                  {p.name}
                </h3>
                <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-2">
                  {p.price === 0 ? "Free" : `$${p.price}`}
                  {p.price > 0 && (
                    <span className="text-sm font-normal text-[var(--text-muted)]">/mo</span>
                  )}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {formatTokens(p.tokenQuota)} tokens/month
                </p>

                <ul className="mt-4 space-y-2 text-sm flex-1">
                  <PlanFeature label={`${p.agents} Agents`} available />
                  <PlanFeature label="Priority Support" available={p.prioritySupport} />
                  <PlanFeature label="Custom Models" available={p.customModels} />
                  <PlanFeature label="API Access" available={p.apiAccess} />
                  <li className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <span className="text-xs">SLA:</span>
                    <span className="font-medium">{p.sla}</span>
                  </li>
                </ul>

                <div className="mt-4 pt-3 border-t border-[var(--border-primary)]">
                  {isCurrent ? (
                    <span className="block text-center text-sm font-medium text-[var(--text-muted)]">
                      Active
                    </span>
                  ) : isUpgrade ? (
                    <button
                      onClick={() => handlePlanAction(p.name)}
                      className="w-full py-2 rounded-xl text-sm font-semibold text-white"
                      style={{
                        background: "linear-gradient(135deg, #6366F1, #7C3AED)",
                        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                      }}
                    >
                      Upgrade
                    </button>
                  ) : isDowngrade ? (
                    <button
                      onClick={() => handlePlanAction(p.name)}
                      className="w-full text-center text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer bg-transparent border-none"
                    >
                      Downgrade
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section C: Usage Breakdown */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-primary)",
        }}
      >
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <FileText size={20} />
          Usage Breakdown
        </h2>

        {sortedDeployments.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-8 text-center">
            No deployment usage data yet. Deploy an agent to see usage here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border-primary)]">
                  <th className="pb-3 font-medium">Agent</th>
                  <th
                    className="pb-3 font-medium cursor-pointer select-none"
                    onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                  >
                    <span className="inline-flex items-center gap-1">
                      Tokens Used
                      {sortDir === "desc" ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </span>
                  </th>
                  <th className="pb-3 font-medium">Cost Est.</th>
                  <th className="pb-3 font-medium">Last Active</th>
                  <th className="pb-3 font-medium w-48">Usage</th>
                </tr>
              </thead>
              <tbody>
                {sortedDeployments.map((d) => {
                  const barWidth = maxTokens > 0 ? (d.tokens_used / maxTokens) * 100 : 0;
                  return (
                    <tr
                      key={d.deployment_id}
                      className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{d.agent_name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{d.deployment_name}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-mono text-[var(--text-primary)]">
                        {formatTokens(d.tokens_used)}
                      </td>
                      <td className="py-3 pr-4 text-[var(--text-secondary)]">
                        {formatCost(d.cost_usd)}
                      </td>
                      <td className="py-3 pr-4 text-[var(--text-secondary)]">
                        {formatDate(d.last_active)}
                      </td>
                      <td className="py-3">
                        <div
                          className="w-full h-2.5 rounded-full overflow-hidden"
                          style={{ background: "var(--bg-surface, rgba(255,255,255,0.05))" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${barWidth}%`,
                              background: "linear-gradient(90deg, #6366F1, #7C3AED)",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section D: Invoice History */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-primary)",
        }}
      >
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <CreditCard size={20} />
          Invoice History
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border-primary)]">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <td className="py-3 pr-4 text-[var(--text-primary)]">
                    {formatDate(inv.date)}
                  </td>
                  <td className="py-3 pr-4 text-[var(--text-secondary)]">{inv.plan}</td>
                  <td className="py-3 pr-4 font-mono text-[var(--text-primary)]">
                    {inv.amount === 0 ? "Free" : `$${inv.amount.toFixed(2)}`}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                      <Check size={12} />
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      disabled
                      className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] opacity-50 cursor-not-allowed"
                      title="Coming soon"
                    >
                      <Download size={14} />
                      Coming soon
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PlanFeature({ label, available }: { label: string; available: boolean }) {
  return (
    <li className="flex items-center gap-2">
      {available ? (
        <Check size={14} className="text-green-400 shrink-0" />
      ) : (
        <X size={14} className="text-[var(--text-muted)] shrink-0" />
      )}
      <span className={available ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}>
        {label}
      </span>
    </li>
  );
}
