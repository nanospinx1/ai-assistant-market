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
  const [activeSection, setActiveSection] = useState<"tools" | "knowledge">("tools");

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
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{
              background: activeSection === s.key ? "rgba(79,70,229,0.15)" : "var(--bg-primary)",
              color: activeSection === s.key ? "var(--primary)" : "var(--text-muted)",
            }}>
              {s.count}
            </span>
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
