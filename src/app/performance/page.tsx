"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Activity,
  Archive,
  Zap,
  ChevronDown,
  ChevronUp,
  Headphones,
  Palette,
  Calculator,
  Users,
  Monitor,
  Settings,
  Rocket,
  ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

const categoryIcons: Record<string, any> = {
  "Customer Service": Headphones,
  "Sales": TrendingUp,
  "Marketing": Palette,
  "Finance": Calculator,
  "Analytics": BarChart3,
  "Human Resources": Users,
  "IT Support": Monitor,
  "Operations": Settings,
};

const categoryGradients: Record<string, string> = {
  "Customer Service": "from-blue-500 to-cyan-500",
  "Sales": "from-emerald-500 to-teal-500",
  "Marketing": "from-pink-500 to-rose-500",
  "Finance": "from-amber-500 to-orange-500",
  "Analytics": "from-violet-500 to-purple-500",
  "Human Resources": "from-sky-500 to-blue-500",
  "IT Support": "from-slate-400 to-zinc-500",
  "Operations": "from-indigo-500 to-blue-500",
};

interface PerformanceSummary {
  totalTasksCompleted: number;
  avgResponseTime: number;
  overallAccuracy: number;
  overallUptime: number;
}

interface DeploymentPerformance {
  id: string;
  name: string;
  employeeName?: string;
  employeeCategory?: string;
  employeeRole?: string;
  status: string;
  avgTasks: number;
  avgResponseTime: number;
  avgAccuracy: number;
  avgUptime: number;
}

interface ChartPoint {
  date: string;
  tasks: number;
  accuracy: number;
  responseTime: number;
}

function colorForPercent(val: number, thresholds: [number, number] = [95, 90]) {
  if (val >= thresholds[0]) return "text-emerald-400";
  if (val >= thresholds[1]) return "text-amber-400";
  return "text-red-400";
}

function colorForPercentRaw(val: number, thresholds: [number, number] = [95, 90]) {
  if (val >= thresholds[0]) return "#10B981";
  if (val >= thresholds[1]) return "#F59E0B";
  return "#EF4444";
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-9 w-64 rounded-lg" style={{ background: "var(--bg-card)" }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl" style={{ background: "var(--bg-card)" }} />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 rounded-xl" style={{ background: "var(--bg-card)" }} />
      ))}
    </div>
  );
}

