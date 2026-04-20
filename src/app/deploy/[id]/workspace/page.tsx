"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ActivityFeed from "@/components/ActivityFeed";
import ScheduledTasksManager from "@/components/ScheduledTasksManager";
import {
  ArrowLeft,
  MessageSquare,
  Settings,
  Play,
  Pause,
  Target,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  CalendarClock,
  BarChart3,
  Headphones,
  TrendingUp,
  Palette,
  Calculator,
  Users,
  Monitor,
  Rocket,
  Briefcase,
} from "lucide-react";

/* ── Category visuals ── */
const categoryIcons: Record<string, any> = {
  "Customer Service": Headphones,
  Sales: TrendingUp,
  Marketing: Palette,
  Finance: Calculator,
  Analytics: BarChart3,
  "Human Resources": Users,
  HR: Users,
  "IT Support": Monitor,
  IT: Monitor,
  Operations: Settings,
};

const categoryColors: Record<string, string> = {
  "Customer Service": "#3B82F6",
  Sales: "#10B981",
  Marketing: "#EC4899",
  Finance: "#F59E0B",
  Analytics: "#8B5CF6",
  "Human Resources": "#0EA5E9",
  HR: "#0EA5E9",
  "IT Support": "#64748B",
  IT: "#64748B",
  Operations: "#6366F1",
};

function getCategoryIcon(category: string) {
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return Briefcase;
}

function getCategoryColor(category: string) {
  for (const [key, color] of Object.entries(categoryColors)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "#6366F1";
}

/* ── Types ── */
interface WorkspaceData {
  agent: {
    deploymentId: string;
    name: string;
    status: string;
    createdAt: string;
    deployedAt: string;
    employeeName: string;
    employeeRole: string;
    employeeCategory: string;
    employeeDescription: string;
    isPrebuilt: boolean;
    schedule: string;
    tools: string[];
  };
  metrics: {
    accuracy: number;
    totalTasks: number;
    uptime: number;
    avgResponseTime: number;
    dataPoints: number;
  };
  recentActivity: {
    id: string;
    action: string;
    details: string;
    metadata: any;
    createdAt: string;
  }[];
  tasks: {
    total: number;
    active: number;
    totalRuns: number;
  };
  conversations: {
    total: number;
  };
}

type Tab = "overview" | "activity" | "tasks";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "tasks", label: "Tasks", icon: CalendarClock },
];

/* ── Loading skeleton ── */
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg" style={{ background: "var(--bg-card)" }} />
      <div className="h-24 rounded-2xl" style={{ background: "var(--bg-card)" }} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl" style={{ background: "var(--bg-card)" }} />
        ))}
      </div>
      <div className="h-64 rounded-2xl" style={{ background: "var(--bg-card)" }} />
    </div>
  );
}

