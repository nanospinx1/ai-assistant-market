"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useTheme } from "@/components/layout/Providers";
import {
  User,
  Shield,
  Bell,
  SlidersHorizontal,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Loader2,
  CreditCard,
} from "lucide-react";

/* ── Types ── */
type TabId = "profile" | "security" | "notifications" | "preferences" | "billing" | "danger";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const tabs: TabDef[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

const industries = [
  "Technology",
  "E-commerce",
  "Healthcare",
  "Finance",
  "Real Estate",
  "Restaurant",
  "Retail",
  "Consulting",
  "Other",
];

const teamSizes = ["Solo", "2-10", "11-50", "51-200", "200+"];
const customerVolumes = ["<500", "500-5K", "5K-50K", "50K-500K", "500K+"];
const businessTypes = ["Local Business", "Online/E-commerce", "Service Provider", "Agency/Consultancy", "SaaS/Tech", "Manufacturing", "Franchise", "Non-Profit"];

/* ── Toast ── */
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border animate-in fade-in slide-in-from-top-2"
      style={{
        background: type === "success" ? "var(--bg-card)" : "var(--bg-card)",
        borderColor: type === "success" ? "#22c55e" : "#ef4444",
      }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
        style={{ background: type === "success" ? "#22c55e" : "#ef4444" }}
      >
        {type === "success" ? <Check size={14} /> : "!"}
      </div>
      <span className="text-sm text-[var(--text-primary)]">{message}</span>
    </div>
  );
}

