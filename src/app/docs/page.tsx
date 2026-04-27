"use client";

import Link from "next/link";
import {
  Bot,
  Sun,
  Moon,
  ArrowLeft,
  Code,
  Package,
  Zap,
  Shield,
  Rocket,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Terminal,
  HelpCircle,
  Mail,
} from "lucide-react";
import { useTheme } from "@/components/layout/Providers";

const quickStartSteps = [
  {
    step: 1,
    title: "Create Your Account",
    description: "Sign up and complete your business profile to get started with AI Market.",
  },
  {
    step: 2,
    title: "Hire an AI Employee",
    description: "Browse the marketplace or build a custom AI employee tailored to your needs.",
  },
  {
    step: 3,
    title: "Deploy & Go Live",
    description: "Connect your channels and start automating your business workflows instantly.",
  },
];

const docCategories = [
  {
    icon: Code,
    title: "API Reference",
    description: "REST API documentation for programmatic access to your AI employees.",
    href: "#",
  },
  {
    icon: Package,
    title: "SDKs & Libraries",
    description: "Official client libraries for Python, Node.js, and more.",
    href: "#",
  },
  {
    icon: Zap,
    title: "Webhooks",
    description: "Real-time event notifications for task completion, errors, and updates.",
    href: "#",
  },
  {
    icon: Shield,
    title: "Authentication",
    description: "OAuth 2.0, API keys, and SSO integration guides.",
    href: "#",
  },
  {
    icon: Rocket,
    title: "Deployment Guides",
    description: "Step-by-step guides for web, Slack, email, and API deployment.",
    href: "#",
  },
  {
    icon: GraduationCap,
    title: "Custom Training",
    description: "Upload data, define workflows, and fine-tune your AI employees.",
    href: "#",
  },
];

const sdks = [
  { name: "Python", status: "Available", color: "#3776AB" },
  { name: "Node.js", status: "Available", color: "#339933" },
  { name: "Ruby", status: "Coming Soon", color: "#CC342D" },
  { name: "Go", status: "Coming Soon", color: "#00ADD8" },
];

