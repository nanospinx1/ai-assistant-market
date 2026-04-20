"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarClock } from "lucide-react";
import ScheduledTasksManager from "@/components/ScheduledTasksManager";

export default function ScheduledTasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const deploymentId = params.id as string;
  const [deploymentName, setDeploymentName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user?.id || !deploymentId) return;
    fetch("/api/deployments")
      .then((r) => r.json())
      .then((data) => {
        const deps = data.deployments ?? data;
        const dep = deps.find((d: { id: string }) => d.id === deploymentId);
        if (dep) setDeploymentName(dep.name);
      })
      .catch(() => {});
  }, [user?.id, deploymentId]);

  if (authLoading || !user) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/deploy/${deploymentId}/workspace`)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <ArrowLeft size={16} style={{ color: "var(--text-secondary)" }} />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <CalendarClock size={24} className="text-indigo-400" />
            Scheduled Tasks
          </h1>
          {deploymentName && (
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {deploymentName}
            </p>
          )}
        </div>
      </div>

      <ScheduledTasksManager deploymentId={deploymentId} />
    </div>
  );
}
