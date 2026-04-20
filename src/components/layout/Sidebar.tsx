"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, useTheme } from "@/components/layout/Providers";
import { useAIAssistantOptional } from "@/contexts/AIAssistantContext";
import {
  LayoutDashboard,
  Store,
  Users,
  BarChart3,
  Wrench,
  LogOut,
  Menu,
  X,
  Bot,
  Sun,
  Moon,
  Plug,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

const navGroups = [
  {
    label: "MANAGE",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/deploy", label: "My Employees", icon: Users },
      { href: "/approvals", label: "Approvals", icon: ShieldCheck },
    ],
  },
  {
    label: "HIRE",
    items: [
      { href: "/marketplace", label: "Marketplace", icon: Store },
      { href: "/custom-builder", label: "Custom Builder", icon: Wrench },
    ],
  },
  {
    label: "MONITOR",
    items: [
      { href: "/performance", label: "Performance", icon: BarChart3 },
      { href: "/integrations", label: "Resources", icon: Plug },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const aiAssistant = useAIAssistantOptional();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function fetchCount() {
      try {
        const res = await fetch("/api/approvals?status=pending&limit=100");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setPendingApprovals((data.approvals || []).length);
        }
      } catch {
        // ignore
      }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [user]);

  if (!user) return null;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl border border-[var(--border)] shadow-lg backdrop-blur-sm"
        style={{ background: "var(--bg-card)" }}
      >
        {mobileOpen ? (
          <X size={20} className="text-[var(--text-primary)]" />
        ) : (
          <Menu size={20} className="text-[var(--text-primary)]" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden backdrop-blur-sm"
          style={{ background: "rgba(0, 0, 0, 0.6)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border)",
          boxShadow: "1px 0 20px rgba(79, 70, 229, 0.05)",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-6 py-5 border-b border-[var(--border)] group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
              }}
            >
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-[var(--text-primary)] tracking-tight">
                AI Market
              </h1>
              <p className="text-[11px] font-medium tracking-wider uppercase text-[var(--text-muted)]">
                Hire. Deploy. Scale.
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="px-4 mb-2 text-[10px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "text-white shadow-lg"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                        }`}
                        style={
                          isActive
                            ? {
                                background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
                              }
                            : undefined
                        }
                      >
                        <item.icon size={20} />
                        <span className="flex-1">{item.label}</span>
                        {item.href === "/approvals" && pendingApprovals > 0 && (
                          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
                            {pendingApprovals}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* AI Assistant button */}
          {aiAssistant && (
            <div className="px-3 pb-2">
              <button
                onClick={aiAssistant.toggleAssistant}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.01] group relative"
                style={{
                  background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.1))",
                  border: "1px solid rgba(124,58,237,0.25)",
                }}
              >
                <div className="relative">
                  <Sparkles size={20} className="text-purple-400" />
                  {aiAssistant.shouldPulse && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-purple-300 group-hover:text-purple-200 transition-colors">
                  AI Assistant
                </span>
              </button>
            </div>
          )}

          {/* User section */}
          <div className="px-3 py-4 border-t border-[var(--border)] space-y-2">
            {/* User avatar card */}
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[var(--bg-surface)]">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{
                  background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                }}
              >
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {user?.email}
                </p>
              </div>
              <NotificationBell />
            </div>

            {/* Settings, Theme toggle, Sign Out row */}
            <div className="flex items-center justify-between px-2">
              <Link
                href="/settings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 py-1"
              >
                <SettingsIcon size={16} />
                Settings
              </Link>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors duration-200"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
                className="relative z-10 flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors duration-200 py-1"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