function CategoryIcon({ category, size = "md" }: { category?: string; size?: "sm" | "md" }) {
  const Icon = categoryIcons[category ?? ""] ?? Rocket;
  const gradient = categoryGradients[category ?? ""] ?? "from-indigo-500 to-purple-500";
  const dims = size === "sm" ? "w-10 h-10" : "w-12 h-12";
  const iconSize = size === "sm" ? 18 : 22;
  return (
    <div className={`${dims} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-lg`}>
      <Icon size={iconSize} className="text-white" />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 border shadow-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
      <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: "var(--text-secondary)" }}>{entry.name}:</span>
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function PerformanceRow({ dep, expanded, onExpand, chartLoading, chartData }: {
  dep: DeploymentPerformance;
  expanded: string | null;
  onExpand: (id: string) => void;
  chartLoading: boolean;
  chartData: ChartPoint[];
}) {
  return (
    <div>
      <button
        onClick={() => onExpand(dep.id)}
        className="w-full rounded-xl p-5 flex items-center gap-5 transition-all duration-200 text-left"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        <CategoryIcon category={dep.employeeCategory} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {dep.name}
            </p>
            {dep.status === "archived" && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}>
                Archived
              </span>
            )}
          </div>
          {(dep.employeeRole || dep.employeeName) && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {dep.employeeRole || dep.employeeName}
              {dep.employeeCategory && (
                <span> · {dep.employeeCategory}</span>
              )}
            </p>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-8 text-sm">
          <div className="text-center min-w-[60px]">
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{Math.round(dep.avgTasks || 0)}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Tasks/day</p>
          </div>
          <div className="text-center min-w-[70px]">
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{(dep.avgResponseTime || 0).toFixed(1)}s</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Resp. Time</p>
          </div>
          <div className="text-center min-w-[60px]">
            <p className={`font-semibold ${colorForPercent(dep.avgAccuracy)}`}>
              {(dep.avgAccuracy || 0).toFixed(1)}%
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Accuracy</p>
          </div>
          <div className="text-center min-w-[60px]">
            <p className={`font-semibold ${colorForPercent(dep.avgUptime)}`}>
              {(dep.avgUptime || 0).toFixed(1)}%
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Uptime</p>
          </div>
        </div>
        <div style={{ color: "var(--text-muted)" }}>
          {expanded === dep.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>
      {expanded === dep.id && (
        <div className="rounded-b-xl p-6 -mt-1 border border-t-0" style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
          <div className="flex items-center justify-end mb-3">
            <Link
              href={`/deploy/${dep.id}/workspace`}
              className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
              style={{ color: "var(--primary)" }}
            >
              Open Workspace <ExternalLink size={14} />
            </Link>
          </div>
          {chartLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gradTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAccuracy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="tasks" stroke="#4F46E5" strokeWidth={2} fill="url(#gradTasks)" name="Tasks" />
                  <Area type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2} fill="url(#gradAccuracy)" name="Accuracy %" />
                  <Line type="monotone" dataKey="responseTime" stroke="#F59E0B" strokeWidth={2} dot={false} name="Resp Time (ms)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>
              No chart data available for this deployment.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function PerformancePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [deployments, setDeployments] = useState<DeploymentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  const fetchSummary = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/performance`);
      if (res.ok) {
        const data = await res.json();
        // API returns flat array of deployment performance objects
        const deps: DeploymentPerformance[] = Array.isArray(data) ? data : (data.deployments ?? []);
        setDeployments(deps);
        // Summary stats from active workforce only
        const activeDeps = deps.filter(d => d.status !== "archived");
        if (activeDeps.length > 0) {
          const totalTasks = activeDeps.reduce((s, d) => s + (d.avgTasks || 0), 0);
          const avgResponse = activeDeps.reduce((s, d) => s + (d.avgResponseTime || 0), 0) / activeDeps.length;
          const avgAccuracy = activeDeps.reduce((s, d) => s + (d.avgAccuracy || 0), 0) / activeDeps.length;
          const avgUptime = activeDeps.reduce((s, d) => s + (d.avgUptime || 0), 0) / activeDeps.length;
          setSummary({ totalTasksCompleted: Math.round(totalTasks), avgResponseTime: +avgResponse.toFixed(1), overallAccuracy: +avgAccuracy.toFixed(1), overallUptime: +avgUptime.toFixed(1) });
        }
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleExpand = async (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    setChartLoading(true);
    try {
      const res = await fetch(`/api/performance?deploymentId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setChartData(data.chart ?? data.history ?? []);
      }
    } catch {
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  if (authLoading || loading) return <LoadingSkeleton />;
  if (!user) return null;

  const overviewCards = [
    {
      label: "Total Tasks",
      value: summary?.totalTasksCompleted?.toLocaleString() ?? "0",
      icon: BarChart3,
      gradient: "from-indigo-500 to-purple-600",
      shadow: "shadow-indigo-500/20",
    },
    {
      label: "Avg Response Time",
      value: summary?.avgResponseTime ? `${summary.avgResponseTime}s` : "—",
      icon: Clock,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20",
    },
    {
      label: "Overall Accuracy",
      value: `${summary?.overallAccuracy ?? 0}%`,
      icon: Target,
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
    },
    {
      label: "Overall Uptime",
      value: `${summary?.overallUptime ?? 0}%`,
      icon: Activity,
      gradient: "from-cyan-500 to-blue-500",
      shadow: "shadow-cyan-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Performance Analytics
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Monitor and analyze your AI team&apos;s performance in real time
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl p-6 transition-all duration-200"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow}`}>
                  <Icon size={20} className="text-white" />
                </div>
                <TrendingUp size={14} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {card.value}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Per-deployment Performance */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Active Workforce Performance
        </h2>

        {(() => {
          const activeDeps = deployments.filter(d => d.status !== "archived");
          const archivedDeps = deployments.filter(d => d.status === "archived");

          return (
            <>
              {activeDeps.length === 0 ? (
                <div className="rounded-2xl p-10 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Zap size={28} className="text-white" />
                  </div>
                  <p style={{ color: "var(--text-secondary)" }}>
                    No active deployment performance data available yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeDeps.map((dep) => (
                    <PerformanceRow key={dep.id} dep={dep} expanded={expanded} onExpand={handleExpand} chartLoading={chartLoading} chartData={chartData} />
                  ))}
                </div>
              )}

              {archivedDeps.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Archive size={18} style={{ color: "var(--text-muted)" }} />
                    <h2 className="text-lg font-semibold" style={{ color: "var(--text-muted)" }}>
                      Archived Employees — Historical Performance
                    </h2>
                  </div>
                  <div className="space-y-3 opacity-60">
                    {archivedDeps.map((dep) => (
                      <PerformanceRow key={dep.id} dep={dep} expanded={expanded} onExpand={handleExpand} chartLoading={chartLoading} chartData={chartData} />
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>

    </div>
  );
}
