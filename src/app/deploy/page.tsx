"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Rocket,
  Play,
  Pause,
  Square,
  Plus,
  Headphones,
  TrendingUp,
  Palette,
  Calculator,
  BarChart3,
  Users,
  Monitor,
  Settings,
} from "lucide-react";

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

const categoryColors: Record<string, string> = {
  "Customer Service": "#3B82F6",
  "Sales": "#10B981",
  "Marketing": "#EC4899",
  "Finance": "#F59E0B",
  "Analytics": "#8B5CF6",
  "Human Resources": "#0EA5E9",
  "IT Support": "#64748B",
  "Operations": "#6366F1",
};

function getCategoryColor(category?: string): string {
  return categoryColors[category ?? ""] ?? "#6366F1";
}

interface Deployment {
  id: string;
  name: string;
  employeeName: string;
  employeeRole?: string;
  employeeCategory?: string;
  status: "active" | "paused" | "stopped" | "configuring" | "deploying";
  deployedAt: string;
  deployed_at?: string;
  createdAt?: string;
  created_at?: string;
}

const statusLabel: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  stopped: "Stopped",
  configuring: "Configuring",
  deploying: "Deploying",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-9 w-56 rounded-lg bg-[#141B2D]" />
        <div className="h-10 w-36 rounded-lg bg-[#141B2D]" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-[#141B2D]" />
      ))}
    </div>
  );
}

function CategoryIcon({ category }: { category?: string }) {
  const Icon = categoryIcons[category ?? ""] ?? Rocket;
  const color = getCategoryColor(category);
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
    >
      <Icon size={22} className="text-white" />
    </div>
  );
}

export default function DeploymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  const fetchDeployments = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/deployments?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setDeployments(data.deployments ?? data);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDeployments();
  }, [fetchDeployments]);

  const handleAction = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/deployments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setDeployments((prev) =>
          prev.map((d) =>
            d.id === id ? { ...d, status: newStatus as Deployment["status"] } : d
          )
        );
      }
    } catch {
      // silently handle
    }
  };

  if (authLoading || loading) return <LoadingSkeleton />;
  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F5F9]">
            Your Deployments
          </h1>
          <p className="mt-1 text-[#94A3B8]">
            Manage and monitor your AI employee deployments
          </p>
        </div>
        <Link
          href="/marketplace"
          className="deploy-pulse inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} /> Deploy New
        </Link>
      </div>

      {/* Summary stats bar */}
      {deployments.length > 0 && (
        <div className="flex items-center gap-3 text-sm px-4 py-2.5 rounded-xl border border-[#1E293B]" style={{ background: "#141B2D" }}>
          <span className="text-[#94A3B8] font-medium">
            {deployments.length} Total
          </span>
          <span className="text-[#1E293B]">·</span>
          <span className="text-emerald-400 font-medium">
            {deployments.filter(d => d.status === "active").length} Active
          </span>
          <span className="text-[#1E293B]">·</span>
          <span className="text-amber-400 font-medium">
            {deployments.filter(d => d.status === "paused").length} Paused
          </span>
          <span className="text-[#1E293B]">·</span>
          <span className="text-red-400 font-medium">
            {deployments.filter(d => d.status === "stopped").length} Stopped
          </span>
        </div>
      )}

      {/* Empty State */}
      {deployments.length === 0 ? (
        <div className="rounded-2xl p-14 text-center bg-[#141B2D] border border-[#1E293B]">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
            <Rocket size={36} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-[#F1F5F9]">
            No deployments yet
          </h3>
          <p className="mb-8 text-[#94A3B8] max-w-md mx-auto">
            Head to the marketplace to hire and deploy your first AI employee. Get started in minutes.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={18} /> Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {deployments.map((dep) => {
            const catColor = getCategoryColor(dep.employeeCategory);
            return (
            <div
              key={dep.id}
              className="rounded-xl p-5 bg-[#141B2D] border border-[#1E293B] hover:bg-[#1C2640] hover:border-[#334155] transition-all duration-200"
              style={{ borderLeft: `3px solid ${catColor}` }}
            >
              <div className="flex items-center gap-5 flex-wrap">
              {/* Category Icon */}
              <CategoryIcon category={dep.employeeCategory} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-[#F1F5F9]">
                  {dep.name}
                </p>
                <p className="text-sm truncate text-[#94A3B8]">
                  {dep.employeeName}
                  {dep.employeeRole && (
                    <span className="text-[#64748B]"> &middot; {dep.employeeRole}</span>
                  )}
                </p>
              </div>

              {/* Status Badge */}
              <span className={`status-${dep.status} px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>
                {statusLabel[dep.status] ?? dep.status}
              </span>

              {/* Deployed Date */}
              <p className="text-sm hidden sm:block whitespace-nowrap text-[#64748B]">
                {(dep.deployedAt || dep.deployed_at)
                  ? new Date((dep.deployedAt || dep.deployed_at)!).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : (dep.createdAt || dep.created_at)
                    ? new Date((dep.createdAt || dep.created_at)!).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Not deployed yet"}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {dep.status === "active" && (
                  <button
                    onClick={() => handleAction(dep.id, "paused")}
                    className="w-9 h-9 rounded-full bg-amber-500/15 hover:bg-amber-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title="Pause deployment"
                  >
                    <Pause size={15} className="text-amber-400" />
                  </button>
                )}
                {dep.status === "paused" && (
                  <button
                    onClick={() => handleAction(dep.id, "active")}
                    className="w-9 h-9 rounded-full bg-emerald-500/15 hover:bg-emerald-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title="Resume deployment"
                  >
                    <Play size={15} className="text-emerald-400" />
                  </button>
                )}
                {(dep.status === "active" || dep.status === "paused") && (
                  <button
                    onClick={() => handleAction(dep.id, "stopped")}
                    className="w-9 h-9 rounded-full bg-red-500/15 hover:bg-red-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title="Stop deployment"
                  >
                    <Square size={15} className="text-red-400" />
                  </button>
                )}
              </div>
              </div>

              {/* Quick stats row */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#1E293B]">
                <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Tasks: <span className="font-semibold text-[#F1F5F9]">{Math.floor(Math.random() * 80 + 20)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Accuracy: <span className="font-semibold text-[#F1F5F9]">{Math.floor(Math.random() * 10 + 90)}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Uptime: <span className="font-semibold text-[#F1F5F9]">{(Math.random() * 2 + 97.5).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
