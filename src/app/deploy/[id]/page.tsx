"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Rocket,
  Check,
  ArrowLeft,
  ArrowRight,
  Settings,
  Zap,
} from "lucide-react";

const TOOLS = ["Email", "Chat", "Phone", "CRM", "Calendar", "Database", "API", "Custom"];
const DATA_SOURCES = ["Knowledge Base", "Website", "Documents", "CRM Data", "Analytics", "Custom Data"];
const SCHEDULES = ["24/7", "Business Hours", "Custom"];

const STEPS = ["Configure", "Review", "Deploy"];

interface DeployConfig {
  name: string;
  tools: string[];
  dataSources: string[];
  schedule: string;
}

export default function DeployConfigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [step, setStep] = useState(0);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [config, setConfig] = useState<DeployConfig>({
    name: "",
    tools: [],
    dataSources: [],
    schedule: "24/7",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const toggleItem = (list: string[], item: string) =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  const canProceed =
    step === 0
      ? config.name.trim() !== "" && config.tools.length > 0 && config.dataSources.length > 0
      : true;

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          userId: session?.user?.id,
          ...config,
        }),
      });
      setDeployed(true);
    } catch {
      // handle error
    } finally {
      setDeploying(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--primary)" }} />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: i <= step ? "var(--primary)" : "var(--bg-card)",
                  color: i <= step ? "white" : "var(--text-muted)",
                  border: i <= step ? "none" : "1px solid var(--border)",
                }}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span style={{ color: i <= step ? "var(--text-primary)" : "var(--text-muted)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: "var(--bg-card)" }}>
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${((step + 1) / STEPS.length) * 100}%`,
              background: "linear-gradient(90deg, var(--primary), var(--accent))",
            }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div
        className="rounded-xl p-8"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        {/* Step 1: Configure */}
        {step === 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings size={24} style={{ color: "var(--primary)" }} />
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                Configure Deployment
              </h2>
            </div>

            {/* Deployment Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Deployment Name
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig((c) => ({ ...c, name: e.target.value }))}
                placeholder="e.g. Customer Support – West Region"
                className="w-full px-4 py-3 rounded-lg outline-none transition-colors"
                style={{
                  background: "var(--bg-dark)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Tools */}
            <div className="space-y-3">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Tools
              </label>
              <div className="flex flex-wrap gap-3">
                {TOOLS.map((tool) => {
                  const active = config.tools.includes(tool);
                  return (
                    <button
                      key={tool}
                      onClick={() => setConfig((c) => ({ ...c, tools: toggleItem(c.tools, tool) }))}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        background: active ? "rgba(99, 102, 241, 0.2)" : "var(--bg-dark)",
                        border: active ? "1px solid var(--primary)" : "1px solid var(--border)",
                        color: active ? "var(--primary-light)" : "var(--text-secondary)",
                      }}
                    >
                      {tool}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data Sources */}
            <div className="space-y-3">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Data Sources
              </label>
              <div className="flex flex-wrap gap-3">
                {DATA_SOURCES.map((src) => {
                  const active = config.dataSources.includes(src);
                  return (
                    <button
                      key={src}
                      onClick={() =>
                        setConfig((c) => ({ ...c, dataSources: toggleItem(c.dataSources, src) }))
                      }
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        background: active ? "rgba(6, 182, 212, 0.2)" : "var(--bg-dark)",
                        border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                        color: active ? "var(--accent)" : "var(--text-secondary)",
                      }}
                    >
                      {src}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Schedule
              </label>
              <select
                value={config.schedule}
                onChange={(e) => setConfig((c) => ({ ...c, schedule: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{
                  background: "var(--bg-dark)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                {SCHEDULES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap size={24} style={{ color: "var(--accent)" }} />
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                Review Configuration
              </h2>
            </div>

            {[
              { label: "Deployment Name", value: config.name },
              { label: "Tools", value: config.tools.join(", ") },
              { label: "Data Sources", value: config.dataSources.join(", ") },
              { label: "Schedule", value: config.schedule },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-start p-4 rounded-lg"
                style={{ background: "var(--bg-dark)" }}
              >
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {row.label}
                </span>
                <span className="text-sm text-right max-w-[60%]" style={{ color: "var(--text-primary)" }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Deploy */}
        {step === 2 && (
          <div className="text-center space-y-6 py-8">
            {deployed ? (
              <>
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-pulse-glow"
                  style={{ background: "rgba(34, 197, 94, 0.2)" }}
                >
                  <Check size={40} style={{ color: "var(--success)" }} />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Deployment Successful! 🎉
                </h2>
                <p style={{ color: "var(--text-secondary)" }}>
                  Your AI employee is now live and ready to work.
                </p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white"
                  style={{ background: "var(--primary)" }}
                >
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: "rgba(99, 102, 241, 0.2)" }}
                >
                  <Rocket size={40} style={{ color: "var(--primary)" }} />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Ready to Deploy
                </h2>
                <p style={{ color: "var(--text-secondary)" }}>
                  Click the button below to deploy <strong>{config.name}</strong>.
                </p>
                <button
                  onClick={handleDeploy}
                  disabled={deploying}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: "var(--primary)" }}
                >
                  {deploying ? (
                    <>
                      <div
                        className="animate-spin rounded-full h-4 w-4 border-b-2"
                        style={{ borderColor: "white" }}
                      />
                      Deploying…
                    </>
                  ) : (
                    <>
                      <Rocket size={18} /> Deploy Now
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {!deployed && (
        <div className="flex justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30"
            style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          {step < 2 && (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              disabled={!canProceed}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-30"
              style={{ background: "var(--primary)" }}
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
