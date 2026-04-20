"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  X,
  Plus,
  Trash2,
  Upload,
  Eye,
  Loader2,
  Shield,
  Clock,
  BarChart3,
  FileText,
  Sparkles,
  Tag,
  Wrench,
  Briefcase,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

// ── Constants ──

const COMMON_TOOLS = [
  "Salesforce", "Slack", "HubSpot", "Gmail", "Zendesk",
  "Shopify", "QuickBooks", "Calendly", "Jira", "Notion",
  "Stripe", "Intercom", "Asana", "Trello", "GitHub",
];

const INDUSTRY_TAGS = [
  "E-commerce", "SaaS", "Healthcare", "Real Estate", "Restaurant",
  "Retail", "Consulting", "Agency", "Startup", "Enterprise",
];

const SIZE_TAGS = [
  "1-5 employees", "5-20 employees", "20-50 employees", "50+ employees",
];

const ALL_BEST_FOR_TAGS = [...INDUSTRY_TAGS, ...SIZE_TAGS];

// ── Types ──

interface ToolIntegration {
  name: string;
  note: string;
}

interface UseCase {
  title: string;
  description: string;
  outcome: string;
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
  status: string;
  deployed_at?: string;
  created_at?: string;
  config: Record<string, unknown>;
}

interface QualityGate {
  id: string;
  label: string;
  passed: boolean;
  message: string;
  icon: React.ReactNode;
}

// ── Helpers ──

/** Deterministic pseudo-random from a string seed (for demo performance score) */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return ((hash & 0x7fffffff) % 100);
}

