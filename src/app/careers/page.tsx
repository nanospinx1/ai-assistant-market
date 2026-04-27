"use client";

import Link from "next/link";
import {
  Bot,
  Sun,
  Moon,
  Globe,
  Heart,
  BookOpen,
  Gift,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Code2,
  Palette,
  Headphones,
  Server,
  PenTool,
  Brain,
  Users,
  Zap,
  Mail,
} from "lucide-react";
import { useTheme } from "@/components/layout/Providers";

const perks = [
  {
    icon: Globe,
    title: "Remote-First",
    description:
      "Work from anywhere in the world. We're distributed across 8 countries.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Heart,
    title: "Meaningful Impact",
    description:
      "Your work directly helps thousands of small businesses thrive.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: BookOpen,
    title: "Growth & Learning",
    description:
      "Annual learning budget, mentorship programs, and weekly knowledge shares.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Gift,
    title: "Great Benefits",
    description:
      "Competitive salary, equity, unlimited PTO, health coverage, and home office stipend.",
    color: "from-amber-500 to-orange-500",
  },
];

const openings = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    icon: Code2,
  },
  {
    title: "ML/AI Engineer",
    department: "AI",
    location: "Remote",
    type: "Full-time",
    icon: Brain,
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    icon: Palette,
  },
  {
    title: "Customer Success Manager",
    department: "Operations",
    location: "Remote",
    type: "Full-time",
    icon: Headphones,
  },
  {
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    icon: Server,
  },
  {
    title: "Technical Writer",
    department: "Content",
    location: "Remote",
    type: "Full-time",
    icon: PenTool,
  },
];

export default function CareersPage() {
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
                className="transition-colors hover:text-[var(--text-primary)]"
              >
                About
              </Link>
              <Link
                href="/careers"
                className="text-[var(--text-primary)]"
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
        <div className="pointer-events-none absolute top-10 right-1/4 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-600/8 blur-3xl" />

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
            We&apos;re Hiring
          </div>

          <h1
            className="mb-6 text-5xl font-extrabold leading-tight tracking-tight lg:text-6xl"
            style={{ color: "var(--text-primary)" }}
          >
            Shape the Future of{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              AI at Work
            </span>
          </h1>

          <p
            className="mx-auto max-w-2xl text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            We&apos;re building the platform that brings AI employees to every
            small business. Join us.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <a
              href="#positions"
              className="inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-base font-semibold text-white gradient-primary transition-shadow hover:shadow-lg hover:shadow-indigo-500/25"
            >
              View Open Roles
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Why Join Us ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <h2
              className="mb-4 text-3xl font-bold md:text-4xl"
              style={{ color: "var(--text-primary)" }}
            >
              Why Join Us
            </h2>
            <p
              className="mx-auto max-w-2xl text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              We invest in our people as much as our product.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((perk) => (
              <div
                key={perk.title}
                className="group rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg-card)",
                }}
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${perk.color}`}
                  style={{ opacity: 0.9 }}
                >
                  <perk.icon className="h-6 w-6 text-white" />
                </div>
                <h3
                  className="mb-2 text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {perk.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {perk.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Culture ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div
            className="mx-auto max-w-4xl rounded-2xl border p-10 md:p-14"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg-card)",
            }}
          >
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                    <Users
                      className="h-6 w-6"
                      style={{ color: "var(--accent)" }}
                    />
                  </div>
                  <h2
                    className="text-2xl font-bold md:text-3xl"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Our Culture
                  </h2>
                </div>
                <p
                  className="leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  We&apos;re a fast-paced team of builders who ship early and
                  iterate often. Our autonomous squads own their domains
                  end-to-end, from ideation to production. Every decision is
                  driven by customer impact, and every voice matters — whether
                  you joined last week or were here from day one.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, label: "Ship Fast" },
                  { icon: Users, label: "Autonomous Teams" },
                  { icon: Heart, label: "Customer-Driven" },
                  { icon: Globe, label: "Fully Distributed" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border p-4 text-center"
                    style={{
                      borderColor: "var(--border-light)",
                      background: "var(--bg-surface)",
                    }}
                  >
                    <item.icon
                      className="mx-auto mb-2 h-6 w-6"
                      style={{ color: "var(--accent)" }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Open Positions ─── */}
      <section id="positions" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <h2
              className="mb-4 text-3xl font-bold md:text-4xl"
              style={{ color: "var(--text-primary)" }}
            >
              Open Positions
            </h2>
            <p
              className="mx-auto max-w-2xl text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              We don&apos;t have any open positions at the moment, but we&apos;re always on the lookout for exceptional talent. Check back soon or send us your resume.
            </p>
          </div>

          <div className="mx-auto max-w-lg text-center">
            <div
              className="rounded-2xl border p-10"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-card)",
              }}
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                <Mail className="h-7 w-7" style={{ color: "var(--accent)" }} />
              </div>
              <h3
                className="mb-2 text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Stay Connected
              </h3>
              <p
                className="mb-6 text-sm leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                Interested in joining our team? Send your resume and we&apos;ll reach out when a role that fits your skills opens up.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white gradient-primary transition-shadow hover:shadow-lg hover:shadow-indigo-500/25"
              >
                <Mail className="h-4 w-4" />
                Send Your Resume
              </a>
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
