"use client";

import Link from "next/link";
import {
  Bot,
  Sun,
  Moon,
  Heart,
  Users,
  Eye,
  Lightbulb,
  Rocket,
  Target,
  Award,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "@/components/layout/Providers";

const values = [
  {
    icon: Lightbulb,
    title: "Simplicity First",
    description:
      "We remove complexity so you can focus on what matters — running your business.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Heart,
    title: "Customer Obsession",
    description:
      "Every feature we build starts with a real problem our customers face.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "No hidden fees, no black-box AI. You always know what you're paying for and how it works.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Rocket,
    title: "Continuous Innovation",
    description:
      "We ship improvements weekly, constantly raising the bar for AI employee performance.",
    color: "from-emerald-500 to-teal-500",
  },
];

const team = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-Founder",
    initials: "SC",
    color: "from-indigo-500 to-purple-500",
    bio: "Former VP at Salesforce. Passionate about making enterprise tech accessible to SMBs.",
  },
  {
    name: "Marcus Johnson",
    role: "CTO & Co-Founder",
    initials: "MJ",
    color: "from-emerald-500 to-teal-500",
    bio: "Ex-Google engineer. Built distributed systems serving millions of users.",
  },
  {
    name: "Priya Patel",
    role: "Head of AI",
    initials: "PP",
    color: "from-pink-500 to-rose-500",
    bio: "PhD in Machine Learning from Stanford. Led AI research teams at OpenAI.",
  },
  {
    name: "David Kim",
    role: "Head of Customer Success",
    initials: "DK",
    color: "from-amber-500 to-orange-500",
    bio: "10+ years helping businesses scale. Previously led CS at HubSpot.",
  },
];

const stats = [
  { value: "500+", label: "Businesses Served", icon: Building2 },
  { value: "10M+", label: "Tasks Completed", icon: CheckCircle2 },
  { value: "99.9%", label: "Uptime", icon: Clock },
  { value: "4.9/5", label: "Customer Rating", icon: Star },
];

export default function AboutPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-main)" }}
    >
      {/* ─── Header ─── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          borderColor: "var(--border)",
          background:
            theme === "dark"
              ? "rgba(11, 17, 32, 0.85)"
              : "rgba(248, 250, 252, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--text-primary)]">
              AI Market
            </span>
          </Link>

          <div className="flex items-center gap-8">
            <div
              className="hidden items-center gap-6 text-sm font-medium md:flex"
              style={{ color: "var(--text-secondary)" }}
            >
              <Link
                href="/marketplace"
                className="transition-colors hover:text-[var(--text-primary)]"
              >
                Marketplace
              </Link>
              <Link
                href="/about"
                className="text-[var(--text-primary)]"
              >
                About
              </Link>
              <Link
                href="/careers"
                className="transition-colors hover:text-[var(--text-primary)]"
              >
                Careers
              </Link>
              <Link
                href="/auth/login"
                className="transition-colors hover:text-[var(--text-primary)]"
              >
                Sign In
              </Link>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              href="/auth/signup"
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white gradient-primary transition-shadow hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pt-24 pb-20">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(79,70,229,0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="pointer-events-none absolute top-10 left-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-80 w-80 rounded-full bg-emerald-600/8 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
            style={{
              borderColor: "var(--border-light)",
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
            }}
          >
            <Sparkles className="h-4 w-4" style={{ color: "var(--accent)" }} />
            About AI Market
          </div>

          <h1
            className="mb-6 text-5xl font-extrabold leading-tight tracking-tight lg:text-6xl"
            style={{ color: "var(--text-primary)" }}
          >
            Building the Future{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              of Work
            </span>
          </h1>

          <p
            className="mx-auto max-w-2xl text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            AI Market makes it effortless for small businesses to hire, deploy,
            and manage AI employees — no technical expertise required.
          </p>
        </div>
      </section>

      {/* ─── Mission ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div
            className="mx-auto max-w-4xl rounded-2xl border p-10 md:p-14 text-center"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg-card)",
            }}
          >
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <Target
                className="h-7 w-7"
                style={{ color: "var(--accent)" }}
              />
            </div>
            <h2
              className="mb-4 text-2xl font-bold md:text-3xl"
              style={{ color: "var(--text-primary)" }}
            >
              Our Mission
            </h2>
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Our mission is to democratize AI for every business. We believe
              small businesses deserve the same AI-powered workforce that
              enterprises enjoy, without the complexity or cost.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Story ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2
                className="mb-4 text-3xl font-bold md:text-4xl"
                style={{ color: "var(--text-primary)" }}
              >
                Our Story
              </h2>
              <div
                className="mx-auto h-1 w-16 rounded-full gradient-primary"
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div
                className="rounded-2xl border p-8"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg-card)",
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                    <Award
                      className="h-5 w-5"
                      style={{ color: "var(--accent)" }}
                    />
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Founded 2024
                  </span>
                </div>
                <p
                  className="leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  AI Market started when our founders noticed small businesses
                  struggling to adopt AI. They were spending thousands on
                  consultants, dealing with complex integrations, and still not
                  getting results.
                </p>
              </div>

              <div
                className="rounded-2xl border p-8"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg-card)",
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                    <Rocket
                      className="h-5 w-5"
                      style={{ color: "var(--accent)" }}
                    />
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    The Solution
                  </span>
                </div>
                <p
                  className="leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  AI Market was born to change that — a simple marketplace where
                  you can hire an AI employee as easily as posting a job listing.
                  No consultants, no complex integrations, just results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Values ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <h2
              className="mb-4 text-3xl font-bold md:text-4xl"
              style={{ color: "var(--text-primary)" }}
            >
              Our Values
            </h2>
            <p
              className="mx-auto max-w-2xl text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              The principles that guide every decision we make.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="group rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg-card)",
                }}
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${v.color}`}
                  style={{ opacity: 0.9 }}
                >
                  <v.icon className="h-6 w-6 text-white" />
                </div>
                <h3
                  className="mb-2 text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {v.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── By the Numbers ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <h2
              className="mb-4 text-3xl font-bold md:text-4xl"
              style={{ color: "var(--text-primary)" }}
            >
              By the Numbers
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border p-8 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg-card)",
                }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                  <stat.icon
                    className="h-6 w-6"
                    style={{ color: "var(--accent)" }}
                  />
                </div>
                <div
                  className="mb-2 text-4xl font-extrabold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-sm font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div
            className="relative overflow-hidden rounded-2xl border p-12 md:p-16 text-center"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg-surface)",
            }}
          >
            <div className="pointer-events-none absolute top-0 left-1/4 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-emerald-600/8 blur-3xl" />

            <div className="relative">
              <h2
                className="mb-4 text-3xl font-bold md:text-4xl"
                style={{ color: "var(--text-primary)" }}
              >
                Join the AI Workforce Revolution
              </h2>
              <p
                className="mx-auto mb-8 max-w-xl text-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                Start hiring AI employees today and transform the way your
                business operates.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-base font-semibold text-white gradient-primary transition-shadow hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        className="border-t py-10 mt-auto"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-surface)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[var(--text-primary)]">
              AI Market
            </span>
          </Link>
          <p
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            © 2026 AI Market. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
