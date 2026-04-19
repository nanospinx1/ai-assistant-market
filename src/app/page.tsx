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
} from "lucide-react";

const featuredEmployees = [
  {
    emoji: "🤖",
    name: "Sarah",
    role: "Customer Support Agent",
    description: "Handles tickets, live chat, and email support 24/7",
    price: "$199/mo",
    rating: 4.9,
    hires: "2.4k",
  },
  {
    emoji: "📊",
    name: "Alex",
    role: "Data Analyst",
    description: "Transforms raw data into actionable business insights",
    price: "$299/mo",
    rating: 4.8,
    hires: "1.8k",
  },
  {
    emoji: "✍️",
    name: "Maya",
    role: "Content Writer",
    description: "Creates SEO-optimized blogs, emails, and social posts",
    price: "$249/mo",
    rating: 4.9,
    hires: "3.1k",
  },
  {
    emoji: "📅",
    name: "James",
    role: "Executive Assistant",
    description: "Manages schedules, emails, and administrative tasks",
    price: "$199/mo",
    rating: 4.7,
    hires: "1.5k",
  },
];

const steps = [
  {
    number: "01",
    title: "Browse",
    description:
      "Explore our marketplace of pre-trained AI employees ready to work for your business.",
    icon: Users,
  },
  {
    number: "02",
    title: "Hire",
    description:
      "Select the AI employees that match your needs and customize them to your workflows.",
    icon: Zap,
  },
  {
    number: "03",
    title: "Deploy",
    description:
      "Deploy in minutes. Your AI employees start working immediately — no onboarding required.",
    icon: ArrowRight,
  },
];

