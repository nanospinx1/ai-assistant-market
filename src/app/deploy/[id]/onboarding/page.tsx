"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plug,
  BookOpen,
  ClipboardList,
  FlaskConical,
  Check,
  CheckCircle,
  Plus,
  Trash2,
  Send,
  ArrowRight,
  Mail,
  Database,
  Calendar,
  Globe,
  X,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Settings,
  ShieldCheck,
  Eye,
  ChevronDown,
  ChevronUp,
  Tag,
  FileText,
  Upload,
  Link2,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import ScheduledTasksManager from "@/components/ScheduledTasksManager";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ConnectedTool {
  name: string;
  type: string;
  apiKey: string;
  fields?: Record<string, string>;
  note?: string;
  status: "connected";
}
interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  format: "text" | "file" | "url" | "qa";
  url?: string;
  fileName?: string;
  qaPairs?: { question: string; answer: string }[];
}
interface TaskEntry {
  id: string;
  text: string;
  priority: "High" | "Medium" | "Low";
}
interface Expectations {
  tone: string;
  qualityStandards: string;
  escalationRules: string;
}
interface ApprovalRule {
  id: string;
  category: string;
  label: string;
  description?: string;
  enabled: boolean;
}
interface OnboardingData {
  connectedTools: ConnectedTool[];
  knowledge: KnowledgeEntry[];
  tasks: TaskEntry[];
  expectations: Expectations;
  completed: boolean;
}
interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const TABS = [
  { key: "profile", label: "Agent Profile", icon: Settings, emoji: "🤖" },
  { key: "tools", label: "Connect Tools", icon: Plug, emoji: "🔌" },
  { key: "knowledge", label: "Company Knowledge", icon: BookOpen, emoji: "📚" },
  { key: "tasks", label: "Tasks & Schedule", icon: ClipboardList, emoji: "📋" },
  { key: "approvals", label: "Approvals & Policies", icon: ShieldCheck, emoji: "🛡️" },
  { key: "test", label: "Test Drive", icon: FlaskConical, emoji: "🧪" },
  { key: "activity", label: "Activity Log", icon: ClipboardList, emoji: "📋" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const AVAILABLE_TOOLS: {
  type: string;
  name: string;
  desc: string;
  icon: any;
  fields: { key: string; label: string; placeholder: string; type?: string }[];
}[] = [
  {
    type: "email",
    name: "Email",
    desc: "Send & receive emails on behalf of your agent",
    icon: Mail,
    fields: [
      { key: "domain", label: "Domain / SMTP Host", placeholder: "smtp.yourcompany.com" },
      { key: "username", label: "Username / Email", placeholder: "agent@yourcompany.com" },
      { key: "password", label: "Password / App Password", placeholder: "••••••••", type: "password" },
    ],
  },
  {
    type: "crm",
    name: "CRM",
    desc: "Access customer relationship data",
    icon: Database,
    fields: [
      { key: "instanceUrl", label: "Instance URL", placeholder: "https://yourcrm.example.com" },
      { key: "apiKey", label: "API Key", placeholder: "crm-api-key-xxxx" },
    ],
  },
  {
    type: "calendar",
    name: "Calendar",
    desc: "Schedule meetings & manage availability",
    icon: Calendar,
    fields: [
      { key: "provider", label: "Provider", placeholder: "Google / Outlook / CalDAV" },
      { key: "apiKey", label: "API Key / OAuth Token", placeholder: "calendar-api-key-xxxx" },
    ],
  },
  {
    type: "api",
    name: "API / Webhooks",
    desc: "Connect to external services via API",
    icon: Globe,
    fields: [
      { key: "endpoint", label: "Endpoint URL", placeholder: "https://api.example.com/v1" },
      { key: "method", label: "Method", placeholder: "GET / POST / PUT" },
      { key: "authHeader", label: "Auth Header / Bearer Token", placeholder: "Bearer xxxx" },
    ],
  },
  {
    type: "custom",
    name: "Custom Integration",
    desc: "Add any tool with custom connection fields",
    icon: Settings,
    fields: [],
  },
];

const DEFAULT_KNOWLEDGE_CATEGORIES = [
  "FAQs", "Company Policies", "Product Info", "Processes",
  "Training Materials", "Templates & Scripts", "Pricing & Contracts",
  "Brand Guidelines", "Internal Tools Docs", "Vendor/Partner Info",
];

const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-500/20 text-red-400",
  Medium: "bg-amber-500/20 text-amber-400",
  Low: "bg-emerald-500/20 text-emerald-400",
};

const SUGGESTED_PROMPTS = [
  "Introduce yourself and explain what you can do.",
  "How would you handle an angry customer?",
  "Summarize your key capabilities.",
  "Walk me through your escalation process.",
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id: deploymentId } = useParams() as { id: string };
  const searchParams = useSearchParams();

  const initialTab = (searchParams.get("tab") as TabKey) || "profile";
  const [tab, setTab] = useState<TabKey>(
    TABS.some((t) => t.key === initialTab) ? initialTab : "profile"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deployName, setDeployName] = useState("");
  const [schedule, setSchedule] = useState("");
  const [deployStatus, setDeployStatus] = useState("");
  const [configVersion, setConfigVersion] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Baseline config snapshot — used to detect unsaved changes
  const savedConfigRef = useRef("");

  // Onboarding state
  const [connectedTools, setConnectedTools] = useState<ConnectedTool[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [tasks, setTasks] = useState<TaskEntry[]>([]);
  const [expectations, setExpectations] = useState<Expectations>({
    tone: "Professional",
    qualityStandards: "",
    escalationRules: "",
  });

  // Approval settings per tool (legacy, still used for change detection baseline)
  const [approvalSettings, setApprovalSettings] = useState<Record<string, boolean>>({
    email: true,
    crm: false,
    calendar: true,
  });

  // Rich approval rules
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([
    { id: "rule-email", category: "Tool Access", label: "Approve before sending emails", enabled: true },
    { id: "rule-crm", category: "Tool Access", label: "Approve before updating CRM records", enabled: false },
    { id: "rule-calendar", category: "Tool Access", label: "Approve before scheduling meetings", enabled: true },
  ]);

  // Scheduled task count (from ScheduledTasksManager)
  const [scheduledTaskCount, setScheduledTaskCount] = useState(0);

  // Tabs reviewed during onboarding (for skip/mark-as-reviewed)
  const [reviewedTabs, setReviewedTabs] = useState<Set<TabKey>>(new Set());

  // Task form
  const [taskForm, setTaskForm] = useState({ text: "", priority: "Medium" as "High" | "Medium" | "Low" });

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Agent profile from parent employee definition
  interface AgentProfile {
    employeeId: string;
    name: string;
    role: string;
    category: string;
    description: string;
    longDescription: string;
    capabilities: string[];
    systemPrompt: string;
    customInstructions: string;
    isCustom: boolean;
  }
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);

  /* ---- Auth redirect ---- */
  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  /* ---- Load onboarding data ---- */
  const fetchOnboarding = useCallback(async () => {
    try {
      const res = await fetch(`/api/deployments/${deploymentId}/onboarding`);
      if (res.ok) {
        const data = await res.json();
        setDeployName(data.name || "");
        setSchedule(data.schedule || "");
        setDeployStatus(data.status || "");
        if (data.approvalRules) {
          setApprovalRules(data.approvalRules);
        } else if (data.approvalSettings) {
          // Migrate legacy approvalSettings → approvalRules
          const legacy = data.approvalSettings as Record<string, boolean>;
          const migrated: ApprovalRule[] = [
            { id: "rule-email", category: "Tool Access", label: "Approve before sending emails", enabled: !!legacy.email },
            { id: "rule-crm", category: "Tool Access", label: "Approve before updating CRM records", enabled: !!legacy.crm },
            { id: "rule-calendar", category: "Tool Access", label: "Approve before scheduling meetings", enabled: !!legacy.calendar },
          ];
          setApprovalRules(migrated);
        }
        // Keep legacy approvalSettings in sync for backward compat
        if (data.approvalSettings) setApprovalSettings(data.approvalSettings);
        if (data.reviewedTabs) setReviewedTabs(new Set(data.reviewedTabs as TabKey[]));
        if (data.agentProfile) setAgentProfile(data.agentProfile);
        const ob = data.onboarding as OnboardingData;
        if (ob) {
          setConnectedTools(ob.connectedTools || []);
          setKnowledge((ob.knowledge || []).map((k: KnowledgeEntry) => ({ ...k, format: k.format || "text" })));
          setTasks(ob.tasks || []);
          if (ob.expectations) setExpectations(ob.expectations);
        }
        // Fetch scheduled task count eagerly so tab status is correct on load
        let initialTaskCount = 0;
        try {
          const taskRes = await fetch(`/api/scheduled-tasks?deploymentId=${deploymentId}`);
          if (taskRes.ok) {
            const taskData = await taskRes.json();
            initialTaskCount = (taskData.tasks ?? []).length;
            setScheduledTaskCount(initialTaskCount);
          }
        } catch { /* ignore */ }
        // Store baseline for change detection
        const loadedRules = data.approvalRules || [
          { id: "rule-email", category: "Tool Access", label: "Approve before sending emails", enabled: !!(data.approvalSettings?.email ?? true) },
          { id: "rule-crm", category: "Tool Access", label: "Approve before updating CRM records", enabled: !!(data.approvalSettings?.crm ?? false) },
          { id: "rule-calendar", category: "Tool Access", label: "Approve before scheduling meetings", enabled: !!(data.approvalSettings?.calendar ?? true) },
        ];
        savedConfigRef.current = JSON.stringify({
          connectedTools: ob?.connectedTools || [],
          knowledge: ob?.knowledge || [],
          expectations: ob?.expectations || { tone: "Professional", qualityStandards: "", escalationRules: "" },
          schedule: data.schedule || "",
          approvalRules: loadedRules,
          scheduledTaskCount: initialTaskCount,
        });
      }
      // Fetch config version
      try {
        const vRes = await fetch(`/api/deployments/${deploymentId}/config-versions`);
        if (vRes.ok) {
          const vData = await vRes.json();
          if (vData.versions?.length > 0) {
            setConfigVersion(vData.versions[0].version);
          }
        }
      } catch {
        // non-critical
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [deploymentId]);

  useEffect(() => {
    if (user) fetchOnboarding();
  }, [user, fetchOnboarding]);

  /* ---- Save helper ---- */
  const saveOnboarding = useCallback(
    async (partial: Partial<OnboardingData>) => {
      setSaving(true);
      try {
        await fetch(`/api/deployments/${deploymentId}/onboarding`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partial),
        });
      } catch {
        // silently handle
      } finally {
        setSaving(false);
      }
    },
    [deploymentId]
  );

  /* ---- Auto-scroll chat ---- */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  /* ---- Completion tracking ---- */
  const tabComplete: Record<TabKey, boolean> = {
    profile: !!agentProfile || reviewedTabs.has("profile"),
    tools: connectedTools.length > 0 || reviewedTabs.has("tools"),
    knowledge: knowledge.length > 0 || reviewedTabs.has("knowledge"),
    tasks: scheduledTaskCount > 0 || reviewedTabs.has("tasks"),
    approvals: approvalRules.some(r => r.enabled) || reviewedTabs.has("approvals"),
    test: chatMessages.length >= 2 || reviewedTabs.has("test"),
    activity: true,
  };
  const completedCount = Object.values(tabComplete).filter(Boolean).length;

  /* ---- Handlers ---- */

  const handleConnectTool = async (toolType: string, toolData: { name: string; fields: Record<string, string> }, addToGlobal?: boolean) => {
    if (!toolData.name.trim()) return;
    const newTool: ConnectedTool = {
      name: toolData.name.trim(),
      type: toolType,
      apiKey: Object.values(toolData.fields)[0] || "",
      fields: toolData.fields,
      status: "connected",
    };
    const updated = [...connectedTools, newTool];
    setConnectedTools(updated);
    await saveOnboarding({ connectedTools: updated });
    if (addToGlobal) {
      try {
        await fetch("/api/integrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolType, name: newTool.name, config: toolData.fields }),
        });
      } catch {}
    }
  };

  const handleDisconnectTool = async (toolType: string) => {
    const updated = connectedTools.filter((t) => t.type !== toolType);
    setConnectedTools(updated);
    await saveOnboarding({ connectedTools: updated });
  };

  const handleAddKnowledge = async (entry: KnowledgeEntry, addToGlobal?: boolean) => {
    const updated = [...knowledge, entry];
    setKnowledge(updated);
    await saveOnboarding({ knowledge: updated });
    if (addToGlobal) {
      try {
        await fetch("/api/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: entry.title, content: entry.content, category: entry.category }),
        });
      } catch {}
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    const updated = knowledge.filter((k) => k.id !== id);
    setKnowledge(updated);
    await saveOnboarding({ knowledge: updated });
  };

  const handleAddTask = async () => {
    if (!taskForm.text.trim()) return;
    const entry: TaskEntry = {
      id: crypto.randomUUID(),
      text: taskForm.text.trim(),
      priority: taskForm.priority,
    };
    const updated = [...tasks, entry];
    setTasks(updated);
    setTaskForm({ text: "", priority: "Medium" });
    await saveOnboarding({ tasks: updated });
  };

  const handleDeleteTask = async (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    await saveOnboarding({ tasks: updated });
  };

  const handleSaveExpectations = async () => {
    await saveOnboarding({ expectations });
  };

  const handleChat = async (message?: string) => {
    const msg = message || chatInput.trim();
    if (!msg) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
    setChatLoading(true);
    try {
      const res = await fetch(`/api/deployments/${deploymentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sandbox: true }),
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || (typeof data.message === "string" ? data.message : data.message?.content) || "No response.";
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I couldn't respond right now. Please try again." },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSetSchedule = async (newSchedule: string) => {
    setSchedule(newSchedule);
    // Save schedule to deployment config
    try {
      await fetch("/api/deployments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deploymentId, schedule: newSchedule }),
      });
    } catch {
      // silently handle
    }
  };

  const isLive = deployStatus === "active" || deployStatus === "paused";
  const isOnboarding = !isLive;

  // Detect unsaved changes by comparing current state to saved baseline
  const currentConfigJson = JSON.stringify({
    connectedTools,
    knowledge,
    expectations,
    schedule,
    approvalRules,
    scheduledTaskCount,
  });
  const hasChanges = isLive && savedConfigRef.current !== "" && currentConfigJson !== savedConfigRef.current;

  const handleMarkReviewed = async (tabKey: TabKey) => {
    const updated = new Set(reviewedTabs);
    updated.add(tabKey);
    setReviewedTabs(updated);
    try {
      await fetch(`/api/deployments/${deploymentId}/onboarding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewedTabs: Array.from(updated) }),
      });
    } catch { /* silently */ }
  };

  const handleTasksChange = useCallback((count: number) => {
    setScheduledTaskCount(count);
    // Update baseline on first load so it doesn't show as a change immediately
    if (savedConfigRef.current) {
      try {
        const baseline = JSON.parse(savedConfigRef.current);
        if (baseline.scheduledTaskCount === 0 && !isLive) {
          baseline.scheduledTaskCount = count;
          savedConfigRef.current = JSON.stringify(baseline);
        }
      } catch { /* ignore */ }
    }
  }, [isLive]);

  const buildConfigSnapshot = () => ({
    onboarding: {
      connectedTools,
      knowledge,
      tasks,
      expectations,
      completed: true,
    },
    schedule,
    approvalRules,
    scheduledTaskCount,
  });

  const handleGoLive = async () => {
    setSaving(true);
    try {
      await fetch(`/api/deployments/${deploymentId}/onboarding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      await fetch("/api/deployments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deploymentId, status: "active" }),
      });
      // Save initial config version (v1)
      await fetch(`/api/deployments/${deploymentId}/config-versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configSnapshot: buildConfigSnapshot(),
          changedFields: ["initial"],
          changeSummary: "Initial deployment configuration",
        }),
      });
      setConfigVersion(1);
      // Transition in-place: update status so UI switches from onboarding bar to live mode
      setDeployStatus("active");
      savedConfigRef.current = currentConfigJson;
    } catch {
      // silently handle
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndApply = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      // Save onboarding data first
      // Derive legacy approvalSettings from approvalRules for backward compat
      const derivedApprovalSettings: Record<string, boolean> = {};
      for (const r of approvalRules) {
        if (r.category === "tool") {
          const key = r.id.replace("tool-", "");
          derivedApprovalSettings[key] = r.enabled;
        }
      }
      await saveOnboarding({
        connectedTools,
        knowledge,
        tasks,
        expectations,
        completed: true,
        approvalSettings: derivedApprovalSettings,
        approvalRules,
      } as Partial<OnboardingData> & { approvalSettings: Record<string, boolean>; approvalRules: ApprovalRule[] });

      // Compute real diff against saved baseline
      const baseline = savedConfigRef.current ? JSON.parse(savedConfigRef.current) : {};
      const changedFields: string[] = [];
      const parts: string[] = [];

      if (JSON.stringify(connectedTools) !== JSON.stringify(baseline.connectedTools || [])) {
        changedFields.push("tools");
        parts.push(`tools: ${connectedTools.length} configured`);
      }
      if (JSON.stringify(knowledge) !== JSON.stringify(baseline.knowledge || [])) {
        changedFields.push("knowledge");
        parts.push(`knowledge: ${knowledge.length} entries`);
      }
      if (JSON.stringify(expectations) !== JSON.stringify(baseline.expectations || {})) {
        changedFields.push("expectations");
        parts.push("expectations updated");
      }
      if (schedule !== (baseline.schedule || "")) {
        changedFields.push("schedule");
        parts.push(`schedule: ${schedule || "none"}`);
      }
      if (JSON.stringify(approvalRules) !== JSON.stringify(baseline.approvalRules || [])) {
        changedFields.push("approvals");
        const enabled = approvalRules.filter(r => r.enabled);
        parts.push(`approval rules: ${enabled.length} active`);
      }
      if (scheduledTaskCount !== (baseline.scheduledTaskCount ?? 0)) {
        changedFields.push("tasks");
        parts.push(`scheduled tasks: ${scheduledTaskCount}`);
      }

      const summary = parts.length > 0 ? parts.join(", ") : "Configuration updated";

      // Create new config version
      const snapshot = buildConfigSnapshot();
      const res = await fetch(`/api/deployments/${deploymentId}/config-versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configSnapshot: snapshot,
          changedFields,
          changeSummary: summary,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConfigVersion(data.version);
        setSaveSuccess(true);
        // Update baseline so button disables again
        savedConfigRef.current = currentConfigJson;
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      // silently handle
    } finally {
      setSaving(false);
    }
  };

  /* ---- Loading / Auth states ---- */
  if (authLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-72 rounded-lg" style={{ background: "var(--bg-card)" }} />
        <div className="h-14 rounded-xl" style={{ background: "var(--bg-card)" }} />
        <div className="h-96 rounded-xl" style={{ background: "var(--bg-card)" }} />
      </div>
    );
  }
  if (!user) return null;

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ---- Header ---- */}
      <div>
        <div className="flex items-center gap-2 text-sm mb-3" style={{ color: "var(--text-muted)" }}>
          <Link href="/deploy" className="hover:text-[var(--text-secondary)] transition-colors">
            My Employees
          </Link>
          <ChevronRight size={14} />
          <Link href={`/deploy/${deploymentId}/workspace`} className="hover:text-[var(--text-secondary)] transition-colors">
            Workspace
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-primary)" }}>Configure</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}
          >
            <Settings size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Configure: {deployName}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Configure, train, and manage your AI employee.
            </p>
          </div>
        </div>
      </div>

      {/* ---- Progress / Action bar ---- */}
      <div
        className="rounded-xl p-4 flex items-center gap-4 flex-wrap"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        {isLive ? (
          /* ---- Live agent: show version info + Save & Apply ---- */
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Agent is live
                  </span>
                </div>
                {configVersion > 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--bg-primary)", color: "var(--text-muted)" }}
                  >
                    Config v{configVersion}
                  </span>
                )}
                {saveSuccess && (
                  <span className="text-xs font-medium text-emerald-500 flex items-center gap-1 animate-fade-in">
                    <CheckCircle size={14} /> Changes applied
                  </span>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {hasChanges
                  ? "You have unsaved changes — click Save & Apply to update your live agent."
                  : "Changes are applied immediately — no restart needed."}
              </p>
            </div>
            <button
              onClick={handleSaveAndApply}
              disabled={saving || !hasChanges}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shrink-0 ${
                hasChanges
                  ? "shadow-lg shadow-indigo-500/20"
                  : "opacity-50 cursor-not-allowed"
              }`}
              style={{ background: hasChanges ? "linear-gradient(135deg, #4F46E5, #7C3AED)" : "var(--bg-tertiary)" }}
            >
              <Sparkles size={16} />
              {saving ? "Applying..." : hasChanges ? "Save & Apply Changes" : "No Changes"}
            </button>
          </>
        ) : (
          /* ---- Onboarding: show progress bar + Go Live ---- */
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {completedCount} of {TABS.length} sections complete
                </span>
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  {Math.round((completedCount / TABS.length) * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "var(--bg-primary)" }}>
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedCount / TABS.length) * 100}%`,
                    background: "linear-gradient(90deg, #4F46E5, #7C3AED)",
                  }}
                />
              </div>
            </div>
            <button
              onClick={handleGoLive}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 shrink-0"
              style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
            >
              <Sparkles size={16} />
              {saving ? "Saving..." : "Complete Onboarding & Go Live"}
            </button>
          </>
        )}
      </div>

      {/* ---- Tab Navigation ---- */}
      <div className="flex items-center gap-3">
        <div
          className="flex gap-1 p-1 rounded-xl overflow-x-auto flex-1"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          {TABS.map((t) => {
            const isActive = tab === t.key;
            const done = tabComplete[t.key];
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-1 justify-center ${
                  isActive ? "text-white shadow-md" : "hover:bg-[var(--bg-primary)]"
                }`}
                style={
                  isActive
                    ? { background: "linear-gradient(135deg, #4F46E5, #6366F1)" }
                    : { color: "var(--text-secondary)" }
                }
              >
                {done ? (
                  <CheckCircle size={16} className={isActive ? "text-emerald-300" : "text-emerald-400"} />
                ) : (
                  <t.icon size={16} />
                )}
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.emoji}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Tab Content ---- */}
      <div className="animate-fade-in" key={tab}>
        {/* Mark as Reviewed button — shown during onboarding on incomplete tabs */}
        {isOnboarding && tab !== "activity" && !tabComplete[tab] && (
          <div
            className="mb-4 rounded-xl p-3 flex items-center justify-between"
            style={{ background: "rgba(79,70,229,0.06)", border: "1px solid rgba(79,70,229,0.15)" }}
          >
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Looks good? Mark this section as reviewed to advance your onboarding progress.
            </span>
            <button
              onClick={() => handleMarkReviewed(tab)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 shrink-0"
              style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
            >
              <Eye size={14} />
              Mark as Reviewed
            </button>
          </div>
        )}
        {tab === "profile" && agentProfile && (
          <AgentProfileTab profile={agentProfile} deployName={deployName} deployStatus={deployStatus} />
        )}
        {tab === "tools" && (
          <ToolsTab
            connectedTools={connectedTools}
            onConnect={handleConnectTool}
            onDisconnect={handleDisconnectTool}
            deploymentId={deploymentId}
          />
        )}
        {tab === "knowledge" && (
          <KnowledgeTab
            knowledge={knowledge}
            onAdd={handleAddKnowledge}
            onDelete={handleDeleteKnowledge}
            deploymentId={deploymentId}
          />
        )}
        {tab === "tasks" && (
          <ScheduledTasksManager deploymentId={deploymentId} embedded onTasksChange={handleTasksChange} />
        )}
        {tab === "approvals" && (
          <ApprovalsTab
            rules={approvalRules}
            onUpdateRules={setApprovalRules}
            connectedTools={connectedTools}
            deploymentId={deploymentId}
          />
        )}
        {tab === "activity" && (
          <ActivityTab deploymentId={deploymentId} />
        )}
        {tab === "test" && (
          <TestDriveTab
            messages={chatMessages}
            input={chatInput}
            setInput={setChatInput}
            loading={chatLoading}
            onSend={handleChat}
            chatEndRef={chatEndRef}
            deployName={deployName}
            isLive={isLive}
            hasUnsavedChanges={hasChanges}
          />
        )}
      </div>

      {/* ---- Skip link ---- */}
      <div className="text-center pb-4">
        <Link
          href="/dashboard"
          className="text-sm transition-colors hover:underline"
          style={{ color: "var(--text-muted)" }}
        >
          Skip to Dashboard →
        </Link>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab: Agent Profile                                                  */
/* ================================================================== */
function AgentProfileTab({
  profile,
  deployName,
  deployStatus,
}: {
  profile: {
    employeeId: string;
    name: string;
    role: string;
    category: string;
    description: string;
    longDescription: string;
    capabilities: string[];
    systemPrompt: string;
    customInstructions: string;
    isCustom: boolean;
  };
  deployName: string;
  deployStatus: string;
}) {
  const statusLabel: Record<string, { text: string; color: string }> = {
    active: { text: "Active", color: "#10B981" },
    paused: { text: "Paused", color: "#F59E0B" },
    configuring: { text: "Configuring", color: "#3B82F6" },
    archived: { text: "Archived", color: "#6B7280" },
  };
  const st = statusLabel[deployStatus] || statusLabel.configuring;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div
        className="rounded-2xl p-6 border"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {deployName || profile.name}
            </h3>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {profile.role} · {profile.category}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: st.color }} />
            <span className="text-xs font-medium" style={{ color: st.color }}>{st.text}</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {profile.longDescription || profile.description}
        </p>
      </div>

      {/* Capabilities */}
      {profile.capabilities.length > 0 && (
        <div
          className="rounded-2xl p-6 border"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}
        >
          <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Capabilities
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.capabilities.map((cap, i) => (
              <span
                key={i}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--primary)]/10"
                style={{ color: "var(--primary-light)" }}
              >
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* System Prompt */}
      {profile.systemPrompt && (
        <div
          className="rounded-2xl p-6 border"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}
        >
          <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            System Prompt
          </h4>
          <div
            className="rounded-xl p-4 text-sm leading-relaxed font-mono whitespace-pre-wrap"
            style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}
          >
            {profile.systemPrompt}
          </div>
        </div>
      )}

      {/* Custom Instructions */}
      {profile.customInstructions && (
        <div
          className="rounded-2xl p-6 border"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}
        >
          <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Custom Instructions
          </h4>
          <div
            className="rounded-xl p-4 text-sm leading-relaxed"
            style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}
          >
            {profile.customInstructions}
          </div>
        </div>
      )}

      {/* Info note */}
      {!profile.isCustom && (
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.2)" }}
        >
          <Sparkles size={16} className="text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            This is a pre-built agent from the marketplace. Use the other tabs to customize tools,
            knowledge, and tasks to tailor it to your business needs.
          </p>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab: Connect Tools                                                 */
/* ================================================================== */
function ToolsTab({
  connectedTools,
  onConnect,
  onDisconnect,
  deploymentId,
}: {
  connectedTools: ConnectedTool[];
  onConnect: (type: string, toolData: { name: string; fields: Record<string, string> }, addToGlobal?: boolean) => void;
  onDisconnect: (type: string) => void;
  deploymentId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [toolName, setToolName] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [addToGlobal, setAddToGlobal] = useState(false);
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);

  const [globalTools, setGlobalTools] = useState<{ id: string; toolType: string; name: string; status: string }[]>([]);
  const [toolBindings, setToolBindings] = useState<{ connectionId: string; enabled: boolean }[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(true);

  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const [intRes, bindRes] = await Promise.all([
          fetch("/api/integrations"),
          fetch(`/api/deployments/${deploymentId}/bindings`),
        ]);
        if (intRes.ok) {
          const data = await intRes.json();
          setGlobalTools(data.connections || []);
        }
        if (bindRes.ok) {
          const data = await bindRes.json();
          setToolBindings(data.toolBindings || []);
        }
      } catch {} finally { setLoadingGlobal(false); }
    };
    fetchGlobal();
  }, [deploymentId]);

  const isToolEnabled = (connId: string) => toolBindings.some(b => b.connectionId === connId && b.enabled);

  const toggleGlobalTool = async (connId: string, toolType: string, enabled: boolean) => {
    setToolBindings(prev =>
      enabled
        ? [...prev.filter(b => b.connectionId !== connId), { connectionId: connId, enabled: true }]
        : prev.filter(b => b.connectionId !== connId)
    );
    await fetch(`/api/deployments/${deploymentId}/bindings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "tool", resourceId: connId, toolType, enabled }),
    });
  };

  const selectedToolDef = AVAILABLE_TOOLS.find(t => t.type === selectedType);
  const isCustom = selectedType === "custom";

  const nameHints: Record<string, { label: string; placeholder: string }> = {
    email: { label: "Account Name", placeholder: 'e.g. "Work Gmail", "Support Inbox"' },
    crm: { label: "CRM Name", placeholder: 'e.g. "Salesforce Prod", "HubSpot"' },
    calendar: { label: "Calendar Name", placeholder: 'e.g. "Team Calendar", "Booking Calendar"' },
    api: { label: "Integration Name", placeholder: 'e.g. "Stripe Payments", "Slack Webhook"' },
    custom: { label: "Integration Name", placeholder: 'e.g. "Internal ERP", "Legacy System"' },
  };
  const nameLabel = nameHints[selectedType]?.label || "Connection Name";
  const namePlaceholder = nameHints[selectedType]?.placeholder || "Enter a name for this connection";

  const resetForm = () => {
    setSelectedType("");
    setToolName("");
    setFieldValues({});
    setAddToGlobal(false);
    setCustomFields([{ key: "", value: "" }]);
  };

  const handleSave = () => {
    if (!toolName.trim() || !selectedType) return;
    const fields: Record<string, string> = {};
    if (isCustom) {
      customFields.forEach(cf => {
        if (cf.key.trim() && cf.value.trim()) fields[cf.key.trim()] = cf.value.trim();
      });
    } else {
      Object.entries(fieldValues).forEach(([k, v]) => { if (v.trim()) fields[k] = v.trim(); });
    }
    onConnect(selectedType, { name: toolName.trim(), fields }, addToGlobal);
    resetForm();
    setShowForm(false);
  };

  const canSave = toolName.trim() && selectedType && (
    isCustom
      ? customFields.some(cf => cf.key.trim() && cf.value.trim())
      : (selectedToolDef?.fields || []).some(f => (fieldValues[f.key] || "").trim())
  );

  const inputStyle = { background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" };

  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Connect the tools your agent needs to do its job. You can always add more later.
      </p>

      {/* Connect New Tool – accordion card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:opacity-90"
        >
          <span className="flex items-center gap-2 font-semibold" style={{ color: "var(--text-primary)" }}>
            <Plus size={18} className="text-indigo-400" />
            Connect New Tool
          </span>
          {showForm ? (
            <ChevronUp size={18} style={{ color: "var(--text-secondary)" }} />
          ) : (
            <ChevronDown size={18} style={{ color: "var(--text-secondary)" }} />
          )}
        </button>

        {showForm && (
          <div className="px-5 pb-5 space-y-4 border-t pt-4" style={{ borderColor: "var(--border-primary)" }}>
            {/* Row 1: Tool type + Name */}
            <div className="flex gap-3 flex-wrap">
              <select
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setFieldValues({}); setCustomFields([{ key: "", value: "" }]); }}
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={inputStyle}
              >
                <option value="">Select tool type…</option>
                {AVAILABLE_TOOLS.map(t => (
                  <option key={t.type} value={t.type}>{t.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder={namePlaceholder}
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>

            {/* Dynamic fields based on tool type */}
            {selectedType && !isCustom && selectedToolDef && (
              <div className="space-y-3">
                {selectedToolDef.fields.map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{f.label}</label>
                    <input
                      type={f.type || "text"}
                      placeholder={f.placeholder}
                      value={fieldValues[f.key] || ""}
                      onChange={(e) => setFieldValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Custom fields for Custom Integration */}
            {isCustom && (
              <div className="space-y-3">
                <label className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Custom Fields</label>
                {customFields.map((cf, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Field name (e.g. API Key)"
                      value={cf.key}
                      onChange={(e) => {
                        const updated = [...customFields];
                        updated[i] = { ...updated[i], key: e.target.value };
                        setCustomFields(updated);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={cf.value}
                      onChange={(e) => {
                        const updated = [...customFields];
                        updated[i] = { ...updated[i], value: e.target.value };
                        setCustomFields(updated);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                      style={inputStyle}
                    />
                    {customFields.length > 1 && (
                      <button
                        onClick={() => setCustomFields(customFields.filter((_, idx) => idx !== i))}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setCustomFields([...customFields, { key: "", value: "" }])}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
                  style={{ color: "var(--primary)", background: "rgba(79,70,229,0.1)" }}
                >
                  <Plus size={14} /> Add Field
                </button>
              </div>
            )}

            {/* Also add to global */}
            <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--text-secondary)" }}>
              <input type="checkbox" checked={addToGlobal} onChange={(e) => setAddToGlobal(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-indigo-500" />
              Also add to global Integrations
            </label>

            {/* Save / Cancel */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40"
                style={{ background: "var(--accent-primary)" }}
              >
                Save Connection
              </button>
              <button
                onClick={() => { resetForm(); setShowForm(false); }}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global Integrations section */}
      {!loadingGlobal && globalTools.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Plug size={12} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              From Integrations
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              · {toolBindings.filter(b => b.enabled).length}/{globalTools.length} enabled
            </span>
          </div>
          <div
            className="rounded-xl overflow-hidden divide-y"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderColor: "var(--border-primary)" }}
          >
            {globalTools.map((gt) => {
              const enabled = isToolEnabled(gt.id);
              const ToolIcon = AVAILABLE_TOOLS.find(t => t.type === gt.toolType)?.icon || Globe;
              return (
                <div key={gt.id} className="flex items-center gap-3 px-4 py-3 group">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: enabled ? "rgba(16,185,129,0.15)" : "var(--bg-primary)" }}
                  >
                    <ToolIcon size={16} style={{ color: enabled ? "#10B981" : "var(--text-muted)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{gt.name}</span>
                    <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>{gt.toolType}</span>
                  </div>
                  <button
                    onClick={() => toggleGlobalTool(gt.id, gt.toolType, !enabled)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? "bg-emerald-500" : "bg-gray-600"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agent-specific connected tools */}
      {connectedTools.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Settings size={12} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Agent-Only Tools
            </span>
          </div>
          <div className="space-y-2">
            {connectedTools.map((ct) => {
              const tool = AVAILABLE_TOOLS.find((t) => t.type === ct.type);
              const ToolIcon = tool?.icon || Settings;
              return (
                <div
                  key={ct.name + ct.type}
                  className="rounded-xl p-4 flex items-center gap-3 group transition-all duration-200"
                  style={{ background: "var(--bg-card)", border: "1px solid rgba(16,185,129,0.4)" }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.15)" }}>
                    <ToolIcon size={20} style={{ color: "#10B981" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{ct.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                        {tool?.name || ct.type}
                      </span>
                      {ct.note && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                          {ct.note}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{tool?.desc || "Custom integration"}</p>
                  </div>
                  <button
                    onClick={() => onDisconnect(ct.type)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab: Approvals & Policies                                          */
/* ==================================================================*/
function ApprovalsTab({
  rules,
  onUpdateRules,
}: {
  rules: ApprovalRule[];
  onUpdateRules: (rules: ApprovalRule[]) => void;
  connectedTools: ConnectedTool[];
  deploymentId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [formLabel, setFormLabel] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Derive unique categories from existing rules
  const categories = Array.from(new Set(rules.map(r => r.category))).sort();
  const enabledCount = rules.filter(r => r.enabled).length;
  const filteredRules = filterCategory ? rules.filter(r => r.category === filterCategory) : rules;

  // Group rules by category
  const grouped: Record<string, ApprovalRule[]> = {};
  for (const r of filteredRules) {
    (grouped[r.category] ??= []).push(r);
  }
  const sortedGroups = Object.keys(grouped).sort();

  const toggleRule = (id: string) => {
    onUpdateRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteRule = (id: string) => {
    onUpdateRules(rules.filter(r => r.id !== id));
  };

  const addRule = () => {
    if (!formLabel.trim() || !formCategory.trim()) return;
    const newRule: ApprovalRule = {
      id: `rule-${Date.now()}`,
      category: formCategory.trim(),
      label: formLabel.trim(),
      description: formDesc.trim() || undefined,
      enabled: true,
    };
    onUpdateRules([...rules, newRule]);
    setFormLabel("");
    setFormDesc("");
    setFormCategory("");
    setShowForm(false);
  };

  const selectCategory = (cat: string) => {
    setFormCategory(cat);
    setShowCategoryDropdown(false);
    setNewCategoryInput("");
  };

  const addNewCategory = () => {
    if (!newCategoryInput.trim()) return;
    setFormCategory(newCategoryInput.trim());
    setShowCategoryDropdown(false);
    setNewCategoryInput("");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Define when your agent needs your approval before acting. Organize rules into categories that make sense for your workflow.
        </p>
      </div>

      {/* Category filter pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory(null)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            style={{
              background: !filterCategory ? "var(--accent-primary)" : "var(--bg-tertiary)",
              color: !filterCategory ? "#fff" : "var(--text-secondary)",
            }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: filterCategory === cat ? "var(--accent-primary)" : "var(--bg-tertiary)",
                color: filterCategory === cat ? "#fff" : "var(--text-secondary)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Add Rule – accordion card (matches Tasks tab style) */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:opacity-90"
        >
          <span className="flex items-center gap-2 font-semibold" style={{ color: "var(--text-primary)" }}>
            <Plus size={18} className="text-indigo-400" />
            Create New Rule
          </span>
          {showForm ? (
            <ChevronUp size={18} style={{ color: "var(--text-secondary)" }} />
          ) : (
            <ChevronDown size={18} style={{ color: "var(--text-secondary)" }} />
          )}
        </button>

        {showForm && (
          <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
            {/* Category selector */}
            <div className="relative pt-4">
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Category</label>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left"
                style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", color: formCategory ? "var(--text-primary)" : "var(--text-muted)" }}
              >
                {formCategory || "Select or create a category..."}
                <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
              </button>
              {showCategoryDropdown && (
                <div
                  className="absolute z-20 mt-1 w-full rounded-lg shadow-xl overflow-hidden"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
                >
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => selectCategory(cat)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <Tag size={12} style={{ color: "var(--text-muted)" }} />
                      {cat}
                    </button>
                  ))}
                  <div className="border-t" style={{ borderColor: "var(--border-primary)" }}>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <input
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addNewCategory()}
                        placeholder="New category name..."
                        className="flex-1 text-sm bg-transparent outline-none"
                        style={{ color: "var(--text-primary)" }}
                        autoFocus
                      />
                      <button
                        onClick={addNewCategory}
                        disabled={!newCategoryInput.trim()}
                        className="text-xs font-medium px-2 py-1 rounded transition-colors disabled:opacity-30"
                        style={{ color: "var(--accent-primary)" }}
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rule name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Rule *</label>
              <input
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="e.g., Approve invoices over $500"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Description (optional)</label>
              <input
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="When should this rule trigger?"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={addRule}
                disabled={!formLabel.trim() || !formCategory.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40"
                style={{ background: "var(--accent-primary)" }}
              >
                Add Rule
              </button>
              <button
                onClick={() => { setShowForm(false); setFormLabel(""); setFormDesc(""); setFormCategory(""); }}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rules grouped by category */}
      {sortedGroups.length > 0 ? (
        sortedGroups.map(cat => (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-2">
              <Tag size={12} style={{ color: "var(--text-muted)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                {cat}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                · {grouped[cat].filter(r => r.enabled).length}/{grouped[cat].length} active
              </span>
            </div>
            <div
              className="rounded-xl overflow-hidden divide-y"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderColor: "var(--border-primary)" }}
            >
              {grouped[cat].map(rule => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between py-2.5 px-4 group"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <span className="text-sm block" style={{ color: "var(--text-primary)" }}>
                      {rule.label}
                    </span>
                    {rule.description && (
                      <span className="text-xs block mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {rule.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all"
                      title="Remove rule"
                    >
                      <Trash2 size={13} style={{ color: "var(--text-muted)" }} />
                    </button>
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className="w-10 h-5 rounded-full transition-all duration-200 relative flex-shrink-0"
                      style={{ background: rule.enabled ? "#F59E0B" : "var(--bg-tertiary)" }}
                    >
                      <div
                        className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all duration-200 shadow-sm"
                        style={{ left: rule.enabled ? "22px" : "2px" }}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: "var(--bg-card)", border: "1px dashed var(--border-primary)" }}
        >
          <ShieldCheck size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>No approval rules yet</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Add rules to control when the agent needs your approval before acting.
          </p>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab: Company Knowledge                                             */
/* ================================================================== */
function KnowledgeTab({
  knowledge,
  onAdd,
  onDelete,
  deploymentId,
}: {
  knowledge: KnowledgeEntry[];
  onAdd: (entry: KnowledgeEntry, addToGlobal?: boolean) => void;
  onDelete: (id: string) => void;
  deploymentId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [addToGlobal, setAddToGlobal] = useState(false);

  // Form state
  const [format, setFormat] = useState<"text" | "file" | "url" | "qa">("text");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("FAQs");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [qaPairs, setQaPairs] = useState<{ question: string; answer: string }[]>([{ question: "", answer: "" }]);

  // User-defined categories
  const existingCategories = Array.from(new Set([
    ...DEFAULT_KNOWLEDGE_CATEGORIES,
    ...knowledge.map(k => k.category),
  ]));
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const allCategories = Array.from(new Set([...existingCategories, ...customCategories]));
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [globalKnowledge, setGlobalKnowledge] = useState<{ id: string; title: string; content: string; category: string }[]>([]);
  const [knowledgeBindings, setKnowledgeBindings] = useState<{ knowledgeId: string; enabled: boolean }[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(true);

  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const [kRes, bindRes] = await Promise.all([
          fetch("/api/knowledge"),
          fetch(`/api/deployments/${deploymentId}/bindings`),
        ]);
        if (kRes.ok) {
          const data = await kRes.json();
          setGlobalKnowledge(data.entries || []);
        }
        if (bindRes.ok) {
          const data = await bindRes.json();
          setKnowledgeBindings(data.knowledgeBindings || []);
        }
      } catch {} finally { setLoadingGlobal(false); }
    };
    fetchGlobal();
  }, [deploymentId]);

  const isKnowledgeEnabled = (kid: string) => knowledgeBindings.some(b => b.knowledgeId === kid && b.enabled);

  const toggleGlobalKnowledge = async (kid: string, enabled: boolean) => {
    setKnowledgeBindings(prev =>
      enabled
        ? [...prev.filter(b => b.knowledgeId !== kid), { knowledgeId: kid, enabled: true }]
        : prev.filter(b => b.knowledgeId !== kid)
    );
    await fetch(`/api/deployments/${deploymentId}/bindings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "knowledge", resourceId: kid, enabled }),
    });
  };

  const resetForm = () => {
    setFormat("text");
    setTitle("");
    setCategory("FAQs");
    setContent("");
    setUrl("");
    setFileName("");
    setQaPairs([{ question: "", answer: "" }]);
    setAddToGlobal(false);
    setShowNewCategory(false);
    setNewCategoryName("");
  };

  const handleSave = () => {
    if (!title.trim()) return;

    let entryContent = "";
    let entryUrl: string | undefined;
    let entryFileName: string | undefined;
    let entryQaPairs: { question: string; answer: string }[] | undefined;

    if (format === "text") {
      if (!content.trim()) return;
      entryContent = content.trim();
    } else if (format === "url") {
      if (!url.trim()) return;
      entryContent = `Source: ${url.trim()}`;
      entryUrl = url.trim();
    } else if (format === "file") {
      if (!fileName.trim()) return;
      entryContent = `File: ${fileName.trim()}`;
      entryFileName = fileName.trim();
    } else if (format === "qa") {
      const validPairs = qaPairs.filter(p => p.question.trim() && p.answer.trim());
      if (validPairs.length === 0) return;
      entryContent = validPairs.map(p => `Q: ${p.question}\nA: ${p.answer}`).join("\n\n");
      entryQaPairs = validPairs;
    }

    const entry: KnowledgeEntry = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content: entryContent,
      category,
      format,
      ...(entryUrl && { url: entryUrl }),
      ...(entryFileName && { fileName: entryFileName }),
      ...(entryQaPairs && { qaPairs: entryQaPairs }),
    };

    onAdd(entry, addToGlobal);
    resetForm();
    setShowForm(false);
  };

  const canSave = title.trim() && (
    (format === "text" && content.trim()) ||
    (format === "url" && url.trim()) ||
    (format === "file" && fileName.trim()) ||
    (format === "qa" && qaPairs.some(p => p.question.trim() && p.answer.trim()))
  );

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (name && !allCategories.includes(name)) {
      setCustomCategories(prev => [...prev, name]);
      setCategory(name);
    }
    setNewCategoryName("");
    setShowNewCategory(false);
  };

  const inputStyle = { background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" };

  const formatOptions: { key: typeof format; label: string; icon: React.ReactNode }[] = [
    { key: "text", label: "Text", icon: <FileText size={14} /> },
    { key: "file", label: "File Upload", icon: <Upload size={14} /> },
    { key: "url", label: "URL / Web Link", icon: <Link2 size={14} /> },
    { key: "qa", label: "Q&A Pairs", icon: <MessageSquare size={14} /> },
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Add company knowledge so your agent can give accurate, on-brand answers.
      </p>

      {/* Add Knowledge – accordion card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:opacity-90"
        >
          <span className="flex items-center gap-2 font-semibold" style={{ color: "var(--text-primary)" }}>
            <Plus size={18} className="text-indigo-400" />
            Add Knowledge Entry
          </span>
          {showForm ? (
            <ChevronUp size={18} style={{ color: "var(--text-secondary)" }} />
          ) : (
            <ChevronDown size={18} style={{ color: "var(--text-secondary)" }} />
          )}
        </button>

        {showForm && (
          <div className="px-5 pb-5 space-y-4 border-t pt-4" style={{ borderColor: "var(--border-primary)" }}>

            {/* Format selector — pill buttons */}
            <div className="flex gap-2 flex-wrap">
              {formatOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setFormat(opt.key)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: format === opt.key ? "rgba(79,70,229,0.15)" : "var(--bg-tertiary)",
                    color: format === opt.key ? "var(--primary)" : "var(--text-secondary)",
                    border: `1px solid ${format === opt.key ? "rgba(99,102,241,0.3)" : "var(--border-primary)"}`,
                  }}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>

            {/* Row: Category + Title */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                {!showNewCategory ? (
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === "__new__") { setShowNewCategory(true); }
                      else setCategory(e.target.value);
                    }}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  >
                    {allCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__new__">+ New Category…</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="New category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }}
                      className="px-3 py-2 rounded-lg text-sm outline-none w-40"
                      style={inputStyle}
                      autoFocus
                    />
                    <button onClick={addCategory} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--primary)" }}>
                      <Check size={16} />
                    </button>
                    <button onClick={() => { setShowNewCategory(false); setNewCategoryName(""); }} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}>
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder="Title (e.g. Return Policy, Onboarding Checklist)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>

            {/* Format-specific fields */}
            {format === "text" && (
              <textarea
                placeholder="Paste your FAQ answer, policy text, product description, etc."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={inputStyle}
              />
            )}

            {format === "url" && (
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="https://docs.yourcompany.com/help-center"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputStyle}
                />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  The agent will reference content from this URL when answering questions.
                </p>
              </div>
            )}

            {format === "file" && (
              <div className="space-y-2">
                <div
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:opacity-80"
                  style={{ borderColor: "var(--border-primary)", background: "var(--bg-tertiary)" }}
                  onClick={() => {
                    const name = prompt("Enter file name (e.g. handbook.pdf):");
                    if (name) setFileName(name);
                  }}
                >
                  <Upload size={24} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                  {fileName ? (
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{fileName}</p>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Click to upload — PDF, DOCX, CSV, TXT, XLSX
                    </p>
                  )}
                </div>
              </div>
            )}

            {format === "qa" && (
              <div className="space-y-3">
                {qaPairs.map((pair, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder={`Question ${idx + 1} (e.g. "What is your return policy?")`}
                        value={pair.question}
                        onChange={(e) => {
                          const updated = [...qaPairs];
                          updated[idx] = { ...updated[idx], question: e.target.value };
                          setQaPairs(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={inputStyle}
                      />
                      <textarea
                        placeholder="Answer"
                        value={pair.answer}
                        onChange={(e) => {
                          const updated = [...qaPairs];
                          updated[idx] = { ...updated[idx], answer: e.target.value };
                          setQaPairs(updated);
                        }}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                        style={inputStyle}
                      />
                    </div>
                    {qaPairs.length > 1 && (
                      <button
                        onClick={() => setQaPairs(qaPairs.filter((_, i) => i !== idx))}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 mt-2"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setQaPairs([...qaPairs, { question: "", answer: "" }])}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
                  style={{ color: "var(--primary)", background: "rgba(79,70,229,0.1)" }}
                >
                  <Plus size={14} /> Add Q&A Pair
                </button>
              </div>
            )}

            {/* Also add to global */}
            <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--text-secondary)" }}>
              <input type="checkbox" checked={addToGlobal} onChange={(e) => setAddToGlobal(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-indigo-500" />
              Also add to global Knowledge Library
            </label>

            {/* Save / Cancel */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40"
                style={{ background: "var(--accent-primary)" }}
              >
                Add Entry
              </button>
              <button
                onClick={() => { resetForm(); setShowForm(false); }}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global Knowledge Library section */}
      {!loadingGlobal && globalKnowledge.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={12} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              From Knowledge Library
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              · {knowledgeBindings.filter(b => b.enabled).length}/{globalKnowledge.length} enabled
            </span>
          </div>
          <div
            className="rounded-xl overflow-hidden divide-y"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderColor: "var(--border-primary)" }}
          >
            {globalKnowledge.map((gk) => {
              const enabled = isKnowledgeEnabled(gk.id);
              return (
                <div key={gk.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: enabled ? "rgba(79,70,229,0.15)" : "var(--bg-primary)" }}
                  >
                    <BookOpen size={16} style={{ color: enabled ? "#6366F1" : "var(--text-muted)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{gk.title}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(79,70,229,0.1)", color: "var(--primary)" }}>
                        {gk.category}
                      </span>
                    </div>
                    <p className="text-xs line-clamp-1 mt-0.5" style={{ color: "var(--text-muted)" }}>{gk.content}</p>
                  </div>
                  <button
                    onClick={() => toggleGlobalKnowledge(gk.id, !enabled)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? "bg-indigo-500" : "bg-gray-600"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agent-specific knowledge entries */}
      {knowledge.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText size={12} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Agent-Only Knowledge
            </span>
          </div>
          <div className="space-y-2">
            {knowledge.map((entry) => {
              const formatIcon = entry.format === "url" ? <Link2 size={12} /> : entry.format === "file" ? <Upload size={12} /> : entry.format === "qa" ? <MessageSquare size={12} /> : <FileText size={12} />;
              const formatLabel = entry.format === "url" ? "URL" : entry.format === "file" ? "File" : entry.format === "qa" ? "Q&A" : "Text";
              return (
                <div
                  key={entry.id}
                  className="rounded-xl p-4 flex items-start gap-3 group transition-all duration-200"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(79,70,229,0.15)", color: "var(--primary)" }}>
                        {entry.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                        {formatIcon} {formatLabel}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{entry.title}</span>
                    </div>
                    <p className="text-xs line-clamp-2" style={{ color: "var(--text-muted)" }}>{entry.content}</p>
                  </div>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab: Tasks & Schedule                                              */
/* ================================================================== */
function TasksTab({
  tasks,
  taskForm,
  setTaskForm,
  onAddTask,
  onDeleteTask,
  expectations,
  setExpectations,
  onSaveExpectations,
  schedule,
  onSetSchedule,
}: {
  tasks: TaskEntry[];
  taskForm: { text: string; priority: "High" | "Medium" | "Low" };
  setTaskForm: (v: { text: string; priority: "High" | "Medium" | "Low" }) => void;
  onAddTask: () => void;
  onDeleteTask: (id: string) => void;
  expectations: Expectations;
  setExpectations: (v: Expectations) => void;
  onSaveExpectations: () => void;
  schedule: string;
  onSetSchedule: (opt: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Operating Schedule */}
      <div
        className="rounded-xl p-5 space-y-3"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Operating Schedule
        </h3>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Define when this employee should be active and working.
        </p>
        <div className="flex flex-wrap gap-2">
          {["24/7 Always On", "Business Hours (9am-5pm)", "Extended Hours (7am-10pm)", "Custom"].map((opt) => (
            <button
              key={opt}
              onClick={() => onSetSchedule(opt)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                schedule === opt ? "text-white shadow-md" : ""
              }`}
              style={
                schedule === opt
                  ? { background: "linear-gradient(135deg, #4F46E5, #6366F1)" }
                  : { background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }
              }
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Add task */}
      <div
        className="rounded-xl p-5 space-y-3"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Key Tasks
        </h3>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Define what this agent should handle day-to-day.
        </p>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="e.g. Respond to support tickets within 5 minutes"
            value={taskForm.text}
            onChange={(e) => setTaskForm({ ...taskForm, text: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onAddTask()}
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
          />
          <select
            value={taskForm.priority}
            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as "High" | "Medium" | "Low" })}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button
            onClick={onAddTask}
            disabled={!taskForm.text.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
          >
            <Plus size={15} /> Add
          </button>
        </div>
        {tasks.length > 0 && (
          <div className="space-y-2 mt-3">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg group"
                style={{ background: "var(--bg-primary)" }}
              >
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PRIORITY_COLORS[t.priority]}`}>
                  {t.priority}
                </span>
                <span className="flex-1 text-sm" style={{ color: "var(--text-primary)" }}>
                  {t.text}
                </span>
                <button
                  onClick={() => onDeleteTask(t.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all hover:bg-red-500/10"
                >
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expectations */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Expectations
        </h3>

        {/* Tone */}
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>
            Response Tone
          </label>
          <div className="flex gap-2">
            {["Professional", "Friendly", "Casual"].map((tone) => (
              <button
                key={tone}
                onClick={() => setExpectations({ ...expectations, tone })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  expectations.tone === tone ? "text-white shadow-md" : ""
                }`}
                style={
                  expectations.tone === tone
                    ? { background: "linear-gradient(135deg, #4F46E5, #6366F1)" }
                    : { background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }
                }
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>
            Quality Standards
          </label>
          <textarea
            placeholder="e.g. Always verify customer identity before sharing account info..."
            value={expectations.qualityStandards}
            onChange={(e) => setExpectations({ ...expectations, qualityStandards: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Escalation */}
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>
            Escalation Rules
          </label>
          <textarea
            placeholder="e.g. Escalate to a human if the customer asks for a refund over $500..."
            value={expectations.escalationRules}
            onChange={(e) => setExpectations({ ...expectations, escalationRules: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <button
          onClick={onSaveExpectations}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
        >
          <Check size={15} /> Save Expectations
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab: Test Drive                                                    */
/* ================================================================== */
function TestDriveTab({
  messages,
  input,
  setInput,
  loading,
  onSend,
  chatEndRef,
  deployName,
  isLive,
  hasUnsavedChanges,
}: {
  messages: ChatMsg[];
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  onSend: (msg?: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  deployName: string;
  isLive: boolean;
  hasUnsavedChanges: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Context-aware banner */}
      {!isLive ? (
        <div
          className="rounded-xl px-4 py-3 flex items-start gap-3 text-sm"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
        >
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <span style={{ color: "var(--text-secondary)" }}>
            This is a <strong style={{ color: "var(--text-primary)" }}>test conversation</strong>. Your agent is not live
            yet — complete onboarding to deploy it.
          </span>
        </div>
      ) : hasUnsavedChanges ? (
        <div
          className="rounded-xl px-4 py-3 flex items-start gap-3 text-sm"
          style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)" }}
        >
          <FlaskConical size={18} className="text-indigo-400 shrink-0 mt-0.5" />
          <span style={{ color: "var(--text-secondary)" }}>
            <strong style={{ color: "var(--text-primary)" }}>Sandbox mode</strong> — You have unsaved config changes.
            This test uses your <em>draft configuration</em> and does not affect the live agent&apos;s operations.
            Save &amp; Apply to push changes to production.
          </span>
        </div>
      ) : (
        <div
          className="rounded-xl px-4 py-3 flex items-start gap-3 text-sm"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}
        >
          <FlaskConical size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <span style={{ color: "var(--text-secondary)" }}>
            <strong style={{ color: "var(--text-primary)" }}>Test conversation</strong> — Chat with your live agent to
            verify its behavior. This is a sandboxed session and won&apos;t affect real operations or metrics.
          </span>
        </div>
      )}

      {/* Chat area */}
      <div
        className="rounded-xl overflow-hidden flex flex-col"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", height: "420px" }}
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <FlaskConical size={32} style={{ color: "var(--text-muted)" }} className="mb-3" />
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                Test drive {deployName}
              </p>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Send a message or try one of the suggestions below.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => onSend(p)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                    style={{
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? {
                        background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                        color: "#fff",
                        borderBottomRightRadius: "6px",
                      }
                    : {
                        background: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-primary)",
                        borderBottomLeftRadius: "6px",
                      }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-2xl text-sm"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)" }}
              >
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && onSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={() => onSend()}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab: Activity Log                                                   */
/* ================================================================== */
function ActivityTab({ deploymentId }: { deploymentId: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/deployments/${deploymentId}/agent-activity?limit=50`);
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
          setSummary(data.summary || null);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [deploymentId]);

  const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
    chat: { icon: "💬", color: "#6366F1", label: "Chat" },
    tool_call: { icon: "🔧", color: "#F59E0B", label: "Tool Call" },
    task_complete: { icon: "✅", color: "#10B981", label: "Task" },
    status_change: { icon: "🔄", color: "#3B82F6", label: "Status" },
    config_change: { icon: "⚙️", color: "#8B5CF6", label: "Config" },
    onboarding: { icon: "🚀", color: "#EC4899", label: "Onboarding" },
    error: { icon: "❌", color: "#EF4444", label: "Error" },
  };

  const filteredActivities = filter === "all" ? activities : activities.filter((a) => a.type === filter);
  const filterTypes = ["all", ...new Set(activities.map((a: any) => a.type).filter(Boolean))];

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr + (dateStr.includes("Z") ? "" : "Z")).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  if (loading) return <div className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>Loading activity...</div>;

  if (activities.length === 0) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
        <ClipboardList size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No activity yet</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Activity will appear here as your AI employee performs tasks, handles requests, and interacts with tools.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      {summary && summary.totalOperations > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Chat Interactions", value: summary.chatInteractions, color: "#6366F1", icon: "💬" },
            { label: "Tool Calls", value: summary.toolCalls, color: "#F59E0B", icon: "🔧" },
            { label: "Tasks Completed", value: summary.tasksCompleted, color: "#10B981", icon: "✅" },
            { label: "Errors", value: summary.errors, color: summary.errors > 0 ? "#EF4444" : "#6B7280", icon: "⚠️" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl px-4 py-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{stat.icon}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</span>
              </div>
              <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          What this agent has been doing — tasks, tool calls, and operational events.
        </p>
        <div className="flex gap-1 flex-wrap">
          {filterTypes.map((t) => {
            const cfg = typeConfig[t] || { label: t, color: "#6B7280" };
            const isActive = filter === t;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${isActive ? "text-white" : ""}`}
                style={isActive
                  ? { background: t === "all" ? "var(--text-secondary)" : cfg.color }
                  : { background: "var(--bg-primary)", color: "var(--text-muted)" }
                }
              >
                {t === "all" ? `All (${activities.length})` : `${cfg.label} (${activities.filter((a: any) => a.type === t).length})`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {filteredActivities.map((a: any, i: number) => {
          const cfg = typeConfig[a.type] || { icon: "📋", color: "#6B7280", label: a.type };
          const isError = a.status === "error" || a.type === "error";
          return (
            <div
              key={a.id || i}
              className="flex items-start gap-3 px-4 py-3 rounded-xl transition-colors hover:brightness-95"
              style={{ background: "var(--bg-card)", border: `1px solid ${isError ? "rgba(239,68,68,0.3)" : "var(--border-primary)"}` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5"
                style={{ background: `${cfg.color}18` }}
              >
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {a.title || "Activity"}
                  </p>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: `${cfg.color}18`, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                  {isError && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-500/10 text-red-500">
                      Error
                    </span>
                  )}
                </div>
                {a.description && (
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                    {a.description}
                  </p>
                )}
              </div>
              <span className="text-xs shrink-0 whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                {a.createdAt ? timeAgo(a.createdAt) : ""}
              </span>
            </div>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="rounded-xl p-6 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No {filter} activity found.</p>
        </div>
      )}
    </div>
  );
}