export default function DocsPage() {
  const { theme, toggleTheme } = useTheme();

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
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--primary-light)" }}>
            <BookOpen className="h-7 w-7" style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Documentation
          </h1>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Everything you need to integrate, customize, and get the most out of your AI employees.
          </p>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: "var(--text-primary)" }}>
            Quick Start Guide
          </h2>
          <p className="text-center mb-10" style={{ color: "var(--text-muted)" }}>
            Get up and running in three simple steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickStartSteps.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border p-6 text-center"
                style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
              >
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white gradient-primary"
                >
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {s.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: "var(--text-primary)" }}>
            Documentation Categories
          </h2>
          <p className="text-center mb-10" style={{ color: "var(--text-muted)" }}>
            Explore our comprehensive guides and references
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {docCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="group rounded-2xl border p-6 transition-all hover:shadow-lg"
                  style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
                >
                  <div
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <Icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
                  </div>
                  <h3 className="text-base font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                    {cat.title}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                    {cat.description}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all"
                    style={{ color: "var(--accent)" }}
                  >
                    View Docs <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Code Example
            </h2>
          </div>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Hire and deploy an AI employee with just a few lines of code.
          </p>
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "#0d1117" }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3 border-b text-xs font-medium"
              style={{ borderColor: "#21262d", color: "#8b949e" }}
            >
              <Code className="h-3.5 w-3.5" />
              hire-employee.ts
            </div>
            <pre className="p-5 overflow-x-auto text-sm leading-relaxed" style={{ color: "#e6edf3" }}>
              <code>
                <span style={{ color: "#8b949e" }}>{"// Hire and deploy an AI employee"}</span>{"\n"}
                <span style={{ color: "#ff7b72" }}>const</span>{" "}
                <span style={{ color: "#e6edf3" }}>employee</span>{" "}
                <span style={{ color: "#ff7b72" }}>=</span>{" "}
                <span style={{ color: "#ff7b72" }}>await</span>{" "}
                <span style={{ color: "#e6edf3" }}>aimarket.employees.</span>
                <span style={{ color: "#d2a8ff" }}>hire</span>
                <span style={{ color: "#e6edf3" }}>({"{"}</span>{"\n"}
                {"  "}<span style={{ color: "#79c0ff" }}>type</span>
                <span style={{ color: "#e6edf3" }}>: </span>
                <span style={{ color: "#a5d6ff" }}>&quot;customer-support&quot;</span>
                <span style={{ color: "#e6edf3" }}>,</span>{"\n"}
                {"  "}<span style={{ color: "#79c0ff" }}>name</span>
                <span style={{ color: "#e6edf3" }}>: </span>
                <span style={{ color: "#a5d6ff" }}>&quot;Sarah&quot;</span>
                <span style={{ color: "#e6edf3" }}>,</span>{"\n"}
                {"  "}<span style={{ color: "#79c0ff" }}>channels</span>
                <span style={{ color: "#e6edf3" }}>: [</span>
                <span style={{ color: "#a5d6ff" }}>&quot;email&quot;</span>
                <span style={{ color: "#e6edf3" }}>, </span>
                <span style={{ color: "#a5d6ff" }}>&quot;chat&quot;</span>
                <span style={{ color: "#e6edf3" }}>, </span>
                <span style={{ color: "#a5d6ff" }}>&quot;slack&quot;</span>
                <span style={{ color: "#e6edf3" }}>],</span>{"\n"}
                {"  "}<span style={{ color: "#79c0ff" }}>training</span>
                <span style={{ color: "#e6edf3" }}>: {"{"}</span>{"\n"}
                {"    "}<span style={{ color: "#79c0ff" }}>documents</span>
                <span style={{ color: "#e6edf3" }}>: [</span>
                <span style={{ color: "#a5d6ff" }}>&quot;./knowledge-base&quot;</span>
                <span style={{ color: "#e6edf3" }}>],</span>{"\n"}
                {"    "}<span style={{ color: "#79c0ff" }}>tone</span>
                <span style={{ color: "#e6edf3" }}>: </span>
                <span style={{ color: "#a5d6ff" }}>&quot;professional-friendly&quot;</span>{"\n"}
                {"  "}<span style={{ color: "#e6edf3" }}>{"}"}</span>{"\n"}
                <span style={{ color: "#e6edf3" }}>{"}"});</span>{"\n"}
                {"\n"}
                <span style={{ color: "#ff7b72" }}>await</span>{" "}
                <span style={{ color: "#e6edf3" }}>employee.</span>
                <span style={{ color: "#d2a8ff" }}>deploy</span>
                <span style={{ color: "#e6edf3" }}>();</span>{"\n"}
                <span style={{ color: "#e6edf3" }}>console.</span>
                <span style={{ color: "#d2a8ff" }}>log</span>
                <span style={{ color: "#e6edf3" }}>(</span>
                <span style={{ color: "#a5d6ff" }}>{"`$" + "{"}</span>
                <span style={{ color: "#e6edf3" }}>{"employee.name"}</span>
                <span style={{ color: "#a5d6ff" }}>{"} is now live!`"}</span>
                <span style={{ color: "#e6edf3" }}>);</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* SDKs Section */}
      <section className="pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Official SDKs
          </h2>
          <p className="mb-8" style={{ color: "var(--text-muted)" }}>
            Integrate AI Market into your stack with our official client libraries.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {sdks.map((sdk) => (
              <div
                key={sdk.name}
                className="flex items-center gap-3 rounded-xl border px-5 py-3"
                style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: sdk.color }}
                />
                <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {sdk.name}
                </span>
                <span
                  className="text-xs font-medium rounded-full px-2.5 py-0.5"
                  style={{
                    background: sdk.status === "Available" ? "rgba(16,185,129,0.12)" : "var(--bg-surface)",
                    color: sdk.status === "Available" ? "#10b981" : "var(--text-muted)",
                  }}
                >
                  {sdk.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6">
        <div
          className="max-w-3xl mx-auto rounded-2xl border p-10 text-center"
          style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
        >
          <HelpCircle className="mx-auto h-8 w-8 mb-4" style={{ color: "var(--accent)" }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Need Help?
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Can&apos;t find what you&apos;re looking for? Our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/help"
              className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white gradient-primary transition-shadow hover:shadow-lg"
            >
              Visit Help Center
            </Link>
            <Link
              href="/contact"
              className="rounded-lg px-6 py-2.5 text-sm font-semibold border transition-colors hover:bg-white/5 inline-flex items-center justify-center gap-2"
              style={{ borderColor: "var(--border-light)", color: "var(--text-primary)" }}
            >
              <Mail className="h-4 w-4" />
              Contact Us
            </Link>
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