const benefits = [
  {
    icon: Clock,
    title: "24/7 Availability",
    description:
      "Your AI employees never sleep, take breaks, or call in sick. Round-the-clock productivity.",
  },
  {
    icon: Zap,
    title: "Cost Savings",
    description:
      "Save up to 80% compared to traditional hiring. No benefits, office space, or equipment needed.",
  },
  {
    icon: Users,
    title: "Instant Scaling",
    description:
      "Scale your team up or down instantly. Add or remove AI employees as your business needs change.",
  },
  {
    icon: Shield,
    title: "No Training Needed",
    description:
      "Every AI employee comes pre-trained and ready to work. Deploy and see results from day one.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-dark)" }}>
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl"
        style={{
          borderColor: "var(--border)",
          background: "rgba(15, 23, 42, 0.8)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="gradient-primary flex h-9 w-9 items-center justify-center rounded-lg"
            >
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              AI Market
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/marketplace"
              className="text-sm transition-colors hover:text-white"
              style={{ color: "var(--text-secondary)" }}
            >
              Marketplace
            </Link>
            <Link
              href="/auth/login"
              className="text-sm transition-colors hover:text-white"
              style={{ color: "var(--text-secondary)" }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="gradient-primary rounded-lg px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
        {/* Background grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--text-secondary) 1px, transparent 1px), linear-gradient(90deg, var(--text-secondary) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Gradient orbs */}
        <div
          className="pointer-events-none absolute top-20 left-1/4 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "var(--primary)" }}
        />
        <div
          className="pointer-events-none absolute top-40 right-1/4 h-[400px] w-[400px] rounded-full opacity-15 blur-[120px]"
          style={{ background: "var(--accent)" }}
        />

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg-card)",
              color: "var(--accent)",
            }}
          >
            <Zap className="h-4 w-4" />
            <span>Now powering 10,000+ small businesses</span>
          </div>

          <h1
            className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl"
            style={{ color: "var(--text-primary)" }}
          >
            Hire{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
              }}
            >
              AI Employees
            </span>{" "}
            for Your Business
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed md:text-xl"
            style={{ color: "var(--text-secondary)" }}
          >
            Scale your small business without scaling your headcount. Our
            marketplace of AI employees handles customer support, data analysis,
            content creation, and more — starting at just $199/month.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="gradient-primary inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
              style={{
                boxShadow: "0 0 30px rgba(99, 102, 241, 0.3)",
              }}
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-xl border px-8 py-4 text-lg font-semibold transition-all hover:bg-white/5"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              Browse Marketplace
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="mx-auto mt-16 flex max-w-3xl flex-wrap items-center justify-center gap-8 rounded-2xl border p-6 md:gap-16"
            style={{
              borderColor: "var(--border)",
              background: "rgba(30, 41, 59, 0.5)",
              backdropFilter: "blur(12px)",
            }}
          >
            {[
              { value: "10K+", label: "Businesses" },
              { value: "50+", label: "AI Employees" },
              { value: "99.9%", label: "Uptime" },
              { value: "4.9★", label: "Avg. Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-2xl font-bold md:text-3xl"
                  style={{ color: "var(--text-primary)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="mt-1 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24" style={{ background: "rgba(30, 41, 59, 0.3)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2
              className="text-3xl font-bold md:text-4xl"
              style={{ color: "var(--text-primary)" }}
            >
              How It Works
            </h2>
            <p
              className="mx-auto mt-4 max-w-xl text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              Get your first AI employee up and running in under 5 minutes.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="card-hover relative rounded-2xl border p-8"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="mb-4 text-sm font-bold tracking-widest"
                  style={{ color: "var(--accent)" }}
                >
                  STEP {step.number}
                </div>
                <div
                  className="gradient-primary mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                >
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <h3
                  className="mb-3 text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured AI Employees */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2
                className="text-3xl font-bold md:text-4xl"
                style={{ color: "var(--text-primary)" }}
              >
                Featured AI Employees
              </h2>
              <p
                className="mt-4 max-w-xl text-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                Our most popular hires — trusted by thousands of businesses.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--accent)" }}
            >
              View all employees
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredEmployees.map((emp) => (
              <div
                key={emp.name}
                className="card-hover group rounded-2xl border p-6"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="mb-4 text-5xl">{emp.emoji}</div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {emp.name}
                </h3>
                <p
                  className="mt-1 text-sm font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  {emp.role}
                </p>
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {emp.description}
                </p>
                <div
                  className="mt-4 flex items-center justify-between border-t pt-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    className="text-lg font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {emp.price}
                  </span>
                  <div
                    className="flex items-center gap-1 text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Star
                      className="h-4 w-4"
                      style={{ color: "#f59e0b", fill: "#f59e0b" }}
                    />
                    {emp.rating} · {emp.hires}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative py-24" style={{ background: "rgba(30, 41, 59, 0.3)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2
              className="text-3xl font-bold md:text-4xl"
              style={{ color: "var(--text-primary)" }}
            >
              Why AI Employees?
            </h2>
            <p
              className="mx-auto mt-4 max-w-xl text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              The smartest way for small businesses to compete with the big guys.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div
                  className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                  }}
                >
                  <benefit.icon
                    className="h-7 w-7"
                    style={{ color: "var(--primary)" }}
                  />
                </div>
                <h3
                  className="mb-2 text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {benefit.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Overview */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2
            className="text-3xl font-bold md:text-4xl"
            style={{ color: "var(--text-primary)" }}
          >
            Simple, Transparent Pricing
          </h2>
          <p
            className="mx-auto mt-4 max-w-xl text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            No hidden fees. No long-term contracts. Cancel anytime.
          </p>

          <div
            className="mt-12 rounded-2xl border p-10"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "var(--accent)" }}
            >
              Starting from
            </div>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span
                className="text-6xl font-extrabold"
                style={{ color: "var(--text-primary)" }}
              >
                $199
              </span>
              <span
                className="text-xl"
                style={{ color: "var(--text-muted)" }}
              >
                /mo
              </span>
            </div>
            <p
              className="mx-auto mt-4 max-w-md text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              Per AI employee. Each one works 24/7, handles thousands of tasks,
              and costs less than a single hour of traditional labor per day.
            </p>
            <div
              className="mx-auto mt-8 grid max-w-md gap-3 text-left text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {[
                "Unlimited tasks & interactions",
                "Custom workflow configuration",
                "Real-time performance dashboard",
                "Priority support included",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs"
                    style={{
                      background: "rgba(34, 197, 94, 0.15)",
                      color: "#22c55e",
                    }}
                  >
                    ✓
                  </div>
                  {feature}
                </div>
              ))}
            </div>
            <Link
              href="/marketplace"
              className="gradient-primary mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Browse Marketplace
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-20 blur-[100px]"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2
            className="text-3xl font-bold md:text-5xl"
            style={{ color: "var(--text-primary)" }}
          >
            Ready to Scale Your Business?
          </h2>
          <p
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Join thousands of small businesses already using AI employees to
            grow faster, reduce costs, and outperform the competition.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="gradient-primary inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:opacity-90"
              style={{ boxShadow: "0 0 30px rgba(99, 102, 241, 0.3)" }}
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-xl border px-8 py-4 text-lg font-semibold transition-all hover:bg-white/5"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-12"
        style={{
          borderColor: "var(--border)",
          background: "rgba(15, 23, 42, 0.8)",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="gradient-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span
              className="font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              AI Market
            </span>
          </div>
          <div
            className="flex items-center gap-6 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <Link
              href="/marketplace"
              className="transition-colors hover:text-white"
            >
              Marketplace
            </Link>
            <Link
              href="/auth/login"
              className="transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="transition-colors hover:text-white"
            >
              Sign Up
            </Link>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} AI Market. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
