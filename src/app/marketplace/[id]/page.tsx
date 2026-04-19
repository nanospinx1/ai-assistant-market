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
  ChevronRight,
  Headphones,
  TrendingUp,
  Palette,
  Calculator,
  BarChart3,
  Monitor,
  Settings,
  Award,
  Heart,
  Briefcase,
  Globe,
  Loader2,
} from "lucide-react";
import { AIEmployee } from "@/lib/types";

const categoryConfig: Record<string, { icon: any; gradient: string }> = {
  "Customer Service": { icon: Headphones, gradient: "from-blue-500 to-cyan-500" },
  "Sales": { icon: TrendingUp, gradient: "from-emerald-500 to-teal-500" },
  "Marketing": { icon: Palette, gradient: "from-pink-500 to-rose-500" },
  "Finance": { icon: Calculator, gradient: "from-amber-500 to-orange-500" },
  "Analytics": { icon: BarChart3, gradient: "from-violet-500 to-purple-500" },
  "Human Resources": { icon: Users, gradient: "from-sky-500 to-blue-500" },
  "IT Support": { icon: Monitor, gradient: "from-slate-400 to-zinc-500" },
  "Operations": { icon: Settings, gradient: "from-indigo-500 to-blue-500" },
};

const defaultConfig = { icon: Briefcase, gradient: "from-gray-500 to-slate-500" };

