"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useState } from "react";

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
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[var(--bg-card)] border-r border-[var(--border)] z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 p-6 border-b border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">AI Market</h1>
              <p className="text-xs text-[var(--text-muted)]">Hire. Deploy. Scale.</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--primary)] text-white shadow-lg shadow-indigo-500/20"
                      : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-sm font-bold">
                {user?.name?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
              className="flex items-center gap-3 w-full px-4 py-2 mt-2 text-sm text-[var(--text-muted)] hover:text-[var(--danger)] rounded-lg transition-colors"
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
