"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Plug,
  Mail,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Settings,
  BookOpen,
  FileText,
  Upload,
  Link2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Database,
  Calendar,
  Globe,
  Check,
  LayoutGrid,
  Search,
  ExternalLink,
  Zap,
  Shield,
  BarChart3,
  ShoppingCart,
  CreditCard,
  Headphones,
  FileSpreadsheet,
  Video,
  Clock,
  Users,
  TrendingUp,
  PenTool,
  HardDrive,
  Smartphone,
} from "lucide-react";

/* ---- Tool type definitions (mirrors onboarding) ---- */
const TOOL_DEFS: {
  type: string;
  name: string;
  desc: string;
  icon: any;
  fields: { key: string; label: string; placeholder: string; type?: string }[];
}[] = [
  {
    type: "email", name: "Email", desc: "Send & receive emails", icon: Mail,
    fields: [
      { key: "domain", label: "Domain / SMTP Host", placeholder: "smtp.yourcompany.com" },
      { key: "username", label: "Username / Email", placeholder: "agent@yourcompany.com" },
      { key: "password", label: "Password / App Password", placeholder: "••••••••", type: "password" },
    ],
  },
  {
    type: "crm", name: "CRM", desc: "Customer relationship data", icon: Database,
    fields: [
      { key: "instanceUrl", label: "Instance URL", placeholder: "https://yourcrm.example.com" },
      { key: "apiKey", label: "API Key", placeholder: "crm-api-key-xxxx" },
    ],
  },
  {
    type: "calendar", name: "Calendar", desc: "Schedule meetings & availability", icon: Calendar,
    fields: [
      { key: "provider", label: "Provider", placeholder: "Google / Outlook / CalDAV" },
      { key: "apiKey", label: "API Key / OAuth Token", placeholder: "calendar-api-key-xxxx" },
    ],
  },
  {
    type: "api", name: "API / Webhooks", desc: "External services via API", icon: Globe,
    fields: [
      { key: "endpoint", label: "Endpoint URL", placeholder: "https://api.example.com/v1" },
      { key: "method", label: "Method", placeholder: "GET / POST / PUT" },
      { key: "authHeader", label: "Auth Header / Bearer Token", placeholder: "Bearer xxxx" },
    ],
  },
  {
    type: "custom", name: "Custom Integration", desc: "Define your own fields", icon: Settings,
    fields: [],
  },
];

const TOOL_NAME_HINTS: Record<string, { label: string; placeholder: string }> = {
  email: { label: "Account Name", placeholder: 'e.g. "Work Gmail", "Support Inbox"' },
  crm: { label: "CRM Name", placeholder: 'e.g. "Salesforce Prod", "HubSpot"' },
  calendar: { label: "Calendar Name", placeholder: 'e.g. "Team Calendar", "Booking Calendar"' },
  api: { label: "Integration Name", placeholder: 'e.g. "Stripe Payments", "Slack Webhook"' },
  custom: { label: "Integration Name", placeholder: 'e.g. "Internal ERP", "Legacy System"' },
};

const TOOL_GRADIENTS: Record<string, string> = {
  email: "from-blue-500 to-cyan-500",
  crm: "from-emerald-500 to-teal-500",
  calendar: "from-violet-500 to-purple-500",
  api: "from-amber-500 to-orange-500",
  custom: "from-slate-500 to-gray-600",
};

const DEFAULT_KNOWLEDGE_CATEGORIES = [
  "FAQs", "Company Policies", "Product Info", "Processes",
  "Training Materials", "Templates & Scripts", "Pricing & Contracts",
  "Brand Guidelines", "Internal Tools Docs", "Vendor/Partner Info",
];

/* ---- Types ---- */
interface ToolConnection {
  id: string;
  toolType: string;
  name: string;
  config: Record<string, any>;
  status: string;
  createdAt: string;
}

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
}

