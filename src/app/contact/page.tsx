"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Sun,
  Moon,
  ArrowLeft,
  DollarSign,
  Headphones,
  Users,
  Send,
  CheckCircle,
  MapPin,
  Globe,
  BookOpen,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { useTheme } from "@/components/layout/Providers";

const contactMethods = [
  {
    icon: DollarSign,
    title: "Sales",
    description: "Talk to our team about hiring AI employees for your business.",
    email: "sales@nanospinx.com",
  },
  {
    icon: Headphones,
    title: "Support",
    description: "Get help with your existing AI employees.",
    email: "support@nanospinx.com",
  },
  {
    icon: Users,
    title: "Partnerships",
    description: "Explore partnership and integration opportunities.",
    email: "partners@nanospinx.com",
  },
];

const subjectOptions = [
  "General Inquiry",
  "Sales Question",
  "Technical Support",
  "Partnership",
  "Bug Report",
  "Feature Request",
];

export default function ContactPage() {
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
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
      const res = await fetch("/api/contact", {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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

      {/* Hero */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Get in Touch
          </h1>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Have questions? We&apos;d love to hear from you. Choose the best way to reach our team.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.title}
                className="rounded-2xl border p-6 text-center"
                style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
              >
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: "var(--primary-light)" }}
                >
                  <Icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {method.title}
                </h3>
                <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                  {method.description}
                </p>
                <a
                  href={`mailto:${method.email}`}
                  className="text-sm font-medium transition-colors hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  {method.email}
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Form */}
      <section className="pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl border p-8"
            style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  Message Sent!
                </h3>
                <p className="mb-6" style={{ color: "var(--text-muted)" }}>
                  Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="rounded-lg px-6 py-2.5 text-sm font-semibold border transition-colors hover:bg-white/5"
                  style={{ borderColor: "var(--border-light)", color: "var(--text-primary)" }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  Send Us a Message
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                  Fill out the form below and we&apos;ll respond as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                        Name <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500/30"
                        style={{
                          borderColor: "var(--border-light)",
                          background: "var(--bg-surface)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                        Email <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500/30"
                        style={{
                          borderColor: "var(--border-light)",
                          background: "var(--bg-surface)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Subject <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500/30"
                      style={{
                        borderColor: "var(--border-light)",
                        background: "var(--bg-surface)",
                        color: form.subject ? "var(--text-primary)" : "var(--text-muted)",
                      }}
                    >
                      <option value="" disabled>
                        Select a subject
                      </option>
                      {subjectOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Message <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors resize-none focus:ring-2 focus:ring-indigo-500/30"
                      style={{
                        borderColor: "var(--border-light)",
                        background: "var(--bg-surface)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white gradient-primary transition-shadow hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Office / Location */}
      <section className="pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="rounded-2xl border p-8"
            style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
          >
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: "var(--primary-light)" }}
            >
              <MapPin className="h-5 w-5" style={{ color: "var(--accent)" }} />
            </div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              Our Headquarters
            </h3>
            <p className="text-lg font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              San Francisco, CA
            </p>
            <div className="flex items-center justify-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <Globe className="h-4 w-4" />
              <p className="text-sm">
                We&apos;re a remote-first team with members across the globe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "var(--text-primary)" }}>
            Quick Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: "/help", icon: HelpCircle, label: "Help Center" },
              { href: "/docs", icon: BookOpen, label: "Documentation" },
              { href: "/demo", icon: Calendar, label: "Schedule a Demo" },
            ].map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-center gap-2 rounded-xl border px-5 py-3.5 text-sm font-medium transition-all hover:shadow-md"
                  style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-primary)" }}
                >
                  <Icon className="h-4 w-4" style={{ color: "var(--accent)" }} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 mt-auto" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            © 2026 AI Market. All rights reserved.
          </p>
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-secondary)" }}
          >
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