/* ── Toggle Switch ── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent"
      style={{ background: checked ? "#4F46E5" : "var(--border-primary)" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

/* ── Confirm Dialog ── */
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onCancel} />
      <div
        className="relative rounded-2xl p-6 max-w-md w-full mx-4 border shadow-2xl"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}
      >
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Shared Input ── */
function Input({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder,
  rightIcon,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  rightIcon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full bg-[var(--bg-main)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
        {rightIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</div>}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[var(--bg-main)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors appearance-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50"
      style={{
        background: "linear-gradient(135deg, #4F46E5, #6366F1)",
        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
      }}
    >
      {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
      {saving ? "Saving..." : "Save Changes"}
    </button>
  );
}

/* ── Page ── */
export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [customerVolume, setCustomerVolume] = useState("");
  const [businessType, setBusinessType] = useState("");

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Notifications state
  const [emailErrors, setEmailErrors] = useState(true);
  const [emailTasks, setEmailTasks] = useState(true);
  const [emailWeekly, setEmailWeekly] = useState(true);
  const [inappMode, setInappMode] = useState("all");
  const [statusAlerts, setStatusAlerts] = useState(true);

  // Preferences state
  const [themePreference, setThemePreference] = useState<string>("system");
  const [defaultModelTier, setDefaultModelTier] = useState("auto");

  // Danger zone
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  // Load settings
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const data = await res.json();

        setName(data.profile.name || "");
        setEmail(data.profile.email || "");
        setCompanyName(data.settings.company_name || "");
        setIndustry(data.settings.industry || "");
        setTeamSize(data.settings.team_size || "");
        setCustomerVolume(data.settings.customer_volume || "");
        setBusinessType(data.settings.business_type || "");

        setEmailErrors(data.settings.notification_email_errors);
        setEmailTasks(data.settings.notification_email_tasks);
        setEmailWeekly(data.settings.notification_email_weekly);
        setInappMode(data.settings.notification_inapp || "all");
        setStatusAlerts(data.settings.notification_status_alerts);

        setDefaultModelTier(data.settings.default_model_tier || "auto");

        // Determine theme preference from localStorage
        const stored = localStorage.getItem("ai-market-theme");
        if (!stored) {
          setThemePreference("system");
        } else {
          setThemePreference(stored);
        }
      } catch {
        showToast("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company_name: companyName, industry, team_size: teamSize, customer_volume: customerVolume, business_type: businessType }),
      });
      if (res.ok) {
        showToast("Profile saved successfully", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword() {
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("Password must contain an uppercase letter");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setPasswordError("Password must contain a lowercase letter");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("Password must contain a number");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        showToast("Password changed successfully", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setPasswordError(data.error || "Failed to change password");
      }
    } catch {
      setPasswordError("Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  async function saveNotifications() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notification_email_errors: emailErrors,
          notification_email_tasks: emailTasks,
          notification_email_weekly: emailWeekly,
          notification_inapp: inappMode,
          notification_status_alerts: statusAlerts,
        }),
      });
      if (res.ok) {
        showToast("Notification preferences saved", "success");
      } else {
        showToast("Failed to save notifications", "error");
      }
    } catch {
      showToast("Failed to save notifications", "error");
    } finally {
      setSaving(false);
    }
  }

  function applyTheme(selected: string) {
    setThemePreference(selected);
    if (selected === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const systemTheme = prefersDark ? "dark" : "light";
      localStorage.setItem("ai-market-theme", systemTheme);
      document.documentElement.setAttribute("data-theme", systemTheme);
      if (theme !== systemTheme) toggleTheme();
    } else {
      localStorage.setItem("ai-market-theme", selected);
      document.documentElement.setAttribute("data-theme", selected);
      if (theme !== selected) toggleTheme();
    }
  }

  async function savePreferences() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ default_model_tier: defaultModelTier }),
      });
      if (res.ok) {
        showToast("Preferences saved", "success");
      } else {
        showToast("Failed to save preferences", "error");
      }
    } catch {
      showToast("Failed to save preferences", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  /* ── Password strength indicators ── */
  const pwChecks = [
    { label: "8+ characters", met: newPassword.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "Lowercase letter", met: /[a-z]/.test(newPassword) },
    { label: "Number", met: /[0-9]/.test(newPassword) },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Account"
          message="Are you sure you want to delete your account? This action cannot be undone. All your data, deployments, and agents will be permanently deleted."
          confirmLabel="Delete My Account"
          onConfirm={() => {
            setShowDeleteConfirm(false);
            showToast("Account deletion is not yet available", "error");
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account, security, and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "text-white shadow-lg"
                  : tab.id === "danger"
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
              }`}
              style={
                active && tab.id !== "danger"
                  ? { background: "linear-gradient(135deg, #4F46E5, #6366F1)", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)" }
                  : active && tab.id === "danger"
                    ? { background: "linear-gradient(135deg, #dc2626, #ef4444)", boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)" }
                    : undefined
              }
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div
        className="rounded-2xl border p-6 lg:p-8"
        style={{
          background: "var(--bg-card)",
          borderColor: activeTab === "danger" ? "#dc2626" : "var(--border-primary)",
        }}
      >
        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Profile Information</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">Update your personal and company details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Display Name" value={name} onChange={setName} placeholder="Your name" />
              <Input label="Email" value={email} disabled />
              <Input label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Your company" />
              <Select label="Industry" value={industry} onChange={setIndustry} options={industries} placeholder="Select industry" />
              <Select label="Team Size" value={teamSize} onChange={setTeamSize} options={teamSizes} placeholder="Select team size" />
              <Select label="Monthly Customer Volume" value={customerVolume} onChange={setCustomerVolume} options={customerVolumes} placeholder="Select volume" />
              <Select label="Business Type" value={businessType} onChange={setBusinessType} options={businessTypes} placeholder="Select type" />
            </div>
            <div className="pt-4 border-t border-[var(--border-primary)]">
              <SaveButton onClick={saveProfile} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Security Tab ── */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Change Password</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">Update your password to keep your account secure</p>
            </div>
            <div className="max-w-md space-y-4">
              <Input
                label="Current Password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Enter current password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <Input
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Enter new password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm new password"
              />

              {/* Password requirements */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {pwChecks.map((c) => (
                  <div key={c.label} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: c.met ? "#22c55e" : "var(--border-primary)" }}
                    >
                      {c.met && <Check size={10} className="text-white" />}
                    </div>
                    <span className={c.met ? "text-green-400" : "text-[var(--text-muted)]"}>{c.label}</span>
                  </div>
                ))}
              </div>

              {passwordError && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {passwordError}
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-[var(--border-primary)]">
              <SaveButton onClick={savePassword} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Notifications Tab ── */}
        {activeTab === "notifications" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notification Preferences</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">Choose how and when you want to be notified</p>
            </div>

            {/* Email Notifications */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Agent Errors</p>
                    <p className="text-xs text-[var(--text-muted)]">Get notified when an agent encounters an error</p>
                  </div>
                  <Toggle checked={emailErrors} onChange={setEmailErrors} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Task Completions</p>
                    <p className="text-xs text-[var(--text-muted)]">Get notified when agents complete tasks</p>
                  </div>
                  <Toggle checked={emailTasks} onChange={setEmailTasks} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Weekly Summary</p>
                    <p className="text-xs text-[var(--text-muted)]">Receive a weekly digest of agent activity</p>
                  </div>
                  <Toggle checked={emailWeekly} onChange={setEmailWeekly} />
                </div>
              </div>
            </div>

            {/* In-App Notifications */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">In-App Notifications</h3>
              <div className="flex flex-wrap gap-3">
                {(["all", "errors", "none"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setInappMode(mode)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                      inappMode === mode
                        ? "border-indigo-500 text-white"
                        : "border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                    }`}
                    style={inappMode === mode ? { background: "linear-gradient(135deg, #4F46E5, #6366F1)" } : undefined}
                  >
                    {mode === "all" ? "All Activity" : mode === "errors" ? "Errors Only" : "None"}
                  </button>
                ))}
              </div>
            </div>

            {/* Agent Status Alerts */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Agent Status Alerts</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Agent Down & Quota Warnings</p>
                    <p className="text-xs text-[var(--text-muted)]">Alert when an agent goes down or approaches quota limits</p>
                  </div>
                  <Toggle checked={statusAlerts} onChange={setStatusAlerts} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-primary)]">
              <SaveButton onClick={saveNotifications} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Preferences Tab ── */}
        {activeTab === "preferences" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Preferences</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">Customize your experience and default settings</p>
            </div>

            {/* Theme */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Theme</h3>
              <div className="flex flex-wrap gap-3">
                {(["system", "light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => applyTheme(t)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 capitalize ${
                      themePreference === t
                        ? "border-indigo-500 text-white"
                        : "border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                    }`}
                    style={themePreference === t ? { background: "linear-gradient(135deg, #4F46E5, #6366F1)" } : undefined}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Model Tier */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Default Model Tier</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: "auto", label: "Auto" },
                  { value: "cost-effective", label: "Cost-Effective" },
                  { value: "balanced", label: "Balanced" },
                  { value: "premium", label: "Premium" },
                ].map((tier) => (
                  <button
                    key={tier.value}
                    onClick={() => setDefaultModelTier(tier.value)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                      defaultModelTier === tier.value
                        ? "border-indigo-500 text-white"
                        : "border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                    }`}
                    style={
                      defaultModelTier === tier.value ? { background: "linear-gradient(135deg, #4F46E5, #6366F1)" } : undefined
                    }
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-primary)]">
              <SaveButton onClick={savePreferences} saving={saving} />
            </div>
          </div>
        )}

        {/* ── Billing Tab ── */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Billing & Subscription</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">Manage your plan and view usage</p>
            </div>

            {/* Current Plan */}
            <div className="rounded-xl p-5 border border-indigo-500/30" style={{ background: "rgba(79,70,229,0.05)" }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Current Plan</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">Starter</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Up to 5 AI employees · 10K interactions/mo</p>
                </div>
                <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}>
                  Upgrade Plan
                </button>
              </div>
            </div>

            {/* Usage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "AI Employees", value: "3 / 5", pct: 60 },
                { label: "Interactions", value: "4,230 / 10,000", pct: 42 },
                { label: "Storage", value: "1.2 GB / 5 GB", pct: 24 },
              ].map((u) => (
                <div key={u.label} className="rounded-xl p-4" style={{ background: "var(--bg-main)", border: "1px solid var(--border-primary)" }}>
                  <p className="text-xs text-[var(--text-muted)] mb-1">{u.label}</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{u.value}</p>
                  <div className="h-1.5 rounded-full mt-2" style={{ background: "var(--border-primary)" }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${u.pct}%`, background: u.pct > 80 ? "#EF4444" : "#4F46E5" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Invoices */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Recent Invoices</h3>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-primary)" }}>
                {[
                  { date: "Apr 1, 2026", amount: "$49.00", status: "Paid" },
                  { date: "Mar 1, 2026", amount: "$49.00", status: "Paid" },
                  { date: "Feb 1, 2026", amount: "$29.00", status: "Paid" },
                ].map((inv, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 text-sm" style={{ background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-main)", borderBottom: "1px solid var(--border-primary)" }}>
                    <span style={{ color: "var(--text-primary)" }}>{inv.date}</span>
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{inv.amount}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">{inv.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Danger Zone ── */}
        {activeTab === "danger" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">Irreversible and destructive actions</p>
            </div>

            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-4 rounded-xl border border-red-500/30"
                style={{ background: "rgba(239, 68, 68, 0.05)" }}
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Export Data</p>
                  <p className="text-xs text-[var(--text-muted)]">Download all your data as a ZIP file</p>
                </div>
                <button
                  onClick={() => showToast("Coming soon — data export is not yet available", "error")}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <Download size={14} />
                  Export
                </button>
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-xl border border-red-500/30"
                style={{ background: "rgba(239, 68, 68, 0.05)" }}
              >
                <div>
                  <p className="text-sm font-medium text-red-400">Delete Account</p>
                  <p className="text-xs text-[var(--text-muted)]">Permanently delete your account and all associated data</p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