function getCategoryConfig(category: string) {
  return categoryConfig[category] || defaultConfig;
}

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
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"idle" | "submitted" | "already" | "error">("idle");

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
        }),
      });
      if (res.ok) {
        router.push("/deploy");
      }
    } catch {
      // handle error silently
    } finally {
      setPurchasing(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !employee) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/marketplace/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employee.id }),
      });
      if (res.ok) {
        setPublishStatus("submitted");
      } else {
        const data = await res.json();
        if (data.error?.includes("already")) {
          setPublishStatus("already");
        } else {
          setPublishStatus("error");
        }
      }
    } catch {
      setPublishStatus("error");
    } finally {
      setPublishing(false);
    }
  };

  const isOwnEmployee = user && employee?.created_by === user.id;

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
        <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
          <Heart size={24} className="text-[var(--text-muted)]" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Employee Not Found</h2>
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

  const config = getCategoryConfig(employee.category);
  const IconComponent = config.icon;
  const yearlySavings = employee.price_monthly * 12 - (employee.price_yearly || 0);
  const price = plan === "yearly" ? employee.price_yearly || 0 : employee.price_monthly;
  const savingsPercent = employee.price_yearly
    ? Math.round((1 - employee.price_yearly / (employee.price_monthly * 12)) * 100)
    : 0;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {/* Back link */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] mb-6 transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back to Marketplace
      </Link>

      {/* Hero Header */}
      <div className={`relative rounded-2xl overflow-hidden mb-8`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-15`} />
        <div className="relative border border-[var(--border)] rounded-2xl bg-[var(--bg-card)] p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            {/* Left side */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                <IconComponent size={36} className="text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">{employee.role}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${config.gradient} text-white`}>
                    {employee.category}
                  </span>
                </div>
                <p className="text-base text-[var(--text-secondary)] mb-3">
                  {employee.name}
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
                    <span className="text-sm font-semibold text-[var(--text-primary)] ml-1">
                      {employee.rating}
                    </span>
                  </div>
                  <span className="text-sm text-[var(--text-muted)]">
                    {employee.reviews_count} reviews
                  </span>
                </div>
              </div>
            </div>

            {/* Right side badges */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {employee.rating > 4.7 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">
                  <Award size={14} />
                  Most Popular
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">About</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {employee.long_description || employee.description}
            </p>
          </div>

          {/* Capabilities */}
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Capabilities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {employee.capabilities.map((cap) => (
                <div
                  key={cap}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--bg-dark)] text-sm text-[var(--text-secondary)] border border-[var(--border)]"
                >
                  <Check size={15} className="text-emerald-400 shrink-0" />
                  {cap}
                </div>
              ))}
            </div>
          </div>

          {/* What You Get */}
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">What You Get</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Clock,
                  title: "24/7 Operation",
                  desc: "Works around the clock without breaks, holidays, or downtime",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Zap,
                  title: "Instant Setup",
                  desc: "Deploy in under 5 minutes with guided configuration",
                  gradient: "from-amber-500 to-orange-500",
                },
                {
                  icon: Shield,
                  title: "Performance Dashboard",
                  desc: "Real-time analytics and reporting on all activities",
                  gradient: "from-emerald-500 to-teal-500",
                },
              ].map((feat) => (
                <div
                  key={feat.title}
                  className="flex flex-col items-center text-center p-5 rounded-xl bg-[var(--bg-dark)] border border-[var(--border)]"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-3`}>
                    <feat.icon size={22} className="text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{feat.title}</h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar — Pricing (1/3) */}
        <div>
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] border-gradient p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-5 text-[var(--text-primary)]">Pricing</h2>

            {/* Plan toggle */}
            <div className="flex rounded-xl bg-[var(--bg-dark)] p-1 mb-6">
              <button
                onClick={() => setPlan("monthly")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  plan === "monthly"
                    ? "bg-[var(--primary)] text-white shadow-lg shadow-indigo-500/20"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPlan("yearly")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                  plan === "yearly"
                    ? "bg-[var(--primary)] text-white shadow-lg shadow-indigo-500/20"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                Yearly
              </button>
            </div>

            {/* Savings badge */}
            {plan === "yearly" && savingsPercent > 0 && (
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Save {savingsPercent}%
                </span>
              </div>
            )}

            {/* Price display */}
            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-[var(--text-primary)]">${price}</span>
                <span className="text-[var(--text-muted)]">
                  /{plan === "yearly" ? "yr" : "mo"}
                </span>
              </div>
            </div>

            {/* Feature list */}
            <ul className="space-y-3 mb-6">
              {[
                "Cancel anytime",
                "14-day free trial",
                "Full API access included",
                "Priority support",
                "Custom integrations",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                  <Check size={15} className="text-emerald-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={handleHire}
              disabled={purchasing || !user}
              className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${config.gradient} text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg animate-pulse-glow`}
            >
              {purchasing
                ? "Processing..."
                : !user
                  ? "Sign in to Hire"
                  : `Hire ${employee.name}`}
            </button>

            <p className="text-center text-xs text-[var(--text-muted)] mt-3">
              30-day money-back guarantee
            </p>

            {/* Publish to Marketplace — only for own custom employees */}
            {isOwnEmployee && (
              <div className="mt-5 pt-5 border-t border-[var(--border)]">
                {publishStatus === "submitted" ? (
                  <div className="text-center py-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20">
                      <Check size={16} />
                      Submitted for Review
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      Your agent will appear in the global marketplace once approved.
                    </p>
                  </div>
                ) : publishStatus === "already" ? (
                  <div className="text-center py-2">
                    <p className="text-xs text-[var(--text-muted)]">
                      Already submitted for marketplace review.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="w-full py-3 rounded-xl bg-[var(--bg-dark)] border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {publishing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Globe size={16} />
                        Publish to Global Marketplace
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6 mt-6">
        <h2 className="text-xl font-semibold mb-5 text-[var(--text-primary)]">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoReviews.map((review) => (
            <div
              key={review.id}
              className="p-5 rounded-xl bg-[var(--bg-dark)] border border-[var(--border)]"
            >
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={
                      i < review.rating
                        ? "fill-[#F59E0B] text-[#F59E0B]"
                        : "text-[var(--text-muted)]"
                    }
                  />
                ))}
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{review.author}</p>
                  <p className="text-xs text-[var(--text-muted)]">{review.company}</p>
                </div>
                <span className="text-xs text-[var(--text-muted)]">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
