"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Mail, Lock, User, Building2, ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff, Shield, Sparkles } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, company }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create account. Please try again.");
        setSuccess(false);
      } else {
        setSuccess(true);
        if (data.verification_required) {
          setVerificationRequired(true);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          window.location.href = "/dashboard";
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Show verification modal after signup
  if (verificationRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden" style={{ background: "var(--bg-primary)" }}>
        <div className="absolute -top-1/4 -right-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-1/4 -left-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-[480px] animate-fade-in">
          {/* Verification Card */}
          <div
            className="rounded-2xl p-10 text-center relative overflow-hidden"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            {/* Decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            <div className="relative">
              {/* Animated envelope icon */}
              <div className="mx-auto mb-6 relative">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                  <Mail size={36} className="text-indigo-400" />
                </div>
                <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
                  <Sparkles size={14} className="text-white" />
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Check Your Inbox
              </h1>
              <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                We&apos;ve sent a verification code to
              </p>
              <p className="text-base font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
                {email}
              </p>

              {/* Steps */}
              <div
                className="rounded-xl p-5 mb-6 text-left"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
                  Almost there — just one more step
                </p>
                <div className="space-y-3">
                  {[
                    { num: "1", text: "Open the email from AI Market", done: false },
                    { num: "2", text: "Copy the 6-character verification code", done: false },
                    { num: "3", text: "Enter it on the next page to activate your account", done: false },
                  ].map((step) => (
                    <div key={step.num} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10">
                        <span className="text-xs font-bold text-indigo-400">{step.num}</span>
                      </div>
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <Shield size={14} className="text-emerald-400" />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Email verification keeps your account secure
                </span>
              </div>

              {/* CTA */}
              <Link
                href="/auth/verify"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm gradient-primary transition-shadow hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Enter Verification Code
                <ArrowRight size={16} />
              </Link>

              <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
                Didn&apos;t receive the email? Check your spam folder or resend from the verification page.
              </p>
            </div>
          </div>
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
            <Bot size={32} className="text-white" />
          </div>
          <p className="text-sm font-semibold text-indigo-400 tracking-wide mb-2">AI Market</p>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Create Account
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Join the AI Assistant Marketplace
          </p>
        </div>

        {/* Success toast */}
        {success && !verificationRequired && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4 text-emerald-500 text-sm font-medium animate-fade-in">
            <CheckCircle size={18} />
            Account created! Signing you in...
          </div>
        )}

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 flex flex-col gap-5"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Company (optional)</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-11 py-3 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Creating account...
              </>
            ) : (
              <>
                Create Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="text-center mt-6 flex flex-col gap-3">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm justify-center transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
