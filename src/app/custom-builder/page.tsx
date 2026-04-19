"use client";

import { useAuth } from "@/components/layout/Providers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Wrench,
  Plus,
  X,
  Eye,
  Save,
  Sparkles,
  Headphones,
  TrendingUp,
  Palette,
  Calculator,
  BarChart3,
  Users,
  Monitor,
  Settings,
} from "lucide-react";

const categoryIcons: Record<string, any> = {
  "Customer Service": Headphones,
  "Sales": TrendingUp,
  "Marketing": Palette,
  "Finance": Calculator,
  "Analytics": BarChart3,
  "Human Resources": Users,
  "IT Support": Monitor,
  "Operations": Settings,
};

const categoryGradients: Record<string, string> = {
  "Customer Service": "from-blue-500 to-cyan-500",
  "Sales": "from-emerald-500 to-teal-500",
  "Marketing": "from-pink-500 to-rose-500",
  "Finance": "from-amber-500 to-orange-500",
  "Analytics": "from-violet-500 to-purple-500",
  "Human Resources": "from-sky-500 to-blue-500",
  "IT Support": "from-slate-400 to-zinc-500",
  "Operations": "from-indigo-500 to-blue-500",
};

const CATEGORIES = Object.keys(categoryIcons);

const SUGGESTED_CAPS = [
  "Email Handling",
  "Live Chat",
  "Data Analysis",
  "Report Generation",
  "Scheduling",
  "Lead Qualification",
  "Invoice Processing",
  "Ticket Management",
];

interface EmployeeForm {
  name: string;
  role: string;
  category: string;
  description: string;
  capabilities: string[];
  price: number;
}

export default function CustomBuilderPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [capInput, setCapInput] = useState("");
  const [form, setForm] = useState<EmployeeForm>({
    name: "",
    role: "",
    category: "",
    description: "",
    capabilities: [],
    price: 49,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const base = 49;
    const perCap = 25;
    setForm((f) => ({ ...f, price: base + f.capabilities.length * perCap }));
  }, [form.capabilities.length]);

  const addCapability = () => {
    const trimmed = capInput.trim();
    if (trimmed && !form.capabilities.includes(trimmed)) {
      setForm((f) => ({ ...f, capabilities: [...f.capabilities, trimmed] }));
      setCapInput("");
    }
  };

  const removeCapability = (cap: string) => {
    setForm((f) => ({ ...f, capabilities: f.capabilities.filter((c) => c !== cap) }));
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const id = uuidv4();
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          userId: user?.id,
          ...form,
        }),
      });
      if (res.ok) {
        router.push(`/marketplace/${id}`);
      }
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const canCreate =
    form.name.trim() !== "" &&
    form.role.trim() !== "" &&
    form.category !== "" &&
    form.description.trim() !== "" &&
    form.capabilities.length > 0;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!user) return null;

  const SelectedIcon = categoryIcons[form.category] ?? Wrench;
  const selectedGradient = categoryGradients[form.category] ?? "from-indigo-500 to-purple-500";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Wrench size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Build Your Custom AI Employee
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Create a tailored AI employee for your specific business needs
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form – 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          {/* Basic Info */}
          <div className="rounded-2xl p-6 space-y-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Basic Info
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Employee Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. DataBot Pro"
                className="w-full px-4 py-3 rounded-xl outline-none placeholder-[#64748B] focus:border-indigo-500 transition-colors"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Role / Title</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="e.g. Senior Data Analyst"
                className="w-full px-4 py-3 rounded-xl outline-none placeholder-[#64748B] focus:border-indigo-500 transition-colors"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Avatar Icon Picker */}
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Avatar
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Select a category above to preview the icon, or choose one below:</p>
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = categoryIcons[cat];
                const gradient = categoryGradients[cat];
                const active = form.category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setForm((f) => ({ ...f, category: cat }))}
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 border ${
                      active
                        ? `bg-gradient-to-br ${gradient} border-transparent shadow-lg scale-110`
                        : ""
                    }`}
                    style={!active ? { background: "var(--bg-primary)", borderColor: "var(--border-primary)" } : undefined}
                    title={cat}
                  >
                    <Icon size={24} className={active ? "text-white" : ""} style={!active ? { color: "var(--text-muted)" } : undefined} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Description
            </h3>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe what this AI employee does..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl outline-none resize-none placeholder-[#64748B] focus:border-indigo-500 transition-colors"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Capabilities */}
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Capabilities
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={capInput}
                onChange={(e) => setCapInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCapability())}
                placeholder="Add a capability and press Enter"
                className="flex-1 px-4 py-2.5 rounded-xl outline-none text-sm placeholder-[#64748B] focus:border-indigo-500 transition-colors"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              />
              <button
                onClick={addCapability}
                className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
            {form.capabilities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300"
                  >
                    {cap}
                    <button onClick={() => removeCapability(cap)} className="hover:opacity-70">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Suggested */}
            <div>
              <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Suggested:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_CAPS.filter((s) => !form.capabilities.includes(s)).map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm((f) => ({ ...f, capabilities: [...f.capabilities, s] }))}
                    className="px-3 py-1 rounded-full text-xs hover:border-indigo-500 hover:text-indigo-300 transition-colors"
                    style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Pricing
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>$</span>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                min={0}
                className="w-32 px-4 py-3 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>/month</span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Auto-calculated: $49 base + $25 per capability ({form.capabilities.length} capabilities)
            </p>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={!canCreate || saving}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Creating...
              </>
            ) : (
              <>
                <Save size={18} /> Create Employee
              </>
            )}
          </button>
        </div>

        {/* Preview Card – 2 cols */}
        <div className="lg:col-span-2">
          <div className="sticky top-8 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={18} className="text-emerald-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                Marketplace Preview
              </h3>
            </div>

            <div className="rounded-2xl overflow-hidden transition-all duration-200" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              {/* Preview Header with Icon */}
              <div className={`h-28 bg-gradient-to-br ${selectedGradient} flex items-center justify-center relative`}>
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <SelectedIcon size={32} className="text-white" />
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <h4 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    {form.name || "Employee Name"}
                  </h4>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {form.role || "Role / Title"}
                  </p>
                </div>

                {form.category && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">
                    {form.category}
                  </span>
                )}

                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {form.description || "Description will appear here..."}
                </p>

                {form.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
                  <div>
                    <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                      ${form.price}
                    </span>
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>/mo</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="text-xs font-medium text-amber-400">Custom</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
