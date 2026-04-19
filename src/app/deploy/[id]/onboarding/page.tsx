"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter, useParams } from "next/navigation";
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
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ConnectedTool {
  name: string;
  type: string;
  apiKey: string;
  status: "connected";
}
interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
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
  { key: "tools", label: "Connect Tools", icon: Plug, emoji: "🔌" },
  { key: "knowledge", label: "Company Knowledge", icon: BookOpen, emoji: "📚" },
  { key: "tasks", label: "Tasks & Expectations", icon: ClipboardList, emoji: "📋" },
  { key: "test", label: "Test Drive", icon: FlaskConical, emoji: "🧪" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const AVAILABLE_TOOLS = [
  { type: "email", name: "Email", desc: "Send & receive emails on behalf of your agent", icon: Mail },
  { type: "crm", name: "CRM", desc: "Access customer relationship data", icon: Database },
  { type: "calendar", name: "Calendar", desc: "Schedule meetings & manage availability", icon: Calendar },
  { type: "api", name: "API / Webhooks", desc: "Connect to external services via API", icon: Globe },
];

const KNOWLEDGE_CATEGORIES = ["Company Policies", "Product Info", "FAQs", "Processes"];

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

  const [tab, setTab] = useState<TabKey>("tools");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deployName, setDeployName] = useState("");
  const [schedule, setSchedule] = useState("");
  const [deployStatus, setDeployStatus] = useState("");

  // Onboarding state
  const [connectedTools, setConnectedTools] = useState<ConnectedTool[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [tasks, setTasks] = useState<TaskEntry[]>([]);
  const [expectations, setExpectations] = useState<Expectations>({
    tone: "Professional",
    qualityStandards: "",
    escalationRules: "",
  });

  // Tool connection form
  const [connectingTool, setConnectingTool] = useState<string | null>(null);
  const [toolForm, setToolForm] = useState({ name: "", apiKey: "" });

  // Knowledge form
  const [knowledgeForm, setKnowledgeForm] = useState({ title: "", content: "", category: "FAQs" });

  // Task form
  const [taskForm, setTaskForm] = useState({ text: "", priority: "Medium" as "High" | "Medium" | "Low" });

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
        const ob = data.onboarding as OnboardingData;
        if (ob) {
          setConnectedTools(ob.connectedTools || []);
          setKnowledge(ob.knowledge || []);
          setTasks(ob.tasks || []);
          if (ob.expectations) setExpectations(ob.expectations);
        }
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
    tools: connectedTools.length > 0,
    knowledge: knowledge.length > 0,
    tasks: tasks.length > 0 && expectations.tone !== "",
    test: chatMessages.length >= 2,
  };
  const completedCount = Object.values(tabComplete).filter(Boolean).length;

  /* ---- Handlers ---- */
  const handleConnectTool = async (toolType: string) => {
    if (!toolForm.name.trim() || !toolForm.apiKey.trim()) return;
    const newTool: ConnectedTool = {
      name: toolForm.name.trim(),
      type: toolType,
      apiKey: toolForm.apiKey.trim(),
      status: "connected",
    };
    const updated = [...connectedTools, newTool];
    setConnectedTools(updated);
    setConnectingTool(null);
    setToolForm({ name: "", apiKey: "" });
    await saveOnboarding({ connectedTools: updated });
  };

  const handleDisconnectTool = async (toolType: string) => {
    const updated = connectedTools.filter((t) => t.type !== toolType);
    setConnectedTools(updated);
    await saveOnboarding({ connectedTools: updated });
  };

  const handleAddKnowledge = async () => {
    if (!knowledgeForm.title.trim() || !knowledgeForm.content.trim()) return;
    const entry: KnowledgeEntry = {
      id: crypto.randomUUID(),
      title: knowledgeForm.title.trim(),
      content: knowledgeForm.content.trim(),
      category: knowledgeForm.category,
    };
    const updated = [...knowledge, entry];
    setKnowledge(updated);
    setKnowledgeForm({ title: "", content: "", category: "FAQs" });
    await saveOnboarding({ knowledge: updated });
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
        body: JSON.stringify({ message: msg }),
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
      router.push("/dashboard");
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
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* ---- Header ---- */}
      <div>
        <div className="flex items-center gap-2 text-sm mb-3" style={{ color: "var(--text-muted)" }}>
          <Link href="/deploy" className="hover:text-[var(--text-secondary)] transition-colors">
            Deployments
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-primary)" }}>Onboarding</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}
          >
            <GraduationCap size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Onboard: {deployName}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Train your AI employee before it goes live. Complete each section at your own pace.
            </p>
          </div>
        </div>
      </div>

      {/* ---- Progress bar ---- */}
      <div
        className="rounded-xl p-4 flex items-center gap-4 flex-wrap"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
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
      </div>

      {/* ---- Tab Navigation ---- */}
      <div
        className="flex gap-1 p-1 rounded-xl overflow-x-auto"
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

      {/* ---- Tab Content ---- */}
      <div className="animate-fade-in" key={tab}>
        {tab === "tools" && (
          <ToolsTab
            connectedTools={connectedTools}
            connectingTool={connectingTool}
            setConnectingTool={setConnectingTool}
            toolForm={toolForm}
            setToolForm={setToolForm}
            onConnect={handleConnectTool}
            onDisconnect={handleDisconnectTool}
          />
        )}
        {tab === "knowledge" && (
          <KnowledgeTab
            knowledge={knowledge}
            form={knowledgeForm}
            setForm={setKnowledgeForm}
            onAdd={handleAddKnowledge}
            onDelete={handleDeleteKnowledge}
          />
        )}
        {tab === "tasks" && (
          <TasksTab
            tasks={tasks}
            taskForm={taskForm}
            setTaskForm={setTaskForm}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            expectations={expectations}
            setExpectations={setExpectations}
            onSaveExpectations={handleSaveExpectations}
            schedule={schedule}
          />
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
/*  Tab: Connect Tools                                                 */
/* ================================================================== */
function ToolsTab({
  connectedTools,
  connectingTool,
  setConnectingTool,
  toolForm,
  setToolForm,
  onConnect,
  onDisconnect,
}: {
  connectedTools: ConnectedTool[];
  connectingTool: string | null;
  setConnectingTool: (v: string | null) => void;
  toolForm: { name: string; apiKey: string };
  setToolForm: (v: { name: string; apiKey: string }) => void;
  onConnect: (type: string) => void;
  onDisconnect: (type: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Connect the tools your agent needs to do its job. You can always add more later.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {AVAILABLE_TOOLS.map((tool) => {
          const connected = connectedTools.find((c) => c.type === tool.type);
          const isConnecting = connectingTool === tool.type;
          return (
            <div
              key={tool.type}
              className="rounded-xl p-5 transition-all duration-200"
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${connected ? "rgba(16,185,129,0.4)" : "var(--border-primary)"}`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: connected ? "rgba(16,185,129,0.15)" : "var(--bg-primary)" }}
                >
                  <tool.icon size={20} style={{ color: connected ? "#10B981" : "var(--text-secondary)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {tool.name}
                    </span>
                    {connected && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {tool.desc}
                  </p>
                </div>
              </div>

              {/* Connection form */}
              {isConnecting && !connected && (
                <div className="mt-4 space-y-3 pt-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
                  <input
                    type="text"
                    placeholder="Connection name"
                    value={toolForm.name}
                    onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
                    style={{
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <input
                    type="text"
                    placeholder={tool.type === "api" ? "Webhook URL" : "API Key"}
                    value={toolForm.apiKey}
                    onChange={(e) => setToolForm({ ...toolForm, apiKey: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
                    style={{
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => onConnect(tool.type)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                      style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
                    >
                      Save Connection
                    </button>
                    <button
                      onClick={() => {
                        setConnectingTool(null);
                        setToolForm({ name: "", apiKey: "" });
                      }}
                      className="px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{ color: "var(--text-muted)", background: "var(--bg-primary)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Action button */}
              {!isConnecting && (
                <div className="mt-3">
                  {connected ? (
                    <button
                      onClick={() => onDisconnect(tool.type)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-red-500/10 text-red-400"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setConnectingTool(tool.type);
                        setToolForm({ name: "", apiKey: "" });
                      }}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
                      style={{ color: "var(--primary)", background: "rgba(79,70,229,0.1)" }}
                    >
                      <Plus size={14} /> Connect
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab: Company Knowledge                                             */
/* ================================================================== */
function KnowledgeTab({
  knowledge,
  form,
  setForm,
  onAdd,
  onDelete,
}: {
  knowledge: KnowledgeEntry[];
  form: { title: string; content: string; category: string };
  setForm: (v: { title: string; content: string; category: string }) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Add company knowledge so your agent can give accurate, on-brand answers.
      </p>

      {/* Add form */}
      <div
        className="rounded-xl p-5 space-y-3"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Add Knowledge Entry
        </h3>
        <div className="flex gap-3 flex-wrap">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
          >
            {KNOWLEDGE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Title (e.g. Return Policy)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <textarea
          placeholder="Content — paste your FAQ answer, policy text, product description, etc."
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-primary)",
            color: "var(--text-primary)",
          }}
        />
        <button
          onClick={onAdd}
          disabled={!form.title.trim() || !form.content.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
        >
          <Plus size={15} /> Add Entry
        </button>
      </div>

      {/* Entries list */}
      {knowledge.length > 0 && (
        <div className="space-y-2">
          {knowledge.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl p-4 flex items-start gap-3 group transition-all duration-200"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "rgba(79,70,229,0.15)", color: "var(--primary)" }}
                  >
                    {entry.category}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {entry.title}
                  </span>
                </div>
                <p className="text-xs line-clamp-2" style={{ color: "var(--text-muted)" }}>
                  {entry.content}
                </p>
              </div>
              <button
                onClick={() => onDelete(entry.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-500/10"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab: Tasks & Expectations                                          */
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
}) {
  return (
    <div className="space-y-5">
      {/* Working hours reminder */}
      {schedule && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3 text-sm"
          style={{ background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.2)", color: "var(--text-secondary)" }}
        >
          <Calendar size={16} style={{ color: "var(--primary)" }} />
          <span>
            Working hours: <strong style={{ color: "var(--text-primary)" }}>{schedule}</strong>
          </span>
        </div>
      )}

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
}: {
  messages: ChatMsg[];
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  onSend: (msg?: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  deployName: string;
}) {
  return (
    <div className="space-y-4">
      {/* Banner */}
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3 text-sm"
        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
      >
        <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <span style={{ color: "var(--text-secondary)" }}>
          This is a <strong style={{ color: "var(--text-primary)" }}>test conversation</strong>. Your agent is not live
          yet until you complete onboarding.
        </span>
      </div>

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
