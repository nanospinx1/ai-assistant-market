"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  User,
  Building2,
  MessageSquare,
  Send,
  CheckCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/layout/Providers";

export default function ScheduleDemo() {
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    date: "",
    time: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Generate time slots
  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
    "5:00 PM",
  ];

  // Min date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-main)" }}>
        {/* Header */}
        <header className="border-b" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Bot className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                AI Market
              </span>
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Demo Scheduled!
            </h1>
            <p className="text-lg mb-2" style={{ color: "var(--text-secondary)" }}>
              We&apos;ll be in touch shortly to confirm your demo.
            </p>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
              A confirmation email has been sent to <strong style={{ color: "var(--text-primary)" }}>{form.email}</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white gradient-primary transition-shadow hover:shadow-lg"
              >
                Back to Home
              </Link>
              <Link
                href="/marketplace"
                className="rounded-lg px-6 py-2.5 text-sm font-semibold border transition-colors hover:bg-white/5"
                style={{ borderColor: "var(--border-light)", color: "var(--text-primary)" }}
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-main)" }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Bot className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              AI Market
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-6">
          {/* Title */}
          <div className="text-center mb-12">
            <p
              className="mb-2 text-sm font-semibold uppercase tracking-widest"
              style={{ color: "var(--accent)" }}
            >
              See It In Action
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Schedule a Demo
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Get a personalized walkthrough of AI Market and see how AI employees
              can transform your business operations.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-10">
            {/* Left: Info */}
            <div className="md:col-span-2 space-y-6">
              <div
                className="rounded-2xl border p-6"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  What to Expect
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: Clock, text: "30-minute personalized walkthrough" },
                    { icon: User, text: "Live Q&A with our team" },
                    { icon: Bot, text: "See AI employees in action" },
                    { icon: Building2, text: "Custom solutions for your business" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: "var(--bg-surface)" }}
                      >
                        <item.icon size={16} style={{ color: "var(--primary-light)" }} />
                      </div>
                      <span className="text-sm pt-1" style={{ color: "var(--text-secondary)" }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl border p-6"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Trusted by 10,000+ Businesses
                </h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Join thousands of small businesses that have already transformed
                  their operations with AI employees.
                </p>
                <div className="mt-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                  <span className="ml-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    4.9/5
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    (2,400+ reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="md:col-span-3">
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border p-6 md:p-8 space-y-5"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--primary)]"
                        style={{
                          background: "var(--bg-surface)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      Work Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                      <input
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--primary)]"
                        style={{
                          background: "var(--bg-surface)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Company */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      Company Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        required
                        placeholder="Acme Inc."
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--primary)]"
                        style={{
                          background: "var(--bg-surface)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      Your Role
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        placeholder="e.g. CEO, Operations Manager"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--primary)]"
                        style={{
                          background: "var(--bg-surface)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Preferred Date */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      Preferred Date <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                      <input
                        type="date"
                        required
                        min={minDate}
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--primary)]"
                        style={{
                          background: "var(--bg-surface)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Preferred Time */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      Preferred Time <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                      <select
                        required
                        value={form.time}
                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                        className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--primary)] appearance-none"
                        style={{
                          background: "var(--bg-surface)",
                          borderColor: "var(--border)",
                          color: form.time ? "var(--text-primary)" : "var(--text-muted)",
                        }}
                      >
                        <option value="">Select a time</option>
                        {timeSlots.map((t) => (
                          <option key={t} value={t}>{t} (PST)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                    What are you most interested in?
                  </label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-3 top-3" style={{ color: "var(--text-muted)" }} />
                    <textarea
                      rows={3}
                      placeholder="Tell us about your business needs, team size, or specific AI employees you're interested in..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--primary)] resize-none"
                      style={{
                        background: "var(--bg-surface)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white gradient-primary transition-shadow hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Schedule My Demo
                    </>
                  )}
                </button>

                <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  We&apos;ll confirm your demo time within 24 hours. No spam, ever.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