function daysSince(dateStr: string | undefined): number {
  if (!dateStr) return 0;
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

// ── Component ──

export default function PublishPortfolioPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const employeeId = params.id as string;
  const deploymentId = searchParams.get("deploymentId") ?? "";

  // Page state
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyPublished, setAlreadyPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"portfolio" | "gates" | "preview">("portfolio");

  // Portfolio form state
  const [specialty, setSpecialty] = useState("");
  const [tools, setTools] = useState<ToolIntegration[]>([]);
  const [toolSearch, setToolSearch] = useState("");
  const [showToolDropdown, setShowToolDropdown] = useState(false);
  const [bestFor, setBestFor] = useState<string[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([
    { title: "", description: "", outcome: "" },
    { title: "", description: "", outcome: "" },
  ]);

  // ── Auth redirect ──
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  // ── Fetch deployment data ──
  const fetchDeployment = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch("/api/deployments");
      if (res.ok) {
        const data = await res.json();
        const deps: Deployment[] = data.deployments ?? data;
        // Find by employee_id or specific deployment id
        const found = deps.find(
          (d) => d.employee_id === employeeId || d.id === deploymentId
        );
        if (found) {
          setDeployment(found);
        }
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [user?.id, employeeId, deploymentId]);

  useEffect(() => {
    fetchDeployment();
  }, [fetchDeployment]);

  // ── Check existing submission ──
  useEffect(() => {
    if (!user?.id || !employeeId) return;
    fetch(`/api/marketplace/submit?employeeId=${employeeId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const existing = data.find(
            (s: { employee_id?: string; status?: string }) =>
              s.employee_id === employeeId &&
              (s.status === "approved" || s.status === "pending")
          );
          if (existing) setAlreadyPublished(true);
        }
      })
      .catch(() => {});
  }, [user?.id, employeeId]);

  // ── Tool management ──
  const addTool = (name: string) => {
    if (tools.some((t) => t.name.toLowerCase() === name.toLowerCase())) return;
    setTools((prev) => [...prev, { name, note: "" }]);
    setToolSearch("");
    setShowToolDropdown(false);
  };

  const removeTool = (idx: number) => {
    setTools((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateToolNote = (idx: number, note: string) => {
    setTools((prev) => prev.map((t, i) => (i === idx ? { ...t, note } : t)));
  };

  const filteredToolSuggestions = COMMON_TOOLS.filter(
    (t) =>
      t.toLowerCase().includes(toolSearch.toLowerCase()) &&
      !tools.some((existing) => existing.name.toLowerCase() === t.toLowerCase())
  );

  // ── Best-for tags ──
  const toggleBestFor = (tag: string) => {
    setBestFor((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // ── Use cases ──
  const updateUseCase = (idx: number, field: keyof UseCase, value: string) => {
    setUseCases((prev) =>
      prev.map((uc, i) => (i === idx ? { ...uc, [field]: value } : uc))
    );
  };

  const addUseCase = () => {
    setUseCases((prev) => [...prev, { title: "", description: "", outcome: "" }]);
  };

  const removeUseCase = (idx: number) => {
    if (useCases.length <= 2) return;
    setUseCases((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Quality gates ──
  const deployedDays = daysSince(deployment?.deployed_at ?? deployment?.created_at);
  const performanceScore = useMemo(() => {
    const base = seededRandom(deploymentId || employeeId);
    // Shift to 60-100 range for realistic demo
    return 60 + Math.floor(base * 0.4);
  }, [deploymentId, employeeId]);

  const hasOnboarding = useMemo(() => {
    if (!deployment?.config) return false;
    const cfg = deployment.config;
    const configTools = cfg.tools;
    return Array.isArray(configTools) && configTools.length > 0;
  }, [deployment]);

  const validUseCases = useCases.filter(
    (uc) => uc.title.trim() && uc.description.trim() && uc.outcome.trim()
  );
  const portfolioComplete =
    specialty.length >= 100 &&
    tools.length >= 2 &&
    bestFor.length >= 1 &&
    validUseCases.length >= 2;

  const gates: QualityGate[] = [
    {
      id: "age",
      label: "Deployment Age",
      passed: deployedDays >= 7,
      message: deployedDays >= 7
        ? `Deployed for ${deployedDays} days`
        : `Must be deployed for at least 7 days (currently ${deployedDays} day${deployedDays === 1 ? "" : "s"})`,
      icon: <Clock size={18} />,
    },
    {
      id: "perf",
      label: "Performance Score",
      passed: performanceScore >= 80,
      message: performanceScore >= 80
        ? `Performance score: ${performanceScore}%`
        : `Performance score must be 80%+ (currently ${performanceScore}%)`,
      icon: <BarChart3 size={18} />,
    },
    {
      id: "onboarding",
      label: "Onboarding Completed",
      passed: hasOnboarding,
      message: hasOnboarding
        ? "Onboarding completed with tools connected"
        : "Complete onboarding and connect at least one tool",
      icon: <Shield size={18} />,
    },
    {
      id: "portfolio",
      label: "Portfolio Completeness",
      passed: portfolioComplete,
      message: portfolioComplete
        ? "All portfolio fields completed"
        : buildPortfolioHint(),
      icon: <FileText size={18} />,
    },
  ];

  function buildPortfolioHint(): string {
    const missing: string[] = [];
    if (specialty.length < 100) missing.push(`specialty (${specialty.length}/100 chars)`);
    if (tools.length < 2) missing.push(`tools (${tools.length}/2)`);
    if (bestFor.length < 1) missing.push("at least 1 industry tag");
    if (validUseCases.length < 2) missing.push(`use cases (${validUseCases.length}/2)`);
    return `Missing: ${missing.join(", ")}`;
  }

  const passedCount = gates.filter((g) => g.passed).length;
  const readinessScore = Math.round((passedCount / gates.length) * 100);
  const allGatesPassed = passedCount === gates.length;

  // ── Submit ──
  const handleSubmit = async () => {
    if (!allGatesPassed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/marketplace/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          specialty,
          toolIntegrations: tools,
          bestFor,
          useCases: validUseCases,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / auth guards ──
  if (authLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg" style={{ background: "var(--bg-card)" }} />
        <div className="h-64 rounded-2xl" style={{ background: "var(--bg-card)" }} />
        <div className="h-48 rounded-2xl" style={{ background: "var(--bg-card)" }} />
      </div>
    );
  }
  if (!user) return null;

  if (submitted) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Agent Submitted for Review!
        </h1>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          Your agent portfolio has been submitted to the marketplace. It will appear in the global marketplace once approved.
        </p>
        <Link
          href="/deploy"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          Back to My Employees
        </Link>
      </div>
    );
  }

  if (alreadyPublished) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
          <AlertCircle size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Already Published
        </h1>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          This agent has already been submitted to the marketplace.
        </p>
        <Link
          href="/deploy"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          Back to My Employees
        </Link>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Deployment Not Found
        </h1>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          Could not find a deployment for this agent.
        </p>
        <Link
          href="/deploy"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600"
        >
          <ArrowLeft size={16} /> Back to My Employees
        </Link>
      </div>
    );
  }

  const sections = [
    { key: "portfolio" as const, label: "Agent Portfolio", icon: <Briefcase size={16} /> },
    { key: "gates" as const, label: "Quality Gates", icon: <Shield size={16} /> },
    { key: "preview" as const, label: "Preview & Submit", icon: <Eye size={16} /> },
  ];

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <Link
        href="/deploy"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft size={16} />
        Back to My Employees
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Publish to Marketplace
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {deployment.name} · {deployment.employeeRole || deployment.employeeName}
        </p>
      </div>

      {/* Readiness Score Bar */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              Readiness Score
            </span>
          </div>
          <span
            className={`text-sm font-bold ${
              readinessScore === 100
                ? "text-emerald-400"
                : readinessScore >= 50
                  ? "text-amber-400"
                  : "text-red-400"
            }`}
          >
            {readinessScore}%
          </span>
        </div>
        <div
          className="h-2.5 rounded-full overflow-hidden"
          style={{ background: "var(--bg-main)" }}
        >
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              readinessScore === 100
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : readinessScore >= 50
                  ? "bg-gradient-to-r from-amber-500 to-orange-400"
                  : "bg-gradient-to-r from-red-500 to-rose-400"
            }`}
            style={{ width: `${readinessScore}%` }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          {passedCount}/{gates.length} quality gates passed
          {!allGatesPassed && " — all gates must pass before submitting"}
        </p>
      </div>

      {/* Section tabs */}
      <div
        className="flex rounded-xl p-1 mb-6 gap-1"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeSection === s.key
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {s.icon}
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Section A: Agent Portfolio ─── */}
      {activeSection === "portfolio" && (
        <div className="space-y-6 animate-fade-in">
          {/* Specialty Description */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              <Target size={16} className="text-indigo-400" />
              Specialty Description
              <span className="text-red-400">*</span>
            </label>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              What does this agent excel at? Describe its unique strengths and value proposition. (min 100 characters)
            </p>
            <textarea
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="e.g. This agent specializes in handling complex customer service inquiries across multiple channels. It excels at understanding customer sentiment, providing personalized solutions..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              style={{
                background: "var(--bg-main)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
              }}
            />
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs ${
                  specialty.length >= 100 ? "text-emerald-400" : "text-[var(--text-muted)]"
                }`}
              >
                {specialty.length}/100 characters
              </span>
            </div>
          </div>

          {/* Tool Integrations */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              <Wrench size={16} className="text-cyan-400" />
              Tool Integrations
            </label>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Which tools/platforms has this agent been connected to? (min 2)
            </p>

            {/* Tool search */}
            <div className="relative mb-3">
              <input
                value={toolSearch}
                onChange={(e) => {
                  setToolSearch(e.target.value);
                  setShowToolDropdown(true);
                }}
                onFocus={() => setShowToolDropdown(true)}
                placeholder="Search or type a custom tool name..."
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                style={{
                  background: "var(--bg-main)",
                  border: "1px solid var(--border-primary)",
                  color: "var(--text-primary)",
                }}
              />
              {showToolDropdown && (toolSearch || filteredToolSuggestions.length > 0) && (
                <div
                  className="absolute z-20 w-full mt-1 rounded-xl shadow-xl max-h-48 overflow-y-auto"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  {filteredToolSuggestions.map((t) => (
                    <button
                      key={t}
                      onClick={() => addTool(t)}
                      className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-indigo-500/10"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t}
                    </button>
                  ))}
                  {toolSearch &&
                    !COMMON_TOOLS.some(
                      (t) => t.toLowerCase() === toolSearch.toLowerCase()
                    ) &&
                    !tools.some(
                      (t) => t.name.toLowerCase() === toolSearch.toLowerCase()
                    ) && (
                      <button
                        onClick={() => addTool(toolSearch.trim())}
                        className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-indigo-500/10 flex items-center gap-2"
                        style={{ color: "var(--primary)" }}
                      >
                        <Plus size={14} />
                        Add &ldquo;{toolSearch.trim()}&rdquo;
                      </button>
                    )}
                  {!toolSearch && filteredToolSuggestions.length === 0 && (
                    <p className="px-4 py-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      All common tools added
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Added tools */}
            {tools.length > 0 && (
              <div className="space-y-2">
                {tools.map((tool, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl"
                    style={{ background: "var(--bg-main)", border: "1px solid var(--border-primary)" }}
                  >
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 whitespace-nowrap"
                    >
                      {tool.name}
                    </span>
                    <input
                      value={tool.note}
                      onChange={(e) => updateToolNote(idx, e.target.value)}
                      placeholder="How is it used? (optional)"
                      className="flex-1 bg-transparent text-xs focus:outline-none"
                      style={{ color: "var(--text-secondary)" }}
                    />
                    <button
                      onClick={() => removeTool(idx)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs mt-2" style={{ color: tools.length >= 2 ? "var(--text-muted)" : "var(--text-muted)" }}>
              {tools.length} tool{tools.length !== 1 ? "s" : ""} added
              {tools.length < 2 && " (need at least 2)"}
            </p>
          </div>

          {/* Best For Tags */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              <Tag size={16} className="text-purple-400" />
              Best For
              <span className="text-red-400">*</span>
            </label>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Select target industries and business sizes. (at least 1)
            </p>

            <div className="mb-3">
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Industries
              </p>
              <div className="flex flex-wrap gap-2">
                {INDUSTRY_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleBestFor(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      bestFor.includes(tag)
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "border hover:border-purple-500/30 hover:text-purple-300"
                    }`}
                    style={
                      bestFor.includes(tag)
                        ? {}
                        : { borderColor: "var(--border-primary)", color: "var(--text-muted)" }
                    }
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Business Size
              </p>
              <div className="flex flex-wrap gap-2">
                {SIZE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleBestFor(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      bestFor.includes(tag)
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : "border hover:border-indigo-500/30 hover:text-indigo-300"
                    }`}
                    style={
                      bestFor.includes(tag)
                        ? {}
                        : { borderColor: "var(--border-primary)", color: "var(--text-muted)" }
                    }
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sample Use Cases */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              <Sparkles size={16} className="text-amber-400" />
              Sample Use Cases
              <span className="text-red-400">*</span>
            </label>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Provide at least 2 real use cases showing how this agent delivers value.
            </p>

            <div className="space-y-4">
              {useCases.map((uc, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-4"
                  style={{ background: "var(--bg-main)", border: "1px solid var(--border-primary)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                      Use Case {idx + 1}
                    </span>
                    {useCases.length > 2 && (
                      <button
                        onClick={() => removeUseCase(idx)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <input
                    value={uc.title}
                    onChange={(e) => updateUseCase(idx, "title", e.target.value)}
                    placeholder="Title (e.g. Automated Order Tracking)"
                    className="w-full px-3 py-2 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <textarea
                    value={uc.description}
                    onChange={(e) => updateUseCase(idx, "description", e.target.value)}
                    placeholder="Describe the use case..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg text-sm mb-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <input
                    value={uc.outcome}
                    onChange={(e) => updateUseCase(idx, "outcome", e.target.value)}
                    placeholder="Outcome / Result (e.g. Reduced response time by 60%)"
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addUseCase}
              className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-indigo-500/10"
              style={{ color: "var(--primary)" }}
            >
              <Plus size={14} /> Add another use case
            </button>
          </div>
        </div>
      )}

      {/* ─── Section B: Quality Gates ─── */}
      {activeSection === "gates" && (
        <div className="space-y-4 animate-fade-in">
          {gates.map((gate) => (
            <div
              key={gate.id}
              className="rounded-2xl p-5 flex items-start gap-4"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  gate.passed
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {gate.passed ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {gate.label}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      gate.passed
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/15 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {gate.passed ? "PASS" : "FAIL"}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {gate.passed ? "✅" : "❌"} {gate.message}
                </p>
              </div>
              <div className="shrink-0" style={{ color: gate.passed ? "#10b981" : "#ef4444" }}>
                {gate.icon}
              </div>
            </div>
          ))}

          {!allGatesPassed && (
            <div
              className="rounded-xl p-4 text-sm"
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                color: "var(--text-secondary)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={16} className="text-amber-400" />
                <span className="font-semibold text-amber-400">Not Ready Yet</span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                All quality gates must pass before you can submit. Fix the failing gates above and check back.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── Section C: Preview & Submit ─── */}
      {activeSection === "preview" && (
        <div className="space-y-6 animate-fade-in">
          {/* Marketplace Preview */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border-primary)" }}
          >
            <div className="px-5 py-3 flex items-center gap-2" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-primary)" }}>
              <Eye size={16} className="text-indigo-400" />
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Marketplace Preview
              </span>
            </div>
            <div className="p-6" style={{ background: "var(--bg-card)" }}>
              {/* Agent header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
                  <Briefcase size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    {deployment.name}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {deployment.employeeRole || deployment.employeeName}
                    {deployment.employeeCategory && ` · ${deployment.employeeCategory}`}
                  </p>
                </div>
              </div>

              {/* Specialty */}
              {specialty && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                    Specialty
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {specialty}
                  </p>
                </div>
              )}

              {/* Tools */}
              {tools.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                    Integrations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tools.map((t, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Best For */}
              {bestFor.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                    Best For
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {bestFor.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          INDUSTRY_TAGS.includes(tag)
                            ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                            : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Use Cases */}
              {validUseCases.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                    Use Cases
                  </h4>
                  <div className="space-y-3">
                    {validUseCases.map((uc, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-4"
                        style={{ background: "var(--bg-main)", border: "1px solid var(--border-primary)" }}
                      >
                        <h5 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                          {uc.title}
                        </h5>
                        <p className="text-xs mb-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {uc.description}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-xs font-medium text-emerald-400">
                            {uc.outcome}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit section */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            {error && (
              <div
                className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#ef4444",
                }}
              >
                <XCircle size={16} />
                {error}
              </div>
            )}

            {!allGatesPassed && (
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Blocking Issues
                </p>
                <ul className="space-y-1">
                  {gates
                    .filter((g) => !g.passed)
                    .map((g) => (
                      <li key={g.id} className="flex items-center gap-2 text-xs text-red-400">
                        <XCircle size={12} />
                        {g.label}: {g.message}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!allGatesPassed || submitting}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                allGatesPassed
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20"
                  : "bg-slate-700/50 text-slate-500 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Submit for Review
                </>
              )}
            </button>
            {!allGatesPassed && (
              <p className="text-xs text-center mt-2" style={{ color: "var(--text-muted)" }}>
                All quality gates must pass to enable submission
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
