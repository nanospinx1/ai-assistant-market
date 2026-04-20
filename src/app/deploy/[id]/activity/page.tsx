"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/Providers";
import { useEffect, useState } from "react";
import { ArrowLeft, Activity, Copy, X } from "lucide-react";
import ActivityFeed from "@/components/ActivityFeed";

export default function DeploymentActivityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const deploymentId = params.id as string;
  const [deploymentName, setDeploymentName] = useState<string>("");
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneName, setCloneName] = useState("");
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user?.id || !deploymentId) return;
    fetch("/api/deployments")
      .then((res) => res.json())
      .then((data) => {
        const deps = data.deployments ?? data;
        const dep = deps.find((d: any) => d.id === deploymentId);
        if (dep) setDeploymentName(dep.name);
      })
      .catch(() => {});
  }, [user?.id, deploymentId]);

  const openCloneModal = () => {
    setCloneName(`${deploymentName} (Copy)`);
    setShowCloneModal(true);
  };

  const handleClone = async () => {
    setCloning(true);
    try {
      const res = await fetch("/api/deployments/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deploymentId,
          newName: cloneName.trim() || undefined,
        }),
      });
      if (res.ok) {
        setShowCloneModal(false);
        router.push("/deploy");
      }
    } catch {
      // silently handle
    } finally {
      setCloning(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/deploy")}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <ArrowLeft size={16} style={{ color: "var(--text-secondary)" }} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Activity Log
          </h1>
          {deploymentName && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {deploymentName}
            </p>
          )}
        </div>
        <Activity size={20} className="ml-auto" style={{ color: "var(--text-muted)" }} />
        {deploymentName && (
          <button
            onClick={openCloneModal}
            className="inline-flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-400 bg-teal-500/15 hover:bg-teal-500/30 transition-all border border-teal-500/20"
          >
            <Copy size={13} /> Clone
          </button>
        )}
      </div>

      {/* Feed */}
      <div
        className="rounded-2xl p-6 border"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}
      >
        <ActivityFeed deploymentId={deploymentId} limit={20} />
      </div>

      {/* Clone Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="rounded-2xl p-6 w-full max-w-md shadow-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Clone Agent
              </h2>
              <button
                onClick={() => setShowCloneModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X size={16} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Create a copy of <strong style={{ color: "var(--text-primary)" }}>{deploymentName}</strong>. The clone will start in &quot;Configuring&quot; status.
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
                onClick={() => setShowCloneModal(false)}
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
        </div>
      )}
    </div>
  );
}
