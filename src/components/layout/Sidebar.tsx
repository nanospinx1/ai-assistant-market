"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/layout/Providers";
import {
  LayoutDashboard,
  Store,
  Rocket,
  BarChart3,
  Wrench,
  LogOut,
  Menu,
  X,
  Bot,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/deploy", label: "Deployments", icon: Rocket },
  { href: "/performance", label: "Performance", icon: BarChart3 },
  { href: "/custom-builder", label: "Custom Builder", icon: Wrench },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
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
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="px-3 py-4 border-t border-[var(--border)]">
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
            </div>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 mt-2 text-sm text-[var(--text-muted)] hover:text-[var(--danger)] rounded-xl transition-colors duration-200 hover:bg-red-500/5"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
