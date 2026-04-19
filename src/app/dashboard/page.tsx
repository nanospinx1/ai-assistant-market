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
} from "lucide-react";

interface Deployment {
  id: string;
  employeeName: string;
  employeeRole: string;
  employeeAvatar: string;
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

const recentActivity = [
  { id: 1, action: "Deployed", target: "Customer Support Agent", time: "2 hours ago", icon: Rocket },
  { id: 2, action: "Updated config for", target: "Data Analyst Pro", time: "5 hours ago", icon: Activity },
  { id: 3, action: "Hired", target: "Content Writer AI", time: "1 day ago", icon: Plus },
  { id: 4, action: "Performance review for", target: "Code Reviewer Bot", time: "2 days ago", icon: TrendingUp },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-72 rounded-lg" style={{ background: "var(--bg-card)" }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl" style={{ background: "var(--bg-card)" }} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl" style={{ background: "var(--bg-card)" }} />
        ))}
      </div>
    </div>
  );
}

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
          fetch(`/api/deployments?userId=${user!.id}`),
          fetch(`/api/performance?userId=${user!.id}`),
        ]);

        if (deploymentsRes.ok && performanceRes.ok) {
          const deps = await deploymentsRes.json();
          const perf = await performanceRes.json();
          
          // Merge performance data into deployments
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
          
          // Build summary
          const active = enriched.filter((d: any) => d.status === "active");
          setPerformance({
            totalEmployees: enriched.length,
            activeDeployments: active.length,
            avgAccuracy: perf.length > 0 ? Math.round(perf.reduce((s: number, p: any) => s + (p.avgAccuracy ?? p.avg_accuracy ?? 0), 0) / perf.length) : 0,
            monthlySpend: enriched.length * 299,
          });
        } else {
          if (deploymentsRes.ok) {
            const data = await deploymentsRes.json();
            setDeployments(data.deployments ?? data);
          }
        }
      } catch {
        // Fallback to demo data on fetch failure
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (authLoading || loading) {
    return <LoadingSkeleton />;
  }

  if (!user) return null;

  const stats = [
    {
      label: "Total Employees",
      value: performance?.totalEmployees ?? deployments.length,
      icon: Users,
      color: "var(--primary)",
      bg: "rgba(99, 102, 241, 0.1)",
    },
    {
      label: "Active Deployments",
      value: performance?.activeDeployments ?? deployments.filter((d) => d.status === "active").length,
      icon: Rocket,
      color: "var(--success)",
      bg: "rgba(34, 197, 94, 0.1)",
    },
    {
      label: "Avg. Accuracy",
      value: `${performance?.avgAccuracy ?? 0}%`,
      icon: Target,
      color: "var(--accent)",
      bg: "rgba(6, 182, 212, 0.1)",
    },
    {
      label: "Monthly Spend",
      value: `$${performance?.monthlySpend?.toLocaleString() ?? "0"}`,
      icon: DollarSign,
      color: "var(--warning)",
      bg: "rgba(245, 158, 11, 0.1)",
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
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Welcome back, {user?.name ?? "User"} 👋
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          {today}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-6 card-hover"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: stat.bg }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <TrendingUp size={16} style={{ color: "var(--success)" }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {stat.value}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Active Deployments & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Deployments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Active Deployments
            </h2>
            <Link
              href="/deploy"
              className="text-sm flex items-center gap-1 hover:underline"
              style={{ color: "var(--primary-light)" }}
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {deployments.length === 0 ? (
            <div
              className="rounded-xl p-8 text-center"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <Rocket size={48} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-secondary)" }}>No active deployments yet.</p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: "var(--primary)" }}
              >
                <Plus size={16} /> Hire Your First Employee
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {deployments.map((dep) => (
                <div
                  key={dep.id}
                  className="rounded-xl p-4 flex items-center gap-4 card-hover cursor-pointer"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                    style={{ background: "var(--primary)", color: "white" }}
                  >
                    {dep.employeeAvatar || dep.employeeName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {dep.employeeName}
                    </p>
                    <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                      {dep.employeeRole}
                    </p>
                  </div>
                  <span
                    className={`status-${dep.status} px-3 py-1 rounded-full text-xs font-medium`}
                  >
                    {statusLabel[dep.status] ?? dep.status}
                  </span>
                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p style={{ color: "var(--text-primary)" }}>{dep.accuracy}%</p>
                      <p style={{ color: "var(--text-muted)" }}>Accuracy</p>
                    </div>
                    <div className="text-center">
                      <p style={{ color: "var(--text-primary)" }}>{dep.tasksCompleted}</p>
                      <p style={{ color: "var(--text-muted)" }}>Tasks</p>
                    </div>
                    <div className="text-center">
                      <p style={{ color: "var(--text-primary)" }}>{dep.uptime}</p>
                      <p style={{ color: "var(--text-muted)" }}>Uptime</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions & Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div
            className="rounded-xl p-6"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href="/marketplace"
                className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                style={{ background: "var(--bg-card-hover)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(99, 102, 241, 0.1)" }}
                >
                  <Users size={20} style={{ color: "var(--primary-light)" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Hire New Employee
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Browse the marketplace
                  </p>
                </div>
                <ArrowRight size={16} style={{ color: "var(--text-muted)" }} />
              </Link>
              <Link
                href="/custom-builder"
                className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                style={{ background: "var(--bg-card-hover)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(6, 182, 212, 0.1)" }}
                >
                  <Plus size={20} style={{ color: "var(--accent)" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Create Custom
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Build your own AI employee
                  </p>
                </div>
                <ArrowRight size={16} style={{ color: "var(--text-muted)" }} />
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div
            className="rounded-xl p-6"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(99, 102, 241, 0.1)" }}
                  >
                    <item.icon size={14} style={{ color: "var(--primary-light)" }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {item.action}{" "}
                      <span className="font-medium">{item.target}</span>
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {item.time}
                    </p>
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
