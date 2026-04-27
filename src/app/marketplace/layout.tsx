"use client";

import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";
import { useAuth } from "@/components/layout/Providers";
import Sidebar from "@/components/layout/Sidebar";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import GlobalAIPanel from "@/components/GlobalAIPanel";

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Loading state — brief flash guard
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </div>
    );
  }

  // Authenticated: show within sidebar layout
  if (user) {
    return (
      <AIAssistantProvider>
        <div className="min-h-screen">
          <Sidebar />
          <main className="lg:ml-64 min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-8 pt-16 lg:pt-8">{children}</div>
          </main>
        </div>
        <GlobalAIPanel />
      </AIAssistantProvider>
    );
  }

  // Public: show standalone header
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--text-primary)]">AI Market</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Link>
            <div className="h-5 w-px bg-[var(--border)]" />
            <Link
              href="/auth/login"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white gradient-primary transition-shadow hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
