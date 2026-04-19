"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Mail, Lock, User, Building2, ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
        await new Promise((resolve) => setTimeout(resolve, 1500));
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-8 relative overflow-hidden">
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
          <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">
            Create Account
          </h1>
          <p className="text-[#94A3B8]">
            Join the AI Assistant Marketplace
          </p>
        </div>

        {/* Success toast */}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4 text-emerald-300 text-sm font-medium animate-fade-in">
            <CheckCircle size={18} />
            Account created! Signing you in...
          </div>
        )}

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#141B2D] border border-[#1E293B] rounded-2xl p-8 flex flex-col gap-5"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#0B1120] border border-[#1E293B] rounded-xl text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#0B1120] border border-[#1E293B] rounded-xl text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Company (optional)</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
                className="w-full pl-10 pr-4 py-3 bg-[#0B1120] border border-[#1E293B] rounded-xl text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-11 py-3 bg-[#0B1120] border border-[#1E293B] rounded-xl text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition-colors"
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
          <p className="text-[#94A3B8] text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#64748B] text-sm justify-center hover:text-[#94A3B8] transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
