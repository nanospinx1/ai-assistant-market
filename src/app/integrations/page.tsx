"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Plug,
  Mail,
  Users,
  CalendarDays,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Settings,
} from "lucide-react";

const TOOL_ICONS: Record<string, any> = {
  email: Mail,
  crm: Users,
  calendar: CalendarDays,
};

const TOOL_COLORS: Record<string, string> = {
  email: "from-blue-500 to-cyan-500",
  crm: "from-emerald-500 to-teal-500",
  calendar: "from-violet-500 to-purple-500",
};

interface ToolConnection {
  id: string;
  toolType: string;
  name: string;
  config: Record<string, any>;
  status: string;
  createdAt: string;
}

interface AvailableTool {
  type: string;
  name: string;
  description: string;
}

export default function IntegrationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [connections, setConnections] = useState<ToolConnection[]>([]);
  const [availableTools, setAvailableTools] = useState<AvailableTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ toolType: "", name: "", webhookUrl: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) fetchIntegrations();
  }, [user]);

  const fetchIntegrations = async () => {
    try {
      const res = await fetch("/api/integrations");
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections);
        setAvailableTools(data.availableTools);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!addForm.toolType || !addForm.name) return;
    setSaving(true);
    try {
      const config: Record<string, any> = {};
      if (addForm.webhookUrl) config.webhook_url = addForm.webhookUrl;

      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType: addForm.toolType,
          name: addForm.name,
          config,
        }),
      });
      if (res.ok) {
        setShowAdd(false);
        setAddForm({ toolType: "", name: "", webhookUrl: "" });
        fetchIntegrations();
      }
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this integration?")) return;
    try {
      await fetch(`/api/integrations?id=${id}`, { method: "DELETE" });
      fetchIntegrations();
    } catch {}
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Plug size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Integrations
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Connect external tools for your AI employees
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={16} /> Add Integration
        </button>
      </div>

      {/* Available Tools */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-secondary)" }}>
          Available Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableTools.map((tool) => {
            const Icon = TOOL_ICONS[tool.type] || Settings;
            const gradient = TOOL_COLORS[tool.type] || "from-gray-500 to-slate-500";
            const connected = connections.some((c) => c.toolType === tool.type);
            return (
              <div
                key={tool.type}
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{tool.name}</h3>
                      {connected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">
                          <CheckCircle size={10} /> Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{tool.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Connections */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-secondary)" }}>
          Your Connections ({connections.length})
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <Plug size={32} className="mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No integrations yet. Click &quot;Add Integration&quot; to connect your first tool.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((conn) => {
              const Icon = TOOL_ICONS[conn.toolType] || Settings;
              const gradient = TOOL_COLORS[conn.toolType] || "from-gray-500 to-slate-500";
              return (
                <div
                  key={conn.id}
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{conn.name}</h4>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {conn.toolType.toUpperCase()} · {conn.config.webhook_url ? "Webhook" : "Built-in"} · Added {new Date(conn.createdAt).toLocaleDateString()}
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
                      onClick={() => handleDelete(conn.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
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

      {/* Add Integration Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Add Integration</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:opacity-70">
                <X size={18} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Tool Type</label>
                <select
                  value={addForm.toolType}
                  onChange={(e) => setAddForm((f) => ({ ...f, toolType: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                >
                  <option value="">Select a tool</option>
                  {availableTools.map((t) => (
                    <option key={t.type} value={t.type}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Connection Name</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. My CRM, Office Calendar"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Webhook URL <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>(optional — leave blank for built-in mode)</span>
                </label>
                <input
                  type="url"
                  value={addForm.webhookUrl}
                  onChange={(e) => setAddForm((f) => ({ ...f, webhookUrl: e.target.value }))}
                  placeholder="https://your-api.com/webhook"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!addForm.toolType || !addForm.name || saving}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all"
              >
                {saving ? "Adding..." : "Add Connection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
