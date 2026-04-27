"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Mail, CheckCircle, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/layout/Providers";
import Link from "next/link";

export default function VerifyPage() {
  const { user, refresh } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already verified
  useEffect(() => {
    if (user?.email_verified) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    const nextIdx = Math.min(pasted.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the full 6-character code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
      } else {
        setVerified(true);
        await refresh();
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      if (res.ok) {
        setResent(true);
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to resend code");
      }
    } catch {
      setError("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-[var(--primary)]" size={32} />
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Background gradient orbs */}
      <div className="absolute -top-1/4 -right-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-1/4 -left-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.1)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-[420px] animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-xl shadow-indigo-500/30">
            {verified ? <CheckCircle size={32} className="text-white" /> : <Mail size={32} className="text-white" />}
          </div>
          <p className="text-sm font-semibold text-indigo-400 tracking-wide mb-2">AI Market</p>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            {verified ? "Email Verified!" : "Verify Your Email"}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {verified
              ? "Redirecting you to your dashboard..."
              : <>We sent a 6-character code to <span className="font-medium text-[var(--text-primary)]">{user.email}</span></>
            }
          </p>
        </div>

        {!verified && (
          <div className="rounded-2xl p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            {/* Code inputs */}
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30 transition-all"
                />
              ))}
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            {resent && (
              <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-sm text-emerald-400 text-center">
                New code sent! Check your inbox.
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || code.join("").length !== 6}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm gradient-primary transition-shadow hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors inline-flex items-center gap-1.5"
              >
                {resending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    Resend code
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--border)] text-center">
              <p className="text-xs text-[var(--text-muted)]">
                Code expires in 15 minutes. Check your spam folder if you don&apos;t see the email.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
