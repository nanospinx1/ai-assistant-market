"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Rocket,
  Target,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Activity,
  Plus,
  Headphones,
  Calculator,
  BarChart3,
  Palette,
  Monitor,
  Settings,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ── Category → Icon + gradient mapping ── */
const categoryIconMap: Record<string, { icon: LucideIcon; gradient: string }> = {
  "Customer Service": { icon: Headphones, gradient: "linear-gradient(135deg, #4F46E5, #818CF8)" },
  "Sales":            { icon: TrendingUp, gradient: "linear-gradient(135deg, #10B981, #34D399)" },
  "Finance":          { icon: Calculator, gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)" },
  "Analytics":        { icon: BarChart3,  gradient: "linear-gradient(135deg, #06B6D4, #67E8F9)" },
  "Marketing":        { icon: Palette,    gradient: "linear-gradient(135deg, #EC4899, #F472B6)" },
  "Human Resources":  { icon: Users,      gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)" },
  "HR":               { icon: Users,      gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)" },
  "IT Support":       { icon: Monitor,    gradient: "linear-gradient(135deg, #3B82F6, #60A5FA)" },
  "IT":               { icon: Monitor,    gradient: "linear-gradient(135deg, #3B82F6, #60A5FA)" },
  "Operations":       { icon: Settings,   gradient: "linear-gradient(135deg, #EF4444, #F87171)" },
};

function getCategoryVisual(category: string, role?: string) {
  // Try exact category match first, then fall back to role keyword matching
  for (const [key, val] of Object.entries(categoryIconMap)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return val;
  }
  if (role) {
    for (const [key, val] of Object.entries(categoryIconMap)) {
      if (role.toLowerCase().includes(key.toLowerCase())) return val;
    }
  }
  return { icon: Briefcase, gradient: "linear-gradient(135deg, #4F46E5, #7C3AED)" };
}

/* ── Types ── */
interface Deployment {
  id: string;
  name: string;
  employeeName: string;
  employeeRole: string;
  employeeAvatar: string;
  employeeCategory: string;
  status: "active" | "paused" | "stopped";
  accuracy: number;
  tasksCompleted: number;
  uptime: string;
}

interface PerformanceData {
  totalEmployees: number;
  activeDeployments: number;
  avgAccuracy: number;
  monthlySpend: number;
}

/* ── Static data ── */
const recentActivity = [
  { id: 1, action: "Deployed", target: "Customer Support Agent", time: "2 hours ago", icon: Rocket, dotColor: "#10B981" },
  { id: 2, action: "Updated config for", target: "Data Analyst Pro", time: "5 hours ago", icon: Activity, dotColor: "#3B82F6" },
  { id: 3, action: "Hired", target: "Content Writer AI", time: "1 day ago", icon: Plus, dotColor: "#8B5CF6" },
  { id: 4, action: "Performance review for", target: "Code Reviewer Bot", time: "2 days ago", icon: TrendingUp, dotColor: "#F59E0B" },
];

/* ── Loading skeleton with shimmer ── */
function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%);
          background-size: 800px 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="h-10 w-80 rounded-xl skeleton-shimmer" />
      <div className="h-5 w-56 rounded-lg skeleton-shimmer" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl skeleton-shimmer" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
        <div className="space-y-6">
          <div className="h-48 rounded-2xl skeleton-shimmer" />
          <div className="h-64 rounded-2xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard ── */
