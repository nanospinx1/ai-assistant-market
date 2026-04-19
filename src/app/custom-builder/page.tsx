"use client";

import { useSession } from "next-auth/react";
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
} from "lucide-react";

const CATEGORIES = [
  "Customer Support",
  "Sales",
  "Marketing",
  "Data Analysis",
  "Development",
  "HR & Recruiting",
  "Finance",
  "Operations",
  "Creative",
  "Other",
];

const EMOJI_GRID = [
  "🤖", "🧠", "💡", "🚀", "⚡", "🎯", "📊", "💬",
  "📝", "🔍", "🛠️", "📈", "🎨", "🔒", "📱", "🌐",
  "💻", "📧", "🗂️", "⏱️", "🤝", "📋", "🎓", "💰",
];

interface EmployeeForm {
  name: string;
  role: string;
  category: string;
  avatar: string;
  description: string;
  capabilities: string[];
  price: number;
}

export default function CustomBuilderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [capInput, setCapInput] = useState("");
  const [form, setForm] = useState<EmployeeForm>({
    name: "",
    role: "",
    category: "",
    avatar: "🤖",
    description: "",
    capabilities: [],
    price: 49,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Auto-suggest price based on capability count
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
          userId: session?.user?.id,
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

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--primary)" }} />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Wrench size={28} style={{ color: "var(--primary)" }} />
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Custom AI Employee Builder
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)" }}>
          Design and create a custom AI employee tailored to your business needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form – 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          <div
            className="rounded-xl p-6 space-y-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Employee Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. DataBot Pro"
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Role / Title
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="e.g. Senior Data Analyst"
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Avatar Emoji Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Avatar Emoji
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_GRID.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setForm((f) => ({ ...f, avatar: emoji }))}
                    className="w-10 h-10 rounded-lg text-lg flex items-center justify-center transition-colors"
                    style={{
                      background: form.avatar === emoji ? "rgba(99, 102, 241, 0.3)" : "var(--bg-dark)",
                      border: form.avatar === emoji ? "2px solid var(--primary)" : "1px solid var(--border)",
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe what this AI employee does…"
                rows={4}
                className="w-full px-4 py-3 rounded-lg outline-none resize-none"
                style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Capabilities */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Capabilities
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={capInput}
                  onChange={(e) => setCapInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCapability())}
                  placeholder="Add a capability and press Enter"
                  className="flex-1 px-4 py-2.5 rounded-lg outline-none text-sm"
                  style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
                <button
                  onClick={addCapability}
                  className="px-3 py-2.5 rounded-lg text-white"
                  style={{ background: "var(--primary)" }}
                >
                  <Plus size={18} />
                </button>
              </div>
              {form.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--primary-light)" }}
                    >
                      {cap}
                      <button onClick={() => removeCapability(cap)} className="hover:opacity-70">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Monthly Price (auto-suggested)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>$</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  min={0}
                  className="w-32 px-4 py-3 rounded-lg outline-none"
                  style={{ background: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>/month</span>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={!canCreate || saving}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white disabled:opacity-40 transition-colors"
            style={{ background: "var(--primary)" }}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: "white" }} />
                Creating…
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
              <Eye size={18} style={{ color: "var(--accent)" }} />
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                Marketplace Preview
              </h3>
            </div>

            <div
              className="rounded-xl overflow-hidden card-hover"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              {/* Preview Header */}
              <div
                className="h-24 flex items-center justify-center text-5xl"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
              >
                {form.avatar}
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
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: "rgba(6, 182, 212, 0.15)", color: "var(--accent)" }}
                  >
                    {form.category}
                  </span>
                )}

                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {form.description || "Description will appear here…"}
                </p>

                {form.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ background: "var(--bg-dark)", color: "var(--text-secondary)" }}
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                  <div>
                    <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                      ${form.price}
                    </span>
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>/mo</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles size={14} style={{ color: "var(--warning)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--warning)" }}>Custom</span>
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
