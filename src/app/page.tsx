"use client";

import Link from "next/link";
import {
  Bot,
  ArrowRight,
  Users,
  Zap,
  Clock,
  Shield,
  Star,
  ChevronRight,
  Headphones,
  TrendingUp,
  Palette,
  Calculator,
  DollarSign,
  Check,
  Quote,
  MessageSquare,
  BarChart3,
  Play,
  Sparkles,
  Building2,
  PlusCircle,
  Wrench,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/layout/Providers";

/* ── Data ── */

const featuredEmployees = [
  {
    name: "Sarah",
    role: "Customer Support Agent",
    description: "Handles tickets, live chat, and email support 24/7",
    price: "$199",
    rating: 4.9,
    icon: Headphones,
    gradient: "from-blue-500 to-cyan-500",
    stripGradient: "from-blue-500 to-cyan-500",
    slug: "emp-customer-support",
  },
  {
    name: "Alex",
    role: "Sales Development Rep",
    description: "Qualifies leads, books demos, and nurtures prospects",
    price: "$299",
    rating: 4.8,
    icon: TrendingUp,
    gradient: "from-emerald-500 to-teal-500",
    stripGradient: "from-emerald-500 to-teal-500",
    slug: "emp-sales-assistant",
  },
  {
    name: "Maya",
    role: "Content Strategist",
    description: "Creates SEO-optimized blogs, emails, and social posts",
    price: "$249",
    rating: 4.9,
    icon: Palette,
    gradient: "from-pink-500 to-rose-500",
    stripGradient: "from-pink-500 to-rose-500",
    slug: "emp-content-writer",
  },
  {
    name: "James",
    role: "Finance Assistant",
    description: "Manages invoices, expense tracking, and financial reports",
    price: "$199",
    rating: 4.7,
    icon: Calculator,
    gradient: "from-amber-500 to-orange-500",
    stripGradient: "from-amber-500 to-orange-500",
    slug: "emp-bookkeeper",
  },
];

const steps = [
  {
    number: 1,
    title: "Browse & Choose",
    description:
      "Explore our marketplace of pre-trained AI employees, filtered by role, industry, and skill set.",
    icon: Users,
  },
  {
    number: 2,
    title: "Configure & Train",
    description:
      "Customize your AI employee with your brand voice, workflows, and business-specific knowledge.",
    icon: Zap,
  },
  {
    number: 3,
    title: "Deploy & Scale",
    description:
      "Go live in minutes. Scale from one AI employee to an entire team as your business grows.",
    icon: ArrowRight,
  },
];

const benefits = [
  {
    icon: Clock,
    title: "24/7 Operations",
    stat: "Always On",
    description:
      "Your AI employees never sleep. Round-the-clock productivity across every timezone.",
  },
  {
    icon: DollarSign,
    title: "Cost Reduction",
    stat: "60%",
    description:
      "Save up to 60% compared to traditional hiring. No benefits, office space, or equipment.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    stat: "5 Min",
    description:
      "Deploy a fully trained AI employee in under five minutes. No onboarding required.",
  },
  {
    icon: Shield,
    title: "Enterprise Reliable",
    stat: "99.9%",
    description:
      "Industry-leading uptime with built-in redundancy and automatic failover.",
  },
];

const testimonials = [
  {
    quote:
      "We replaced a 5-person support team with two AI employees. Response times dropped from hours to seconds.",
    name: "Jessica Chen",
    company: "GrowthCo",
    role: "Head of Operations",
    rating: 5,
  },
  {
    quote:
      "The ROI was immediate. Our AI sales rep books 3x more demos than our previous outbound process.",
    name: "Marcus Rivera",
    company: "ScaleUp Inc.",
    role: "VP of Sales",
    rating: 5,
  },
  {
    quote:
      "Content output went from 4 posts a week to 4 a day. Quality stayed high and our traffic tripled.",
    name: "Priya Sharma",
    company: "TechCorp",
    role: "Marketing Director",
    rating: 5,
  },
];

/* ── Component ── */

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-dark)" }}>
      {/* ─── Navigation ─── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{
          borderColor: "var(--border)",
          background: theme === "dark" ? "rgba(11, 17, 32, 0.7)" : "rgba(248, 250, 252, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary"
            >
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--text-primary)]">AI Market</span>
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
              <Link href="#pricing" className="transition-colors hover:text-[var(--text-primary)]">
                Pricing
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
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background grid pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(79,70,229,0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="pointer-events-none absolute top-20 left-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-emerald-600/8 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
          {/* Left: Copy */}
          <div className="animate-fade-in">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
              style={{
                borderColor: "var(--border-light)",
                background: "var(--bg-card)",
                color: "var(--text-secondary)",
              }}
            >
              <Sparkles className="h-4 w-4" style={{ color: "var(--accent-warm)" }} />
              Trusted by 10,000+ small businesses
            </div>

            <h1
              className="mb-6 text-5xl font-extrabold leading-tight tracking-tight lg:text-6xl"
              style={{ color: "var(--text-primary)" }}
            >
              Your Next Employee
              <br />
              is{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                AI-Powered
              </span>
            </h1>

            <p
              className="mb-8 max-w-lg text-lg leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Hire AI employees that reduce costs by 60%, work around the clock,
              and scale with your business. No resumes, no interviews, no
              overhead.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white gradient-primary transition-shadow hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Browse AI Employees
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/5"
                style={{
                  borderColor: "var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <Play className="h-4 w-4" />
                See How It Works
              </Link>
            </div>
          </div>

          {/* Right: Mock dashboard card */}
          <div className="animate-fade-in hidden lg:block" style={{ animationDelay: "0.2s" }}>
            <div
              className="relative rounded-2xl border p-6 overflow-hidden"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(79,70,229,0.08)",
              }}
            >
              {/* Subtle grid background */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(79,70,229,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.03) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              <div className="relative">
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                      <Headphones className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Sarah - Support Agent</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Customer Support · Online
                      </p>
                    </div>
                  </div>
                  <span className="status-active rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>

                {/* Stats grid */}
                <div
                  className="mb-4 grid grid-cols-3 gap-3 rounded-xl border p-4"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Tasks Done
                    </p>
                    <p className="text-xl font-bold text-[var(--text-primary)]">1,247</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--accent)" }}>↑ 12%</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Avg. Response
                    </p>
                    <p className="text-xl font-bold" style={{ color: "var(--accent)" }}>
                      1.2s
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--accent)" }}>↑ 8%</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Satisfaction
                    </p>
                    <p className="text-xl font-bold" style={{ color: "var(--accent-warm)" }}>
                      98%
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--accent)" }}>↑ 3%</p>
                  </div>
                </div>

                {/* Mini area chart */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Performance (7 days)
                    </p>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--accent)" }}
                    >
                      +23% this week
                    </p>
                  </div>
                  <div className="relative" style={{ height: 56 }}>
                    {/* Area fill */}
                    <div className="absolute inset-0 flex items-end">
                      {[40, 55, 45, 65, 58, 72, 80, 68, 85, 78, 90, 95].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1"
                          style={{
                            height: `${h}%`,
                            background: `linear-gradient(to top, rgba(79,70,229,0.3), rgba(16,185,129,0.05))`,
                            borderTop: "2px solid",
                            borderImage: "linear-gradient(to right, #4F46E5, #10B981) 1",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent activity */}
                <div
                  className="rounded-lg border p-3"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Recent Activity</p>
                  <div className="space-y-2">
                    {[
                      { text: "Resolved ticket #4821", time: "2m ago", color: "var(--accent)" },
                      { text: "Escalated priority issue", time: "8m ago", color: "var(--accent-warm)" },
                      { text: "Closed 3 chat sessions", time: "15m ago", color: "var(--accent)" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.text}</span>
                        </div>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social Proof Bar ─── */}
      <section
        className="border-y py-8"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-surface)",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-6 md:gap-12">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Trusted by teams at
          </span>
          {["TechCorp", "GrowthCo", "ScaleUp", "Launchpad", "NovaBiz"].map(
            (name) => (
              <span
                key={name}
                className="text-sm font-semibold tracking-wide"
                style={{ color: "var(--text-muted)", opacity: 0.6 }}
              >
                {name}
              </span>
            )
          )}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p
              className="mb-2 text-sm font-semibold uppercase tracking-widest"
              style={{ color: "var(--accent)" }}
            >
              Simple Process
            </p>
            <h2
              className="text-4xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              How It Works
            </h2>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connector line */}
            <div
              className="pointer-events-none absolute top-16 right-1/3 left-1/3 hidden h-px md:block"
              style={{
                borderTop: "2px dashed var(--border-light)",
              }}
            />

            {steps.map((step, idx) => {
              const gradients = [
                "linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(16,185,129,0.04) 100%)",
                "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(245,158,11,0.04) 100%)",
                "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(79,70,229,0.04) 100%)",
              ];
              return (
                <div
                  key={step.number}
                  className="card-hover relative flex flex-col items-center rounded-2xl p-8 text-center border"
                  style={{
                    background: gradients[idx],
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white gradient-primary"
                    style={{
                      boxShadow: "0 8px 24px rgba(79,70,229,0.3)",
                    }}
                  >
                    {step.number}
                  </div>
                  <div className="mb-4 h-px w-8 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
                  <step.icon
                    className="mb-4 h-6 w-6"
                    style={{ color: "var(--primary-light)" }}
                  />
                  <h3
                    className="mb-2 text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Request a Demo CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-lg border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-white/5"
              style={{
                borderColor: "var(--border-light)",
                color: "var(--text-primary)",
              }}
            >
              <Play className="h-4 w-4" style={{ color: "var(--primary-light)" }} />
              Request a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Featured Employees ─── */}
      <section
        className="py-24"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p
                className="mb-2 text-sm font-semibold uppercase tracking-widest"
                style={{ color: "var(--accent)" }}
              >
                Top Rated
              </p>
              <h2
                className="text-4xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Featured AI Employees
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="hidden items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[var(--text-primary)] md:flex"
              style={{ color: "var(--primary-light)" }}
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {featuredEmployees.map((emp) => (
              <Link
                key={emp.name}
                href={`/marketplace/${emp.slug}`}
                className="card-hover group overflow-hidden rounded-2xl"
                style={{ background: "var(--bg-card)" }}
              >
                {/* Gradient top strip */}
                <div className={`h-2 w-full bg-gradient-to-r ${emp.stripGradient}`} />

                <div className="p-6">
                  <div
                    className={`mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${emp.gradient} shadow-lg`}
                    style={{ boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}
                  >
                    <emp.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3
                    className="mb-0.5 text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {emp.name}
                  </h3>
                  <p
                    className="mb-2 text-sm"
                    style={{ color: "var(--primary-light)" }}
                  >
                    {emp.role}
                  </p>
                  <p
                    className="mb-5 text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {emp.description}
                  </p>

                  <div className="flex items-center gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5"
                        style={{
                          color:
                            i < Math.floor(emp.rating)
                              ? "var(--accent-warm)"
                              : "var(--border-light)",
                          fill:
                            i < Math.floor(emp.rating)
                              ? "var(--accent-warm)"
                              : "none",
                        }}
                      />
                    ))}
                    <span
                      className="ml-1 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {emp.rating}
                    </span>
                  </div>

                  <div
                    className="flex items-center justify-between border-t pt-4"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="text-lg font-bold text-[var(--text-primary)]">
                      {emp.price}
                      <span
                        className="text-sm font-normal"
                        style={{ color: "var(--text-muted)" }}
                      >
                        /mo
                      </span>
                    </span>
                    <ChevronRight
                      className="h-5 w-5 transition-transform group-hover:translate-x-1"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                </div>
              </Link>
            ))}

            {/* Custom Agent Build Card */}
            <Link
              href="/auth/signup"
              className="card-hover group relative overflow-hidden rounded-2xl flex flex-col items-center justify-center text-center"
              style={{ background: "var(--bg-card)", border: "2px dashed var(--border-light)" }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.05), rgba(16,185,129,0.05))" }} />
              <div className="relative p-6 flex flex-col items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border-2 border-dashed shadow-lg transition-transform group-hover:scale-110"
                  style={{ borderColor: "var(--primary-light)" }}
                >
                  <PlusCircle className="h-8 w-8" style={{ color: "var(--primary-light)" }} />
                </div>
                <div>
                  <h3
                    className="mb-1 text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Build Your Own
                  </h3>
                  <p
                    className="mb-4 text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Create a custom AI employee tailored to your unique business needs
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold transition-colors" style={{ color: "var(--primary-light)" }}>
                  <Wrench className="h-4 w-4" />
                  Start Building
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Benefits ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p
              className="mb-2 text-sm font-semibold uppercase tracking-widest"
              style={{ color: "var(--accent)" }}
            >
              Why AI Market
            </p>
            <h2
              className="text-4xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Built for Business Growth
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="card-hover rounded-2xl border p-8 transition-all"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(79,70,229,0.3)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 24px rgba(79,70,229,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <div className="mb-4 flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: "rgba(79,70,229,0.1)" }}
                  >
                    <b.icon className="h-6 w-6" style={{ color: "var(--primary-light)" }} />
                  </div>
                  <div
                    className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent"
                  >
                    {b.stat}
                  </div>
                </div>
                <h3
                  className="mb-2 text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {b.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section
        className="py-24"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p
              className="mb-2 text-sm font-semibold uppercase tracking-widest"
              style={{ color: "var(--accent)" }}
            >
              Success Stories
            </p>
            <h2
              className="text-4xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Loved by Business Owners
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, idx) => {
              const borderGradients = [
                "linear-gradient(to bottom, #4F46E5, #818CF8)",
                "linear-gradient(to bottom, #10B981, #34D399)",
                "linear-gradient(to bottom, #F59E0B, #FBBF24)",
              ];
              return (
              <div
                key={t.name}
                className="card-hover relative rounded-2xl p-8 overflow-hidden"
                style={{ background: "var(--bg-card)" }}
              >
                {/* Gradient left border accent */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                  style={{ background: borderGradients[idx] }}
                />
                <Quote
                  className="absolute top-6 right-6 h-10 w-10 opacity-20"
                  style={{ color: "var(--primary-light)" }}
                />
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4"
                      style={{ color: "var(--accent-warm)", fill: "var(--accent-warm)" }}
                    />
                  ))}
                </div>
                <p
                  className="mb-6 text-sm leading-relaxed italic"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p
            className="mb-2 text-sm font-semibold uppercase tracking-widest"
            style={{ color: "var(--accent)" }}
          >
            Simple Pricing
          </p>
          <h2
            className="mb-2 text-4xl font-bold lg:text-5xl"
            style={{ color: "var(--text-primary)" }}
          >
            Starting at
          </h2>
          <p className="mb-2 text-5xl font-extrabold lg:text-6xl bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            $199/month
          </p>
          <p
            className="mb-2 text-xl font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            per AI employee
          </p>
          <p
            className="mb-10 text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            No contracts. No hidden fees. Cancel anytime.
          </p>

          <div
            className="mx-auto mb-10 max-w-md rounded-2xl border p-8 text-left"
            style={{
              background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(79,70,229,0.03) 100%)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>
              Everything included
            </p>
            <ul className="space-y-4">
              {[
                "Unlimited conversations & tasks",
                "Custom training on your data",
                "Multi-channel deployment",
                "Real-time analytics dashboard",
                "Priority support",
                "99.9% uptime SLA",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(16,185,129,0.1)" }}>
                    <Check
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--accent)" }}
                    />
                  </div>
                  <span style={{ color: "var(--text-secondary)" }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold text-white gradient-primary transition-shadow hover:shadow-lg hover:shadow-indigo-500/25"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative overflow-hidden py-24">
        {/* Animated gradient border glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(79,70,229,0.06) 0%, transparent 25%, transparent 75%, rgba(16,185,129,0.06) 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(79,70,229,0.3), rgba(16,185,129,0.3), transparent)" }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(16,185,129,0.3), rgba(79,70,229,0.3), transparent)" }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-3xl animate-pulse-glow" />
        <div className="pointer-events-none absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-emerald-600/5 blur-3xl animate-pulse" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2
            className="mb-4 text-4xl font-bold lg:text-5xl"
            style={{ color: "var(--text-primary)" }}
          >
            Ready to Transform Your Business?
          </h2>
          <p
            className="mb-10 text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            Join thousands of businesses that have already hired their first AI
            employee. Start saving time and money today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold text-white gradient-primary transition-shadow hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-lg border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-white/5"
              style={{
                borderColor: "var(--border-light)",
                color: "var(--text-primary)",
              }}
            >
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        className="border-t py-16"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-surface)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-[var(--text-primary)]">AI Market</span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                The marketplace for AI-powered employees that help small
                businesses grow.
              </p>
            </div>

            {/* Links */}
            {[
              {
                heading: "Product",
                links: [
                  { label: "Marketplace", href: "/marketplace" },
                  { label: "Custom Builder", href: "/custom-builder" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Dashboard", href: "/dashboard" },
                ],
              },
              {
                heading: "Company",
                links: [
                  { label: "About", href: "#" },
                  { label: "Careers", href: "#" },
                  { label: "Blog", href: "#" },
                ],
              },
              {
                heading: "Support",
                links: [
                  { label: "Help Center", href: "#" },
                  { label: "Documentation", href: "#" },
                  { label: "Contact Us", href: "#" },
                ],
              },
              {
                heading: "Legal",
                links: [
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                ],
              },
            ].map((col) => (
              <div key={col.heading}>
                <p
                  className="mb-4 text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {col.heading}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:text-[var(--text-primary)]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="mt-12 border-t pt-8 text-center text-sm"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-muted)",
            }}
          >
            &copy; {new Date().getFullYear()} AI Market. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
