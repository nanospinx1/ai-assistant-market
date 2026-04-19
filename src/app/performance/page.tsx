"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Activity,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface PerformanceSummary {
  totalTasksCompleted: number;
  avgResponseTime: string;
  overallAccuracy: number;
  overallUptime: number;
}

interface DeploymentPerformance {
  id: string;
  name: string;
  status: string;
  avgTasks: number;
  avgResponseTime: string;
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
  if (val >= thresholds[0]) return "var(--success)";
  if (val >= thresholds[1]) return "var(--warning)";
  return "var(--danger)";
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-9 w-64 rounded-lg" style={{ background: "var(--bg-card)" }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl" style={{ background: "var(--bg-card)" }} />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 rounded-xl" style={{ background: "var(--bg-card)" }} />
      ))}
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
      const res = await fetch(`/api/performance?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary ?? data);
        setDeployments(data.deployments ?? []);
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
      label: "Total Tasks Completed",
      value: summary?.totalTasksCompleted?.toLocaleString() ?? "0",
      icon: BarChart3,
      color: "var(--primary)",
      bg: "rgba(99, 102, 241, 0.1)",
    },
    {
      label: "Avg Response Time",
      value: summary?.avgResponseTime ?? "—",
      icon: Clock,
      color: "var(--accent)",
      bg: "rgba(6, 182, 212, 0.1)",
    },
    {
      label: "Overall Accuracy",
      value: `${summary?.overallAccuracy ?? 0}%`,
      icon: Target,
      color: colorForPercent(summary?.overallAccuracy ?? 0),
      bg: "rgba(34, 197, 94, 0.1)",
    },
    {
      label: "Overall Uptime",
      value: `${summary?.overallUptime ?? 0}%`,
      icon: Activity,
      color: colorForPercent(summary?.overallUptime ?? 0),
      bg: "rgba(245, 158, 11, 0.1)",
    },
  ];

  const statusLabel: Record<string, string> = {
    active: "Active",
    paused: "Paused",
    stopped: "Stopped",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Performance Analytics
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          Monitor and analyze your AI employees&apos; performance
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-6 card-hover"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: card.bg }}
              >
                <card.icon size={24} style={{ color: card.color }} />
              </div>
              <TrendingUp size={16} style={{ color: "var(--success)" }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {card.value}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Per-deployment Performance */}
      <div>
        <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Deployment Performance
        </h2>

        {deployments.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <Zap size={48} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-secondary)" }}>
              No deployment performance data available yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {deployments.map((dep) => (
              <div key={dep.id}>
                <button
                  onClick={() => handleExpand(dep.id)}
                  className="w-full rounded-xl p-5 flex items-center gap-6 card-hover flex-wrap text-left"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {dep.name}
                    </p>
                    <span className={`status-${dep.status} px-2 py-0.5 rounded-full text-xs font-medium mt-1 inline-block`}>
                      {statusLabel[dep.status] ?? dep.status}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <p style={{ color: "var(--text-primary)" }}>{dep.avgTasks}</p>
                      <p style={{ color: "var(--text-muted)" }}>Avg Tasks</p>
                    </div>
                    <div className="text-center">
                      <p style={{ color: "var(--text-primary)" }}>{dep.avgResponseTime}</p>
                      <p style={{ color: "var(--text-muted)" }}>Resp. Time</p>
                    </div>
                    <div className="text-center">
                      <p style={{ color: colorForPercent(dep.avgAccuracy) }}>{dep.avgAccuracy}%</p>
                      <p style={{ color: "var(--text-muted)" }}>Accuracy</p>
                    </div>
                    <div className="text-center">
                      <p style={{ color: colorForPercent(dep.avgUptime) }}>{dep.avgUptime}%</p>
                      <p style={{ color: "var(--text-muted)" }}>Uptime</p>
                    </div>
                  </div>
                </button>

                {/* Expanded Chart */}
                {expanded === dep.id && (
                  <div
                    className="rounded-b-xl p-6 -mt-1"
                    style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)" }}
                  >
                    {chartLoading ? (
                      <div className="flex items-center justify-center h-48">
                        <div
                          className="animate-spin rounded-full h-6 w-6 border-b-2"
                          style={{ borderColor: "var(--primary)" }}
                        />
                      </div>
                    ) : chartData.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip
                              contentStyle={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                color: "var(--text-primary)",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="tasks"
                              stroke="var(--primary)"
                              strokeWidth={2}
                              dot={false}
                              name="Tasks"
                            />
                            <Line
                              type="monotone"
                              dataKey="accuracy"
                              stroke="var(--success)"
                              strokeWidth={2}
                              dot={false}
                              name="Accuracy %"
                            />
                            <Line
                              type="monotone"
                              dataKey="responseTime"
                              stroke="var(--accent)"
                              strokeWidth={2}
                              dot={false}
                              name="Resp Time (ms)"
                            />
                          </LineChart>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