export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchData() {
      try {
        const [deploymentsRes, performanceRes] = await Promise.all([
          fetch(`/api/deployments`),
          fetch(`/api/performance`),
        ]);

        if (deploymentsRes.ok && performanceRes.ok) {
          const deps = await deploymentsRes.json();
          const perf = await performanceRes.json();

          const enriched = (deps.deployments ?? deps).map((d: any) => {
            const p = perf.find?.((p: any) => (p.deploymentId || p.deployment_id) === d.id);
            return {
              ...d,
              accuracy: p?.avgAccuracy ?? p?.avg_accuracy ?? 0,
              tasksCompleted: Math.round(p?.avgTasks ?? p?.avg_tasks ?? 0),
              uptime: `${(p?.avgUptime ?? p?.avg_uptime ?? 0).toFixed(1)}%`,
            };
          });
          setDeployments(enriched);

          const active = enriched.filter((d: any) => d.status === "active");
          setPerformance({
            totalEmployees: enriched.length,
            activeDeployments: active.length,
            avgAccuracy:
              perf.length > 0
                ? Math.round(
                    perf.reduce((s: number, p: any) => s + (p.avgAccuracy ?? p.avg_accuracy ?? 0), 0) /
                      perf.length
                  )
                : 0,
            monthlySpend: enriched.length * 299,
          });
        } else {
          if (deploymentsRes.ok) {
            const data = await deploymentsRes.json();
            setDeployments(data.deployments ?? data);
          }
        }
      } catch {
        // Fallback silently on fetch failure
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (authLoading || loading) return <LoadingSkeleton />;
  if (!user) return null;

  const stats: {
    label: string;
    value: string | number;
    icon: LucideIcon;
    gradient: string;
  }[] = [
    {
      label: "Total Employees",
      value: performance?.totalEmployees ?? deployments.length,
      icon: Users,
      gradient: "linear-gradient(135deg, #4F46E5, #6366F1)",
    },
    {
      label: "Active Deployments",
      value: performance?.activeDeployments ?? deployments.filter((d) => d.status === "active").length,
      icon: Rocket,
      gradient: "linear-gradient(135deg, #10B981, #34D399)",
    },
    {
      label: "Avg. Accuracy",
      value: `${performance?.avgAccuracy ?? 0}%`,
      icon: Target,
      gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
    },
    {
      label: "Monthly Spend",
      value: `$${performance?.monthlySpend?.toLocaleString() ?? "0"}`,
      icon: DollarSign,
      gradient: "linear-gradient(135deg, #EF4444, #F87171)",
    },
  ];

  const statusLabel: Record<string, string> = {
    active: "Active",
    paused: "Paused",
    stopped: "Stopped",
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Welcome back, {user?.name ?? "User"} 👋
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{today}</p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const gradientColor = stat.gradient.match(/#[A-Fa-f0-9]{6}/)?.[0] ?? "#4F46E5";
          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl p-6 border border-[var(--border)] card-hover"
              style={{
                background: `linear-gradient(135deg, ${gradientColor}08 0%, var(--bg-card) 60%)`,
                borderBottom: `3px solid ${gradientColor}40`,
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-lg"
                style={{ background: stat.gradient }}
              >
                <stat.icon size={20} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
              <p className="text-xs mt-1 text-[var(--text-secondary)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Main content: 2/3 + 1/3 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Your AI Team */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Your AI Team</h2>
            <Link
              href="/deploy"
              className="text-sm font-medium flex items-center gap-1 text-[var(--primary-light)] hover:underline"
            >
              Manage All <ArrowRight size={14} />
            </Link>
          </div>

          {deployments.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center border border-[var(--border)]"
              style={{ background: "var(--bg-card)" }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)", opacity: 0.8 }}
              >
                <Rocket size={32} className="text-white" />
              </div>
              <p className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                No deployments yet
              </p>
              <p className="text-sm text-[var(--text-secondary)] mb-5">
                Hire your first AI employee from the marketplace
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                  boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                }}
              >
                <Plus size={16} /> Hire Your First Employee
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {deployments.map((dep) => {
                const { icon: CategoryIcon, gradient } = getCategoryVisual(dep.employeeCategory || "", dep.employeeRole);
                const gradientColor = gradient.match(/#[A-Fa-f0-9]{6}/)?.[0] ?? "#4F46E5";
                return (
                  <div
                    key={dep.id}
                    className="rounded-2xl p-4 flex items-center gap-4 border border-[var(--border)] card-hover cursor-pointer transition-all duration-200"
                    style={{
                      background: "var(--bg-card)",
                      borderLeft: `3px solid ${gradientColor}`,
                    }}
                  >
                    {/* Icon avatar */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md"
                      style={{ background: gradient }}
                    >
                      <CategoryIcon size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-[var(--text-primary)]">
                        {dep.name}
                      </p>
                      <p className="text-sm truncate text-[var(--text-secondary)]">
                        {dep.employeeRole || dep.employeeName}
                        {dep.employeeCategory && (
                          <span className="text-[var(--text-muted)]"> · {dep.employeeCategory}</span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        Last active: {dep.status === "active" ? "Just now" : "2h ago"}
                      </p>
                    </div>
                    <span
                      className={`status-${dep.status} px-3 py-1 rounded-full text-xs font-semibold`}
                    >
                      {statusLabel[dep.status] ?? dep.status}
                    </span>
                    <div className="hidden sm:flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-base font-bold text-[var(--text-primary)]">{dep.accuracy}%</p>
                        <p className="text-xs text-[var(--text-muted)]">Accuracy</p>
                      </div>
                      <div className="text-center">
                        <p className="text-base font-bold text-[var(--text-primary)]">{dep.tasksCompleted}</p>
                        <p className="text-xs text-[var(--text-muted)]">Tasks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-base font-bold text-[var(--text-primary)]">{dep.uptime}</p>
                        <p className="text-xs text-[var(--text-muted)]">Uptime</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div
            className="rounded-2xl p-6 border border-[var(--border)]"
            style={{ background: "var(--bg-card)" }}
          >
            <h3 className="text-base font-semibold mb-4 text-[var(--text-primary)]">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/marketplace"
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
                style={{ background: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, rgba(79,70,229,0.08), rgba(129,140,248,0.04))")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: "linear-gradient(135deg, #4F46E5, #818CF8)" }}
                >
                  <Users size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Hire New Employee</p>
                  <p className="text-xs text-[var(--text-muted)]">Browse the marketplace</p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-[var(--text-muted)] group-hover:text-[var(--primary-light)] transition-all duration-200 group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/custom-builder"
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
                style={{ background: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.04))")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: "linear-gradient(135deg, #10B981, #34D399)" }}
                >
                  <Briefcase size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Build Custom</p>
                  <p className="text-xs text-[var(--text-muted)]">Design your own AI employee</p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-all duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div
            className="rounded-2xl p-6 border border-[var(--border)]"
            style={{ background: "var(--bg-card)" }}
          >
            <h3 className="text-base font-semibold mb-4 text-[var(--text-primary)]">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(79, 70, 229, 0.12)" }}
                  >
                    <item.icon size={14} className="text-[var(--primary-light)]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0 mt-0.5"
                        style={{ background: item.dotColor }}
                      />
                      <p className="text-sm text-[var(--text-primary)]">
                        {item.action}{" "}
                        <span className="font-semibold">{item.target}</span>
                      </p>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] ml-4 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
