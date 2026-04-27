"use client";

import Sidebar from "@/components/layout/Sidebar";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import GlobalAIPanel from "@/components/GlobalAIPanel";
import { useAuth } from "@/components/layout/Providers";
import Link from "next/link";
import { Mail, Shield, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import { useState } from "react";

function VerificationGate({ children }: { children: React.ReactNode }) {
  const { user, refresh } = useAuth();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  if (!user || user.email_verified !== false) return <>{children}</>;

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      if (res.ok) setResent(true);
    } catch {}
    setResending(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div
          className="rounded-2xl p-10 relative overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="mx-auto mb-5 relative inline-block">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10">
                <Mail size={30} className="text-amber-400" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg">
                <Sparkles size={12} className="text-white" />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Verify Your Email to Continue
            </h2>
            <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              We sent a verification code to
            </p>
            <p className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
              {user.email}
            </p>

            <div
              className="rounded-xl p-4 mb-5 text-left"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} className="text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Why verify?
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Email verification protects your account and ensures you can receive important notifications about your AI employees.
              </p>
            </div>

            <Link
              href="/auth/verify"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm gradient-primary transition-shadow hover:shadow-lg hover:shadow-indigo-500/25 mb-3"
            >
              Enter Verification Code
              <ArrowRight size={16} />
            </Link>

            <button
              onClick={handleResend}
              disabled={resending || resent}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              {resent ? (
                <span className="text-emerald-400">✓ Code resent — check your inbox</span>
              ) : resending ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  Resend verification code
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AIAssistantProvider>
      <div className="min-h-screen">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen flex flex-col">
          <VerificationGate>
            <div className="p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
          </VerificationGate>
        </main>
      </div>
      <GlobalAIPanel />
    </AIAssistantProvider>
  );
}