/* ── Metric Card ── */
function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  subtitle?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 border border-[var(--border)] transition-all duration-200 hover:shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${color}08 0%, var(--bg-card) 60%)`,
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
        >
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color }}>{subtitle}</p>
      )}
    </div>
  );
}

/* ── Main Workspace Page ── */
export default function AgentWorkspacePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const deploymentId = params.id as string;

  const [data, setData] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  const fetchWorkspace = useCallback(async () => {
    if (!user?.id || !deploymentId) return;
    try {
      const res = await fetch(`/api/deployments/${deploymentId}/workspace`);
      if (res.ok) {
        setData(await res.json());
      } else if (res.status === 404) {
        router.push("/deploy");
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [user?.id, deploymentId, router]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const handleToggleStatus = async () => {
    if (!data) return;
    const newStatus = data.agent.status === "active" ? "paused" : "active";
    setToggling(true);
    try {
      const res = await fetch("/api/deployments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deploymentId, status: newStatus }),
      });
      if (res.ok) {
        setData((prev) =>
          prev ? { ...prev, agent: { ...prev.agent, status: newStatus } } : prev
        );
      }
    } catch {
      // silently handle
    } finally {
      setToggling(false);
    }
  };

  if (authLoading || loading) return <LoadingSkeleton />;
  if (!user || !data) return null;

  const { agent, metrics, recentActivity, tasks, conversations } = data;
  const catColor = getCategoryColor(agent.employeeCategory || "");
  const CatIcon = getCategoryIcon(agent.employeeCategory || "");
  const isActive = agent.status === "active";

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    active: { label: "Active", bg: "bg-emerald-500/15", text: "text-emerald-400" },
    paused: { label: "Paused", bg: "bg-amber-500/15", text: "text-amber-400" },
    archived: { label: "Archived", bg: "bg-slate-500/15", text: "text-slate-400" },
    configuring: { label: "Configuring", bg: "bg-blue-500/15", text: "text-blue-400" },
  };
  const st = statusConfig[agent.status] || statusConfig.active;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Back button ── */}
      <button
        onClick={() => router.push("/deploy")}
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft size={16} /> My Employees
      </button>

      {/* ── Agent Header ── */}
      <div
        className="rounded-2xl p-6 border border-[var(--border)]"
        style={{
          background: `linear-gradient(135deg, ${catColor}0A 0%, var(--bg-card) 40%)`,
          borderLeft: `4px solid ${catColor}`,
        }}
      >
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${catColor}, ${catColor}CC)` }}
          >
            <CatIcon size={30} className="text-white" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-[var(--text-primary)] truncate">
                {agent.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>
                {st.label}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {agent.employeeRole || agent.employeeName}
              {agent.employeeCategory && (
                <span className="text-[var(--text-muted)]"> · {agent.employeeCategory}</span>
              )}
            </p>
            {agent.employeeDescription && (
              <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-2xl line-clamp-2">
                {agent.employeeDescription}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
              {agent.schedule && <span>⏰ {agent.schedule}</span>}
              {agent.tools.length > 0 && <span>🔌 {agent.tools.length} tools</span>}
              <span>📅 Deployed {new Date(agent.deployedAt || agent.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {agent.status !== "archived" && (
              <>
                <button
                  onClick={handleToggleStatus}
                  disabled={toggling}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border ${
                    isActive
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  {isActive ? <Pause size={15} /> : <Play size={15} />}
                  {isActive ? "Pause" : "Resume"}
                </button>

                <Link
                  href={`/deploy/${deploymentId}/chat`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
                >
                  <MessageSquare size={15} /> Test Chat
                </Link>
              </>
            )}

            <Link
              href={`/deploy/${deploymentId}/onboarding`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-all"
              style={{ background: "var(--bg-card)" }}
            >
              <Settings size={15} /> Configure
            </Link>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] pb-0">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                active
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Metrics row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Accuracy"
              value={`${metrics.accuracy}%`}
              icon={Target}
              color="#10B981"
              subtitle={metrics.dataPoints > 0 ? `${metrics.dataPoints} data points` : undefined}
            />
            <MetricCard
              label="Tasks Completed"
              value={metrics.totalTasks}
              icon={CheckCircle2}
              color="#3B82F6"
              subtitle={tasks.active > 0 ? `${tasks.active} scheduled` : undefined}
            />
            <MetricCard
              label="Uptime"
              value={`${metrics.uptime}%`}
              icon={Zap}
              color="#8B5CF6"
            />
            <MetricCard
              label="Avg Response"
              value={metrics.avgResponseTime > 0 ? `${metrics.avgResponseTime}ms` : "—"}
              icon={Clock}
              color="#F59E0B"
              subtitle={conversations.total > 0 ? `${conversations.total} conversations` : undefined}
            />
          </div>

          {/* Two-column: Recent Activity + Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity Preview */}
            <div
              className="lg:col-span-2 rounded-2xl p-5 border border-[var(--border)]"
              style={{ background: "var(--bg-card)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Activity size={18} /> Recent Activity
                </h3>
                <button
                  onClick={() => setTab("activity")}
                  className="text-sm font-medium hover:underline"
                  style={{ color: "var(--primary)" }}
                >
                  View all →
                </button>
              </div>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] py-6 text-center">
                  No activity recorded yet. Start chatting or schedule tasks.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--text-primary)]">
                          {a.details || a.action}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {new Date(a.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats Panel */}
            <div
              className="rounded-2xl p-5 border border-[var(--border)]"
              style={{ background: "var(--bg-card)" }}
            >
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
                Quick Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Conversations</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{conversations.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Scheduled Tasks</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{tasks.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Task Runs</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{tasks.totalRuns}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Connected Tools</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{agent.tools.length}</span>
                </div>
                <hr className="border-[var(--border)]" />
                <div className="space-y-2">
                  <Link
                    href={`/deploy/${deploymentId}/chat`}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
                  >
                    <MessageSquare size={15} /> Test Chat
                  </Link>
                  <Link
                    href={`/deploy/${deploymentId}/onboarding?tab=tasks`}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
                  >
                    <CalendarClock size={15} /> Manage Tasks
                  </Link>
                  <Link
                    href={`/deploy/${deploymentId}/onboarding`}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
                  >
                    <Settings size={15} /> Configure
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "activity" && (
        <ActivityFeed deploymentId={deploymentId} maxHeight="calc(100vh - 340px)" />
      )}

      {tab === "tasks" && <ScheduledTasksManager deploymentId={deploymentId} embedded />}
    </div>
  );
}
