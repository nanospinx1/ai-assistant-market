"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/layout/Providers";
import {
  Star,
  Check,
  ArrowLeft,
  Shield,
  Zap,
  Clock,
  Users,
} from "lucide-react";
import { AIEmployee } from "@/lib/types";

const demoReviews = [
  {
    id: 1,
    author: "Jessica M.",
    company: "TechFlow Inc.",
    rating: 5,
    date: "2 weeks ago",
    text: "Absolutely transformed our workflow. Setup was seamless and the results were immediate. Highly recommend!",
  },
  {
    id: 2,
    author: "Ryan K.",
    company: "StartUp Labs",
    rating: 4,
    date: "1 month ago",
    text: "Great AI employee. Handles most tasks autonomously and the reporting is excellent. Would love more customization options.",
  },
  {
    id: 3,
    author: "Sarah L.",
    company: "GlobalRetail Co.",
    rating: 5,
    date: "3 weeks ago",
    text: "We replaced two manual processes with this AI employee. ROI was positive within the first month.",
  },
];

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<AIEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [purchasing, setPurchasing] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data: AIEmployee[]) => {
        const found = data.find((e) => e.id === id);
        setEmployee(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleHire = async () => {
    if (!user || !employee) return;
    setPurchasing(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employee.id,
          plan,
          user_id: user.id || user.email,
        }),
      });
      if (res.ok) {
        router.push(
          `/deploy/${employee.id}?plan=${plan}&purchased=true`
        );
      }
    } catch {
      // handle error silently
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="h-8 w-48 bg-[var(--bg-card)] rounded-lg animate-pulse" />
        <div className="h-64 bg-[var(--bg-card)] rounded-2xl animate-pulse" />
        <div className="h-48 bg-[var(--bg-card)] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-2xl font-bold mb-2">Employee Not Found</h2>
        <p className="text-[var(--text-muted)] mb-6">
          The AI employee you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const yearlySavings = employee.price_monthly * 12 - (employee.price_yearly || 0);
  const price =
    plan === "yearly" ? employee.price_yearly || 0 : employee.price_monthly;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-white mb-6 transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back to Marketplace
      </Link>

      {/* Header */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <span className="text-7xl">{employee.avatar}</span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{employee.name}</h1>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary-light)] border border-[var(--primary)]/20">
                {employee.category}
              </span>
            </div>
            <p className="text-lg text-[var(--primary-light)] mb-3">
              {employee.role}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.round(employee.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-[var(--text-muted)]"
                    }
                  />
                ))}
                <span className="text-sm font-medium ml-1">
                  {employee.rating}
                </span>
              </div>
              <span className="text-sm text-[var(--text-muted)]">
                {employee.reviews_count} reviews
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {employee.long_description || employee.description}
            </p>
          </div>

          {/* Capabilities */}
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold mb-4">Capabilities</h2>
            <div className="flex flex-wrap gap-2">
              {employee.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-dark)] text-sm text-[var(--text-secondary)] border border-[var(--border)]"
                >
                  <Check size={14} className="text-[var(--success)]" />
                  {cap}
                </span>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold mb-4">Key Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Zap,
                  title: "Instant Setup",
                  desc: "Deploy in under 5 minutes with guided configuration",
                },
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  desc: "SOC 2 compliant with end-to-end encryption",
                },
                {
                  icon: Clock,
                  title: "24/7 Availability",
                  desc: "Works around the clock without breaks or downtime",
                },
                {
                  icon: Users,
                  title: "Team Integration",
                  desc: "Seamlessly works alongside your existing team",
                },
              ].map((feat) => (
                <div
                  key={feat.title}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-dark)] border border-[var(--border)]"
                >
                  <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <feat.icon size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{feat.title}</h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
            <div className="space-y-4">
              {demoReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-sm">
                        {review.author}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] ml-2">
                        {review.company}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {review.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-[var(--text-muted)]"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar — Pricing */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>

            {/* Plan toggle */}
            <div className="flex rounded-xl bg-[var(--bg-dark)] p-1 mb-6">
              <button
                onClick={() => setPlan("monthly")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  plan === "monthly"
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPlan("yearly")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  plan === "yearly"
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                Yearly
              </button>
            </div>

            {/* Price display */}
            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">${price}</span>
                <span className="text-[var(--text-muted)]">
                  /{plan === "yearly" ? "yr" : "mo"}
                </span>
              </div>
              {plan === "yearly" && yearlySavings > 0 && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20">
                  Save ${yearlySavings}/year
                </span>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handleHire}
              disabled={purchasing || !user}
              className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 animate-pulse-glow"
            >
              {purchasing
                ? "Processing..."
                : !user
                  ? "Sign in to Hire"
                  : "Hire This Employee"}
            </button>

            <ul className="mt-4 space-y-2 text-xs text-[var(--text-muted)]">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-[var(--success)]" />
                Cancel anytime
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-[var(--success)]" />
                14-day free trial
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-[var(--success)]" />
                Full API access included
              </li>
            </ul>
          </div>

          {/* Related Employees */}
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6">
            <h3 className="text-sm font-semibold mb-3 text-[var(--text-secondary)]">
              Related Employees
            </h3>
            <div className="space-y-3">
              {[
                {
                  name: "Sarah",
                  role: "Customer Support Agent",
                  avatar: "👩‍💼",
                  id: "emp-customer-support",
                },
                {
                  name: "Marcus",
                  role: "Sales Development Rep",
                  avatar: "👨‍💼",
                  id: "emp-sales-assistant",
                },
                {
                  name: "Priya",
                  role: "Data Analyst",
                  avatar: "👩‍🔬",
                  id: "emp-data-analyst",
                },
              ]
                .filter((r) => r.id !== employee.id)
                .slice(0, 2)
                .map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/marketplace/${rel.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    <span className="text-2xl">{rel.avatar}</span>
                    <div>
                      <p className="text-sm font-medium">{rel.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {rel.role}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
