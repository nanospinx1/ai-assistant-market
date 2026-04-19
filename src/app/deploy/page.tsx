"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Rocket,
  Play,
  Pause,
  Square,
  Settings,
  ExternalLink,
  Plus,
} from "lucide-react";

interface Deployment {
  id: string;
  name: string;
  employeeName: string;
  employeeAvatar: string;
  status: "active" | "paused" | "stopped" | "configuring" | "deploying";
  deployedAt: string;
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
        <div className="h-9 w-56 rounded-lg" style={{ background: "var(--bg-card)" }} />
        <div className="h-10 w-36 rounded-lg" style={{ background: "var(--bg-card)" }} />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl" style={{ background: "var(--bg-card)" }} />
      ))}
    </div>
  );
}

export default function DeploymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const fetchDeployments = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/deployments?userId=${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setDeployments(data.deployments ?? data);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

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

  if (status === "loading" || loading) return <LoadingSkeleton />;
  if (!session) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Your Deployments
          </h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage and monitor your AI employee deployments
          </p>
        </div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: "var(--primary)" }}
        >
          <Plus size={18} /> Deploy New
        </Link>
      </div>

      {/* Deployments List */}
      {deployments.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <Rocket size={56} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            No deployments yet
          </h3>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Head to the marketplace to hire and deploy your first AI employee.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white"
            style={{ background: "var(--primary)" }}
          >
            <Plus size={18} /> Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {deployments.map((dep) => (
            <div
              key={dep.id}
              className="rounded-xl p-5 flex items-center gap-4 card-hover flex-wrap"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                style={{ background: "var(--primary)", color: "white" }}
              >
                {dep.employeeAvatar || dep.employeeName.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {dep.name}
                </p>
                <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                  {dep.employeeName}
                </p>
              </div>

              {/* Status */}
              <span className={`status-${dep.status} px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap`}>
                {statusLabel[dep.status] ?? dep.status}
              </span>

              {/* Deployed Date */}
              <p className="text-sm hidden sm:block whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                {new Date(dep.deployedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {dep.status === "active" && (
                  <button
                    onClick={() => handleAction(dep.id, "paused")}
                    className="p-2 rounded-lg transition-colors"
                    style={{ background: "rgba(245, 158, 11, 0.1)" }}
                    title="Pause"
                  >
                    <Pause size={16} style={{ color: "var(--warning)" }} />
                  </button>
                )}
                {dep.status === "paused" && (
                  <button
                    onClick={() => handleAction(dep.id, "active")}
                    className="p-2 rounded-lg transition-colors"
                    style={{ background: "rgba(34, 197, 94, 0.1)" }}
                    title="Resume"
                  >
                    <Play size={16} style={{ color: "var(--success)" }} />
                  </button>
                )}
                {(dep.status === "active" || dep.status === "paused") && (
                  <button
                    onClick={() => handleAction(dep.id, "stopped")}
                    className="p-2 rounded-lg transition-colors"
                    style={{ background: "rgba(239, 68, 68, 0.1)" }}
                    title="Stop"
                  >
                    <Square size={16} style={{ color: "var(--danger)" }} />
                  </button>
                )}
                <Link
                  href={`/deploy/${dep.id}`}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: "rgba(99, 102, 241, 0.1)" }}
                  title="Configure"
                >
                  <Settings size={16} style={{ color: "var(--primary)" }} />
                </Link>
                <Link
                  href={`/performance?deploymentId=${dep.id}`}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: "rgba(6, 182, 212, 0.1)" }}
                  title="View Performance"
                >
                  <ExternalLink size={16} style={{ color: "var(--accent)" }} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