/* ==================================================================== */
/*  Page                                                                 */
/* ==================================================================== */
export default function IntegrationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<"tools" | "knowledge" | "apps">("apps");

  // Tools state
  const [connections, setConnections] = useState<ToolConnection[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);

  // Knowledge state
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [loadingKnowledge, setLoadingKnowledge] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchTools();
      fetchKnowledge();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchTools = async () => {
    try {
      const res = await fetch("/api/integrations");
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
      }
    } catch {
      // ignore
    } finally { setLoadingTools(false); }
  };

  const fetchKnowledge = async () => {
    try {
      const res = await fetch("/api/knowledge");
      if (res.ok) {
        const data = await res.json();
        setKnowledgeEntries(data.entries || []);
      }
    } catch {
      // ignore
    } finally { setLoadingKnowledge(false); }
  };

  const handleAddTool = async (toolType: string, name: string, config: Record<string, any>) => {
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolType, name, config }),
      });
      if (res.ok) fetchTools();
    } catch {
      // ignore
    }
  };

  const handleDeleteTool = async (id: string) => {
    try {
      await fetch(`/api/integrations?id=${id}`, { method: "DELETE" });
      fetchTools();
    } catch {
      // ignore
    }
  };

  const handleAddKnowledge = async (title: string, content: string, category: string) => {
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      });
      if (res.ok) fetchKnowledge();
    } catch {
      // ignore
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    try {
      await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" });
      fetchKnowledge();
    } catch {
      // ignore
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  const inputStyle: React.CSSProperties = { background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Plug size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Resources
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Manage your global tools and knowledge library — shared across all AI employees
            </p>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: "var(--bg-tertiary)" }}>
        {([
          { key: "apps" as const, label: "Apps", icon: LayoutGrid, count: null },
          { key: "tools" as const, label: "Connected Tools", icon: Plug, count: connections.length },
          { key: "knowledge" as const, label: "Knowledge Library", icon: BookOpen, count: knowledgeEntries.length },
        ]).map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeSection === s.key ? "var(--bg-card)" : "transparent",
              color: activeSection === s.key ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: activeSection === s.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            <s.icon size={16} />
            {s.label}
            {s.count !== null && (
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{
                background: activeSection === s.key ? "rgba(79,70,229,0.15)" : "var(--bg-primary)",
                color: activeSection === s.key ? "var(--primary)" : "var(--text-muted)",
              }}>
                {s.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tools Section */}
      {activeSection === "tools" && (
        <div className="space-y-5">
          <ToolFormAccordion onAdd={handleAddTool} inputStyle={inputStyle} />

          {loadingTools ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <Plug size={36} className="mx-auto mb-3 opacity-20" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>No tools connected yet</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Connect your first tool above — it will be available to all your AI employees.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {connections.map((conn) => {
                const def = TOOL_DEFS.find(t => t.type === conn.toolType);
                const Icon = def?.icon || Settings;
                const gradient = TOOL_GRADIENTS[conn.toolType] || "from-gray-500 to-slate-500";
                return (
                  <div
                    key={conn.id}
                    className="rounded-xl p-4 flex items-center justify-between group transition-all"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{conn.name}</h4>
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(79,70,229,0.1)", color: "var(--primary)" }}>
                            {def?.name || conn.toolType}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          Added {new Date(conn.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        conn.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                      }`}>
                        {conn.status === "active" ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                        {conn.status}
                      </span>
                      <button
                        onClick={() => handleDeleteTool(conn.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Knowledge Section */}
      {activeSection === "knowledge" && (
        <div className="space-y-5">
          <KnowledgeFormAccordion onAdd={handleAddKnowledge} existingCategories={knowledgeEntries.map(k => k.category)} inputStyle={inputStyle} />

          {loadingKnowledge ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
            </div>
          ) : knowledgeEntries.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <BookOpen size={36} className="mx-auto mb-3 opacity-20" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>No knowledge entries yet</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Add your first entry above — it will be available for all your AI employees to reference.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {knowledgeEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl p-4 flex items-start gap-3 group transition-all"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(79,70,229,0.12)" }}>
                    <BookOpen size={16} style={{ color: "#6366F1" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{entry.title}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(79,70,229,0.1)", color: "var(--primary)" }}>
                        {entry.category}
                      </span>
                    </div>
                    <p className="text-xs line-clamp-2" style={{ color: "var(--text-muted)" }}>{entry.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteKnowledge(entry.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 transition-all shrink-0"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apps Section */}
      {activeSection === "apps" && <AppsDirectory />}
    </div>
  );
}
/* ==================================================================== */
function ToolFormAccordion({
  onAdd,
  inputStyle,
}: {
  onAdd: (toolType: string, name: string, config: Record<string, any>) => void;
  inputStyle: React.CSSProperties;
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [toolName, setToolName] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);

  const selectedDef = TOOL_DEFS.find(t => t.type === selectedType);
  const isCustom = selectedType === "custom";
  const hint = TOOL_NAME_HINTS[selectedType];

  const resetForm = () => {
    setSelectedType("");
    setToolName("");
    setFieldValues({});
    setCustomFields([{ key: "", value: "" }]);
  };

  const handleSave = () => {
    if (!toolName.trim() || !selectedType) return;
    const config: Record<string, any> = {};
    if (isCustom) {
      customFields.forEach(cf => { if (cf.key.trim() && cf.value.trim()) config[cf.key.trim()] = cf.value.trim(); });
    } else {
      Object.entries(fieldValues).forEach(([k, v]) => { if (v.trim()) config[k] = v.trim(); });
    }
    onAdd(selectedType, toolName.trim(), config);
    resetForm();
    setShowForm(false);
  };

  const canSave = toolName.trim() && selectedType && (
    isCustom
      ? customFields.some(cf => cf.key.trim() && cf.value.trim())
      : (selectedDef?.fields || []).some(f => (fieldValues[f.key] || "").trim())
  );

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
      <button
        onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:opacity-90"
      >
        <span className="flex items-center gap-2 font-semibold" style={{ color: "var(--text-primary)" }}>
          <Plus size={18} className="text-indigo-400" />
          Connect New Tool
        </span>
        {showForm ? <ChevronUp size={18} style={{ color: "var(--text-secondary)" }} /> : <ChevronDown size={18} style={{ color: "var(--text-secondary)" }} />}
      </button>

      {showForm && (
        <div className="px-5 pb-5 space-y-4 border-t pt-4" style={{ borderColor: "var(--border-primary)" }}>
          {/* Tool type + name */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setFieldValues({}); setCustomFields([{ key: "", value: "" }]); }}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={inputStyle}
            >
              <option value="">Select tool type…</option>
              {TOOL_DEFS.map(t => <option key={t.type} value={t.type}>{t.name}</option>)}
            </select>
            <input
              type="text"
              placeholder={hint?.placeholder || "Enter a name for this connection"}
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {/* Dynamic fields */}
          {selectedType && !isCustom && selectedDef && (
            <div className="space-y-3">
              {selectedDef.fields.map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>{f.label}</label>
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

          {/* Custom fields */}
          {isCustom && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Define custom fields for your integration:</p>
              {customFields.map((cf, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text" placeholder="Field name" value={cf.key}
                    onChange={(e) => { const u = [...customFields]; u[idx] = { ...u[idx], key: e.target.value }; setCustomFields(u); }}
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}
                  />
                  <input
                    type="text" placeholder="Value" value={cf.value}
                    onChange={(e) => { const u = [...customFields]; u[idx] = { ...u[idx], value: e.target.value }; setCustomFields(u); }}
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}
                  />
                  {customFields.length > 1 && (
                    <button onClick={() => setCustomFields(customFields.filter((_, i) => i !== idx))} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
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
  );
}

/* ==================================================================== */
/*  Add Knowledge Entry — Accordion Form                                 */
/* ==================================================================== */
function KnowledgeFormAccordion({
  onAdd,
  existingCategories,
  inputStyle,
}: {
  onAdd: (title: string, content: string, category: string) => void;
  existingCategories: string[];
  inputStyle: React.CSSProperties;
}) {
  const [showForm, setShowForm] = useState(false);
  const [format, setFormat] = useState<"text" | "file" | "url" | "qa">("text");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("FAQs");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [qaPairs, setQaPairs] = useState<{ question: string; answer: string }[]>([{ question: "", answer: "" }]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  const allCategories = Array.from(new Set([...DEFAULT_KNOWLEDGE_CATEGORIES, ...existingCategories, ...customCategories]));

  const resetForm = () => {
    setFormat("text"); setTitle(""); setCategory("FAQs"); setContent(""); setUrl(""); setFileName("");
    setQaPairs([{ question: "", answer: "" }]); setShowNewCategory(false); setNewCategoryName("");
  };

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (name && !allCategories.includes(name)) {
      setCustomCategories(prev => [...prev, name]);
      setCategory(name);
    }
    setNewCategoryName(""); setShowNewCategory(false);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    let finalContent = "";
    if (format === "text") { if (!content.trim()) return; finalContent = content.trim(); }
    else if (format === "url") { if (!url.trim()) return; finalContent = `Source: ${url.trim()}`; }
    else if (format === "file") { if (!fileName.trim()) return; finalContent = `File: ${fileName.trim()}`; }
    else if (format === "qa") {
      const valid = qaPairs.filter(p => p.question.trim() && p.answer.trim());
      if (!valid.length) return;
      finalContent = valid.map(p => `Q: ${p.question}\nA: ${p.answer}`).join("\n\n");
    }
    onAdd(title.trim(), finalContent, category);
    resetForm(); setShowForm(false);
  };

  const canSave = title.trim() && (
    (format === "text" && content.trim()) ||
    (format === "url" && url.trim()) ||
    (format === "file" && fileName.trim()) ||
    (format === "qa" && qaPairs.some(p => p.question.trim() && p.answer.trim()))
  );

  const formatOptions: { key: typeof format; label: string; icon: React.ReactNode }[] = [
    { key: "text", label: "Text", icon: <FileText size={14} /> },
    { key: "file", label: "File Upload", icon: <Upload size={14} /> },
    { key: "url", label: "URL / Web Link", icon: <Link2 size={14} /> },
    { key: "qa", label: "Q&A Pairs", icon: <MessageSquare size={14} /> },
  ];

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
      <button
        onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:opacity-90"
      >
        <span className="flex items-center gap-2 font-semibold" style={{ color: "var(--text-primary)" }}>
          <Plus size={18} className="text-indigo-400" />
          Add Knowledge Entry
        </span>
        {showForm ? <ChevronUp size={18} style={{ color: "var(--text-secondary)" }} /> : <ChevronDown size={18} style={{ color: "var(--text-secondary)" }} />}
      </button>

      {showForm && (
        <div className="px-5 pb-5 space-y-4 border-t pt-4" style={{ borderColor: "var(--border-primary)" }}>
          {/* Format pills */}
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

          {/* Category + Title */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              {!showNewCategory ? (
                <select
                  value={category}
                  onChange={(e) => { if (e.target.value === "__new__") setShowNewCategory(true); else setCategory(e.target.value); }}
                  className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}
                >
                  {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__new__">+ New Category…</option>
                </select>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text" placeholder="New category name" value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }}
                    className="px-3 py-2 rounded-lg text-sm outline-none w-40" style={inputStyle} autoFocus
                  />
                  <button onClick={addCategory} className="p-1.5 rounded-lg" style={{ color: "var(--primary)" }}><Check size={16} /></button>
                  <button onClick={() => { setShowNewCategory(false); setNewCategoryName(""); }} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}><X size={16} /></button>
                </div>
              )}
            </div>
            <input
              type="text" placeholder="Title (e.g. Return Policy, Onboarding Checklist)"
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}
            />
          </div>

          {/* Format-specific fields */}
          {format === "text" && (
            <textarea placeholder="Paste your FAQ answer, policy text, product description, etc."
              value={content} onChange={(e) => setContent(e.target.value)} rows={4}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={inputStyle}
            />
          )}

          {format === "url" && (
            <div className="space-y-2">
              <input type="url" placeholder="https://docs.yourcompany.com/help-center"
                value={url} onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}
              />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                The agent will reference content from this URL when answering questions.
              </p>
            </div>
          )}

          {format === "file" && (
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:opacity-80"
              style={{ borderColor: "var(--border-primary)", background: "var(--bg-tertiary)" }}
              onClick={() => { const name = prompt("Enter file name (e.g. handbook.pdf):"); if (name) setFileName(name); }}
            >
              <Upload size={24} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
              {fileName ? (
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{fileName}</p>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Click to upload — PDF, DOCX, CSV, TXT, XLSX</p>
              )}
            </div>
          )}

          {format === "qa" && (
            <div className="space-y-3">
              {qaPairs.map((pair, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <input type="text" placeholder={`Question ${idx + 1}`}
                      value={pair.question}
                      onChange={(e) => { const u = [...qaPairs]; u[idx] = { ...u[idx], question: e.target.value }; setQaPairs(u); }}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}
                    />
                    <textarea placeholder="Answer" value={pair.answer}
                      onChange={(e) => { const u = [...qaPairs]; u[idx] = { ...u[idx], answer: e.target.value }; setQaPairs(u); }}
                      rows={2} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={inputStyle}
                    />
                  </div>
                  {qaPairs.length > 1 && (
                    <button onClick={() => setQaPairs(qaPairs.filter((_, i) => i !== idx))} className="p-1.5 rounded-lg hover:bg-red-500/10 mt-2">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setQaPairs([...qaPairs, { question: "", answer: "" }])}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ color: "var(--primary)", background: "rgba(79,70,229,0.1)" }}
              >
                <Plus size={14} /> Add Q&A Pair
              </button>
            </div>
          )}

          {/* Save / Cancel */}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={!canSave}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40"
              style={{ background: "var(--accent-primary)" }}
            >
              Add Entry
            </button>
            <button onClick={() => { resetForm(); setShowForm(false); }}
              className="px-4 py-2 rounded-lg text-sm transition-colors" style={{ color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================================================================== */
/*  Apps Directory                                                       */
/* ==================================================================== */
const APP_CATEGORIES = ["All", "Communication", "CRM & Sales", "Productivity", "Finance", "Marketing", "Social Media", "Support", "Storage", "Analytics", "Development"] as const;

interface AppItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  gradient: string;
  logo?: string;
  popular?: boolean;
}

const APPS_CATALOG: AppItem[] = [
  { id: "aws-s3", name: "Amazon S3", description: "Scalable object storage for data and files", category: "Storage", icon: HardDrive, gradient: "from-[#FF9900] to-[#EC7211]", logo: "/logos/amazons3.svg" },
  { id: "asana", name: "Asana", description: "Work management for teams and project tracking", category: "Productivity", icon: Check, gradient: "from-[#F06A6A] to-[#F5A0A0]", logo: "/logos/asana.svg" },
  { id: "buffer", name: "Buffer", description: "Social media scheduling, analytics, and engagement tools", category: "Social Media", icon: BarChart3, gradient: "from-[#168EEA] to-[#0D6ABF]", logo: "/logos/buffer.svg" },
  { id: "canva", name: "Canva", description: "Design platform for social media and marketing", category: "Marketing", icon: PenTool, gradient: "from-[#00C4CC] to-[#7B2FF7]", logo: "/logos/canva.svg" },
  { id: "webhooks", name: "Custom Webhooks", description: "Connect any service via custom webhooks", category: "Development", icon: Link2, gradient: "from-[#6366F1] to-[#8B5CF6]" },
  { id: "dropbox", name: "Dropbox", description: "File hosting and cloud collaboration", category: "Storage", icon: HardDrive, gradient: "from-[#0061FF] to-[#0D2481]", logo: "/logos/dropbox.svg" },
  { id: "facebook", name: "Facebook", description: "Page management, post scheduling, and audience insights", category: "Social Media", icon: Globe, gradient: "from-[#1877F2] to-[#0C5DC7]", logo: "/logos/facebook.svg", popular: true },
  { id: "freshdesk", name: "Freshdesk", description: "Helpdesk and customer support ticketing", category: "Support", icon: Headphones, gradient: "from-[#25C16F] to-[#1BAA5A]", logo: "/logos/freshdesk.svg" },
  { id: "freshsales", name: "Freshsales", description: "AI-powered CRM for high-velocity sales teams", category: "CRM & Sales", icon: Zap, gradient: "from-[#F36C3D] to-[#E8570E]" },
  { id: "github", name: "GitHub", description: "Code hosting, version control, and CI/CD", category: "Development", icon: Globe, gradient: "from-[#24292E] to-[#586069]", logo: "/logos/github.svg" },
  { id: "gmail", name: "Gmail", description: "Email integration for sending and receiving messages", category: "Communication", icon: Mail, gradient: "from-[#EA4335] to-[#FBBC04]", logo: "/logos/gmail.svg", popular: true },
  { id: "google-ads", name: "Google Ads", description: "Search and display advertising management", category: "Marketing", icon: TrendingUp, gradient: "from-[#4285F4] to-[#EA4335]", logo: "/logos/googleads.svg" },
  { id: "google-analytics", name: "Google Analytics", description: "Website and app analytics and reporting", category: "Analytics", icon: BarChart3, gradient: "from-[#F9AB00] to-[#E37400]", logo: "/logos/googleanalytics.svg" },
  { id: "google-drive", name: "Google Drive", description: "Cloud storage and file sharing", category: "Storage", icon: HardDrive, gradient: "from-[#4285F4] to-[#0F9D58]", logo: "/logos/googledrive.svg" },
  { id: "google-workspace", name: "Google Workspace", description: "Docs, Sheets, Drive, and Calendar suite", category: "Productivity", icon: Globe, gradient: "from-[#4285F4] to-[#34A853]", logo: "/logos/google.svg", popular: true },
  { id: "hootsuite", name: "Hootsuite", description: "Unified social media management and scheduling dashboard", category: "Social Media", icon: Clock, gradient: "from-[#143059] to-[#1D4D80]", logo: "/logos/hootsuite.svg" },
  { id: "hubspot", name: "HubSpot", description: "Inbound marketing, sales, and CRM software", category: "CRM & Sales", icon: Database, gradient: "from-[#FF7A59] to-[#FF5C35]", logo: "/logos/hubspot.svg", popular: true },
  { id: "instagram", name: "Instagram", description: "Content publishing, stories, reels, and engagement tracking", category: "Social Media", icon: Smartphone, gradient: "from-[#F58529] to-[#DD2A7B]", logo: "/logos/instagram.svg", popular: true },
  { id: "intercom", name: "Intercom", description: "Conversational support and customer messaging", category: "Support", icon: MessageSquare, gradient: "from-[#286EFA] to-[#6AFDEF]", logo: "/logos/intercom.svg" },
  { id: "jira", name: "Jira", description: "Issue tracking and agile project management", category: "Productivity", icon: Settings, gradient: "from-[#0052CC] to-[#2684FF]", logo: "/logos/jira.svg" },
  { id: "linkedin", name: "LinkedIn", description: "Professional networking, company pages, and B2B outreach", category: "Social Media", icon: Users, gradient: "from-[#0A66C2] to-[#004182]", logo: "/logos/linkedin.svg", popular: true },
  { id: "mailchimp", name: "Mailchimp", description: "Email marketing campaigns and automation", category: "Marketing", icon: Mail, gradient: "from-[#FFE01B] to-[#F4C900]", logo: "/logos/mailchimp.svg", popular: true },
  { id: "meta-ads", name: "Meta Ads", description: "Facebook and Instagram advertising platform", category: "Marketing", icon: Globe, gradient: "from-[#0081FB] to-[#00D5FF]", logo: "/logos/meta.svg" },
  { id: "teams", name: "Microsoft Teams", description: "Chat, video meetings, and collaboration hub", category: "Communication", icon: Users, gradient: "from-[#464EB8] to-[#5B5FC7]", logo: "/logos/microsoftteams.svg", popular: true },
  { id: "mixpanel", name: "Mixpanel", description: "Product analytics and user behavior tracking", category: "Analytics", icon: BarChart3, gradient: "from-[#7856FF] to-[#4F46E5]", logo: "/logos/mixpanel.svg" },
  { id: "monday", name: "Monday.com", description: "Work OS for managing workflows and projects", category: "Productivity", icon: Calendar, gradient: "from-[#FF3D57] to-[#FFCB00]", logo: "/logos/mondaydotcom.svg" },
  { id: "notion", name: "Notion", description: "All-in-one workspace for notes, docs, and projects", category: "Productivity", icon: FileText, gradient: "from-[#000000] to-[#333333]", logo: "/logos/notion.svg", popular: true },
  { id: "onedrive", name: "OneDrive", description: "Microsoft cloud storage integration", category: "Storage", icon: HardDrive, gradient: "from-[#0078D4] to-[#28A8EA]", logo: "/logos/microsoftonedrive.svg" },
  { id: "outlook", name: "Outlook", description: "Microsoft email, calendar, and contacts", category: "Communication", icon: Mail, gradient: "from-[#0078D4] to-[#28A8EA]", logo: "/logos/microsoftoutlook.svg" },
  { id: "paypal", name: "PayPal", description: "Online payment platform and transactions", category: "Finance", icon: CreditCard, gradient: "from-[#003087] to-[#009CDE]", logo: "/logos/paypal.svg" },
  { id: "pinterest", name: "Pinterest", description: "Pin scheduling, board management, and visual discovery ads", category: "Social Media", icon: LayoutGrid, gradient: "from-[#E60023] to-[#BD001A]", logo: "/logos/pinterest.svg" },
  { id: "pipedrive", name: "Pipedrive", description: "Sales pipeline management and deal tracking", category: "CRM & Sales", icon: BarChart3, gradient: "from-[#017737] to-[#25C16F]", logo: "/logos/pipedrive.svg" },
  { id: "quickbooks", name: "QuickBooks", description: "Accounting, invoicing, and financial reporting", category: "Finance", icon: CreditCard, gradient: "from-[#2CA01C] to-[#108208]", logo: "/logos/quickbooks.svg", popular: true },
  { id: "rest-api", name: "REST API", description: "Integrate with any REST API endpoint", category: "Development", icon: Globe, gradient: "from-[#059669] to-[#10B981]" },
  { id: "salesforce", name: "Salesforce", description: "CRM platform for sales, service, and marketing", category: "CRM & Sales", icon: TrendingUp, gradient: "from-[#00A1E0] to-[#1798c1]", logo: "/logos/salesforce.svg", popular: true },
  { id: "slack", name: "Slack", description: "Team messaging, channels, and real-time notifications", category: "Communication", icon: MessageSquare, gradient: "from-[#4A154B] to-[#611f69]", logo: "/logos/slack.svg", popular: true },
  { id: "stripe", name: "Stripe", description: "Payment processing and subscription billing", category: "Finance", icon: CreditCard, gradient: "from-[#635BFF] to-[#A259FF]", logo: "/logos/stripe.svg", popular: true },
  { id: "tableau", name: "Tableau", description: "Data visualization and business intelligence", category: "Analytics", icon: BarChart3, gradient: "from-[#E97627] to-[#C72037]", logo: "/logos/tableau.svg" },
  { id: "tiktok", name: "TikTok", description: "Short-form video publishing, trends, and ad management", category: "Social Media", icon: Video, gradient: "from-[#010101] to-[#69C9D0]", logo: "/logos/tiktok.svg" },
  { id: "trello", name: "Trello", description: "Visual project management with boards and cards", category: "Productivity", icon: LayoutGrid, gradient: "from-[#0052CC] to-[#0079BF]", logo: "/logos/trello.svg" },
  { id: "x-twitter", name: "X (Twitter)", description: "Tweet scheduling, mentions monitoring, and trend analytics", category: "Social Media", icon: MessageSquare, gradient: "from-[#000000] to-[#333333]", logo: "/logos/x.svg", popular: true },
  { id: "xero", name: "Xero", description: "Cloud-based accounting and bookkeeping", category: "Finance", icon: FileSpreadsheet, gradient: "from-[#13B5EA] to-[#0D87B5]", logo: "/logos/xero.svg" },
  { id: "youtube", name: "YouTube", description: "Video publishing, channel management, and audience analytics", category: "Social Media", icon: Video, gradient: "from-[#FF0000] to-[#CC0000]", logo: "/logos/youtube.svg" },
  { id: "zapier", name: "Zapier", description: "Automate workflows between 5,000+ apps", category: "Development", icon: Zap, gradient: "from-[#FF4A00] to-[#FF6D36]", logo: "/logos/zapier.svg" },
  { id: "zendesk", name: "Zendesk", description: "Customer service and ticketing platform", category: "Support", icon: Headphones, gradient: "from-[#03363D] to-[#17494D]", logo: "/logos/zendesk.svg", popular: true },
  { id: "zoom", name: "Zoom", description: "Video conferencing and meeting scheduling", category: "Communication", icon: Video, gradient: "from-[#2D8CFF] to-[#0B5CFF]", logo: "/logos/zoom.svg" },
];

function AppIcon({ app, size = 18 }: { app: AppItem; size?: number }) {
  if (app.logo) {
    return <img src={app.logo} alt={app.name} width={size} height={size} className="object-contain" style={{ filter: "brightness(0) invert(1)" }} />;
  }
  const Icon = app.icon;
  return <Icon size={size} className="text-white" />;
}

function AppsDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [connectedApps, setConnectedApps] = useState<Set<string>>(new Set());
  const [connectingApp, setConnectingApp] = useState<string | null>(null);

  const filtered = APPS_CATALOG.filter(app => {
    const matchCat = activeCategory === "All" || app.category === activeCategory;
    const matchSearch = !searchQuery || app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const handleConnect = (appId: string) => {
    setConnectingApp(appId);
    setTimeout(() => {
      setConnectedApps(prev => {
        const next = new Set(prev);
        if (next.has(appId)) next.delete(appId); else next.add(appId);
        return next;
      });
      setConnectingApp(null);
    }, 1200);
  };

  const popularApps = APPS_CATALOG.filter(a => a.popular);

  return (
    <div className="space-y-6">
      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/30"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
          <span className="text-[var(--text-muted)] shrink-0">Connected:</span>
          <span className="px-2 py-0.5 rounded-lg font-semibold" style={{ background: "rgba(79,70,229,0.12)", color: "var(--primary)" }}>
            {connectedApps.size}
          </span>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {APP_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: activeCategory === cat ? "var(--primary)" : "var(--bg-card)",
              color: activeCategory === cat ? "#fff" : "var(--text-secondary)",
              border: activeCategory === cat ? "none" : "1px solid var(--border-primary)",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Popular Apps highlight */}
      {activeCategory === "All" && !searchQuery && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Zap size={14} className="text-amber-500" />
            Popular Integrations
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {popularApps.map(app => {
              const isConnected = connectedApps.has(app.id);
              const isConnecting = connectingApp === app.id;
              return (
                <div key={app.id} className="rounded-xl p-4 flex flex-col gap-3 group transition-all hover:shadow-md"
                  style={{ background: "var(--bg-card)", border: `1px solid ${isConnected ? "rgba(34,197,94,0.4)" : "var(--border-primary)"}` }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${app.gradient} flex items-center justify-center shrink-0`}>
                      <AppIcon app={app} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{app.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{app.category}</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>{app.description}</p>
                  <button onClick={() => handleConnect(app.id)} disabled={isConnecting}
                    className="mt-auto w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    style={{ background: isConnected ? "rgba(34,197,94,0.12)" : "rgba(79,70,229,0.1)", color: isConnected ? "#22C55E" : "var(--primary)", border: `1px solid ${isConnected ? "rgba(34,197,94,0.3)" : "rgba(79,70,229,0.2)"}` }}>
                    {isConnecting ? (<><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" /> Connecting...</>)
                      : isConnected ? (<><CheckCircle size={13} /> Connected</>)
                      : (<><Plus size={13} /> Connect</>)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full app catalog */}
      <div>
        {activeCategory === "All" && !searchQuery && (
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <LayoutGrid size={14} />
            All Apps
          </h3>
        )}
        {filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <Search size={36} className="mx-auto mb-3 opacity-20" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>No apps found</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(app => {
              const isConnected = connectedApps.has(app.id);
              const isConnecting = connectingApp === app.id;
              return (
                <div key={app.id} className="rounded-xl p-4 flex flex-col gap-3 group transition-all hover:shadow-md"
                  style={{ background: "var(--bg-card)", border: `1px solid ${isConnected ? "rgba(34,197,94,0.4)" : "var(--border-primary)"}` }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${app.gradient} flex items-center justify-center shrink-0`}>
                      <AppIcon app={app} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{app.name}</p>
                        {app.popular && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0" style={{ background: "rgba(251,191,36,0.15)", color: "#F59E0B" }}>Popular</span>
                        )}
                      </div>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{app.category}</p>
                    </div>
                    {isConnected && <CheckCircle size={14} className="shrink-0 text-green-500" />}
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>{app.description}</p>
                  <button onClick={() => handleConnect(app.id)} disabled={isConnecting}
                    className="mt-auto w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    style={{ background: isConnected ? "rgba(34,197,94,0.12)" : "rgba(79,70,229,0.1)", color: isConnected ? "#22C55E" : "var(--primary)", border: `1px solid ${isConnected ? "rgba(34,197,94,0.3)" : "rgba(79,70,229,0.2)"}` }}>
                    {isConnecting ? (<><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" /> Connecting...</>)
                      : isConnected ? (<><CheckCircle size={13} /> Connected</>)
                      : (<><Plus size={13} /> Connect</>)}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request an app */}
      <div className="rounded-xl p-5 text-center" style={{ background: "var(--bg-card)", border: "1px dashed var(--border-primary)" }}>
        <Smartphone size={24} className="mx-auto mb-2" style={{ color: "var(--text-muted)", opacity: 0.5 }} />
        <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Don&apos;t see the app you need?</p>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>We&apos;re constantly adding new integrations. Let us know what you&apos;d like to connect.</p>
        <a href="/contact" className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
          style={{ background: "rgba(79,70,229,0.1)", color: "var(--primary)", border: "1px solid rgba(79,70,229,0.2)" }}>
          <Mail size={13} />
          Request an Integration
        </a>
      </div>
    </div>
  );
}
