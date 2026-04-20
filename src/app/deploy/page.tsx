"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Rocket,
  Play,
  Pause,
  Plus,
  MessageSquare,
  Headphones,
  TrendingUp,
  Palette,
  Calculator,
  BarChart3,
  Users,
  Monitor,
  Settings,
  Lock,
  Globe,
  Upload,
  Copy,
  X,
  MoreVertical,
  Archive,
  Trash2,
  RotateCcw,
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
  employee_id: string;
  employeeName: string;
  employeeRole?: string;
  employeeCategory?: string;
  agentType?: string;
  isPublished?: boolean;
  publishStatus?: string;
  status: "active" | "paused" | "archived" | "configuring" | "deploying";
  deployedAt: string;
  deployed_at?: string;
  createdAt?: string;
  created_at?: string;
}

const statusLabel: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  archived: "Archived",
  configuring: "Configuring",
  deploying: "Deploying",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-9 w-56 rounded-lg" style={{ background: "var(--bg-card)" }} />
        <div className="h-10 w-36 rounded-lg" style={{ background: "var(--bg-card)" }} />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl" style={{ background: "var(--bg-card)" }} />
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
  const [cloneTarget, setCloneTarget] = useState<Deployment | null>(null);
  const [cloneName, setCloneName] = useState("");
  const [cloning, setCloning] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [overflowMenu, setOverflowMenu] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Deployment | null>(null);

  // Close overflow menu on any outside click
  useEffect(() => {
    if (!overflowMenu) return;
    function handleClick() {
      setOverflowMenu(null);
    }
    // Use setTimeout so the current click event finishes before attaching
    const t = setTimeout(() => document.addEventListener("click", handleClick), 0);
    return () => { clearTimeout(t); document.removeEventListener("click", handleClick); };
  }, [overflowMenu]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  const fetchDeployments = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/deployments`);
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

  const openCloneModal = (dep: Deployment) => {
    setCloneTarget(dep);
    setCloneName(`${dep.name} (Copy)`);
  };

  const handleClone = async () => {
    if (!cloneTarget) return;
    setCloning(true);
    try {
      const res = await fetch("/api/deployments/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deploymentId: cloneTarget.id,
          newName: cloneName.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCloneTarget(null);
        router.push(`/deploy/${data.id}/onboarding`);
      }
    } catch {
      // silently handle
    } finally {
      setCloning(false);
    }
  };

  const handleDelete = async (dep: Deployment) => {
    try {
      const res = await fetch("/api/deployments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dep.id }),
      });
      if (res.ok) {
        setDeleteTarget(null);
        setSuccessBanner(`"${dep.name}" has been permanently deleted`);
        setTimeout(() => setSuccessBanner(null), 4000);
        await fetchDeployments();
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteTarget(null);
        setSuccessBanner(`Failed to delete: ${data.error || "Unknown error"}`);
        setTimeout(() => setSuccessBanner(null), 5000);
      }
    } catch {
      setDeleteTarget(null);
      setSuccessBanner("Failed to delete — network error");
      setTimeout(() => setSuccessBanner(null), 5000);
    }
  };

  if (authLoading || loading) return <LoadingSkeleton />;
  if (!user) return null;

  const activeEmployees = deployments.filter(d => d.status !== "archived");
  const archivedEmployees = deployments.filter(d => d.status === "archived");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            My Employees
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Manage and monitor your AI workforce
          </p>
        </div>
        <Link
          href="/marketplace"
          className="deploy-pulse inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} /> Deploy New
        </Link>
      </div>

      {/* Success banner */}
      {successBanner && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          <span className="flex-1">{successBanner}</span>
          <button onClick={() => setSuccessBanner(null)} className="hover:text-emerald-300">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Summary stats bar */}
      {deployments.length > 0 && (
        <div className="flex items-center gap-3 text-sm px-4 py-2.5 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
          <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
            {deployments.length} Total
          </span>
          <span style={{ color: "var(--border-primary)" }}>·</span>
          <span className="text-emerald-400 font-medium">
            {deployments.filter(d => d.status === "active").length} Active
          </span>
          <span style={{ color: "var(--border-primary)" }}>·</span>
          <span className="text-amber-400 font-medium">
            {deployments.filter(d => d.status === "paused").length} Paused
          </span>
          {archivedEmployees.length > 0 && (
            <>
              <span style={{ color: "var(--border-primary)" }}>·</span>
              <span className="text-slate-400 font-medium">
                {archivedEmployees.length} Archived
              </span>
            </>
          )}
        </div>
      )}

      {/* Empty State */}
      {deployments.length === 0 ? (
        <div className="rounded-2xl p-14 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
            <Rocket size={36} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            No employees yet
          </h3>
          <p className="mb-8 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
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
        <>
        {/* Active Employees */}
        {activeEmployees.length > 0 && (
        <div className="space-y-3">
          {activeEmployees.map((dep) => {
            const catColor = getCategoryColor(dep.employeeCategory);
            return (
            <div
              key={dep.id}
              onClick={() => router.push(dep.status === "configuring" ? `/deploy/${dep.id}/onboarding` : `/deploy/${dep.id}/workspace`)}
              className={`rounded-xl p-5 card-hover transition-all duration-200 relative cursor-pointer ${overflowMenu === dep.id ? "z-40" : ""}`}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderLeft: `3px solid ${catColor}` }}
            >
              <div className="flex items-center gap-5 flex-wrap">
              {/* Category Icon */}
              <CategoryIcon category={dep.employeeCategory} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {dep.name}
                  </p>
                  {/* Privacy badge */}
                  {dep.agentType === "custom" && (
                    dep.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        <Globe size={10} /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/20">
                        <Lock size={10} /> Private
                      </span>
                    )
                  )}
                </div>
                <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                  {dep.employeeRole || dep.employeeName}
                  {dep.employeeCategory && (
                    <span style={{ color: "var(--text-muted)" }}> · {dep.employeeCategory}</span>
                  )}
                </p>
              </div>

              {/* Status Badge */}
              <span className={`status-${dep.status} px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>
                {statusLabel[dep.status] ?? dep.status}
              </span>

              {/* Deployed Date */}
              <p className="text-sm hidden sm:block whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
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
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {/* Primary: Configure */}
                <button
                  onClick={() => router.push(`/deploy/${dep.id}/onboarding`)}
                  className="w-9 h-9 rounded-full bg-purple-500/15 hover:bg-purple-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  title="Configure & manage"
                >
                  <Settings size={15} className="text-purple-400" />
                </button>
                {/* Primary: Chat (active only) */}
                {dep.status === "active" && (
                  <button
                    onClick={() => router.push(`/deploy/${dep.id}/chat`)}
                    className="w-9 h-9 rounded-full bg-[var(--primary)]/15 hover:bg-[var(--primary)]/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title="Test chat with employee"
                  >
                    <MessageSquare size={15} className="text-[var(--primary)]" />
                  </button>
                )}
                {/* Primary: Pause/Resume toggle */}
                {dep.status === "active" && (
                  <button
                    onClick={() => handleAction(dep.id, "paused")}
                    className="w-9 h-9 rounded-full bg-amber-500/15 hover:bg-amber-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title="Pause"
                  >
                    <Pause size={15} className="text-amber-400" />
                  </button>
                )}
                {dep.status === "paused" && (
                  <button
                    onClick={() => handleAction(dep.id, "active")}
                    className="w-9 h-9 rounded-full bg-emerald-500/15 hover:bg-emerald-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title="Resume"
                  >
                    <Play size={15} className="text-emerald-400" />
                  </button>
                )}
                {/* Overflow menu */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setOverflowMenu(overflowMenu === dep.id ? null : dep.id); }}
                    className="w-9 h-9 rounded-full hover:bg-[var(--bg-card-hover)] flex items-center justify-center transition-all duration-200"
                    title="More actions"
                  >
                    <MoreVertical size={15} style={{ color: "var(--text-muted)" }} />
                  </button>
                  {overflowMenu === dep.id && (
                    <div
                      className="absolute right-0 top-full mt-1 w-48 rounded-xl border shadow-xl z-50 py-1 overflow-hidden"
                      style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}
                    >
                      <button
                        onClick={() => { setOverflowMenu(null); openCloneModal(dep); }}
                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-[var(--bg-card-hover)] transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Copy size={14} className="text-teal-400" />
                        Clone Employee
                      </button>
                      {dep.agentType === "custom" && !dep.isPublished && (
                        <button
                          onClick={() => { setOverflowMenu(null); router.push(`/deploy/publish/${dep.employee_id}?deploymentId=${dep.id}`); }}
                          className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-[var(--bg-card-hover)] transition-colors"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <Upload size={14} className="text-cyan-400" />
                          Publish to Marketplace
                        </button>
                      )}
                      <div className="my-1 border-t" style={{ borderColor: "var(--border-primary)" }} />
                      <button
                        onClick={() => { setOverflowMenu(null); handleAction(dep.id, "archived"); }}
                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-[var(--bg-card-hover)] transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Archive size={14} className="text-slate-400" />
                        Archive Employee
                      </button>
                    </div>
                  )}
                </div>
              </div>
              </div>

              {/* Quick stats row */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Tasks: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{Math.floor(Math.random() * 80 + 20)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Accuracy: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{Math.floor(Math.random() * 10 + 90)}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Uptime: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{(Math.random() * 2 + 97.5).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        )}

        {/* Archived Employees */}
        {archivedEmployees.length > 0 && (
          <div className="space-y-3 mt-8">
            <div className="flex items-center gap-3 mb-2">
              <Archive size={18} style={{ color: "var(--text-muted)" }} />
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-muted)" }}>
                Archived Employees
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 font-medium">
                {archivedEmployees.length}
              </span>
            </div>
            {archivedEmployees.map((dep) => {
              const catColor = getCategoryColor(dep.employeeCategory);
              return (
                <div
                  key={dep.id}
                  onClick={() => router.push(`/deploy/${dep.id}/workspace`)}
                  className="rounded-xl p-5 transition-all duration-200 opacity-60 hover:opacity-80 cursor-pointer"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderLeft: `3px solid ${catColor}` }}
                >
                  <div className="flex items-center gap-5 flex-wrap">
                    <CategoryIcon category={dep.employeeCategory} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {dep.name}
                      </p>
                      <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                        {dep.employeeRole || dep.employeeName}
                        {dep.employeeCategory && (
                          <span style={{ color: "var(--text-muted)" }}> · {dep.employeeCategory}</span>
                        )}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/20 whitespace-nowrap">
                      Archived
                    </span>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleAction(dep.id, "active")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-md"
                        style={{ background: "rgba(79,70,229,0.15)", color: "var(--primary)" }}
                        title="Re-hire this employee"
                      >
                        <RotateCcw size={13} /> Re-hire
                      </button>
                      <button
                        onClick={() => setDeleteTarget(dep)}
                        className="w-8 h-8 rounded-full hover:bg-red-500/10 flex items-center justify-center transition-all"
                        title="Delete permanently"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </>
      )}

      {/* Clone Modal */}
      {cloneTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Clone Agent
              </h2>
              <button
                onClick={() => setCloneTarget(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X size={16} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Create a copy of <strong style={{ color: "var(--text-primary)" }}>{cloneTarget.name}</strong>. The clone will start in &quot;Configuring&quot; status.
            </p>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              New name
            </label>
            <input
              type="text"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm mb-5 outline-none focus:ring-2 focus:ring-indigo-500/50"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !cloning) handleClone();
              }}
              autoFocus
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setCloneTarget(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleClone}
                disabled={cloning || !cloneName.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy size={14} />
                {cloning ? "Cloning…" : "Clone"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  Delete Employee
                </h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Are you sure you want to permanently delete <strong style={{ color: "var(--text-primary)" }}>{deleteTarget.name}</strong>? All conversations, task history, and configurations will be lost forever.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all"
              >
                <Trash2 size={14} />
                Delete Permanently
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
