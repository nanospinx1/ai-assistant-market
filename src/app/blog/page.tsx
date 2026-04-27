"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Sun,
  Moon,
  ArrowRight,
  Clock,
  Tag,
  Mail,
  Send,
  BookOpen,
  TrendingUp,
  Briefcase,
  GraduationCap,
  BarChart3,
  Shield,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/layout/Providers";

const categories = ["All", "Guides", "Business", "Tutorials", "Case Studies", "Trends"];

const featuredPost = {
  title: "How Small Businesses Are Saving 40 Hours Per Week with AI Employees",
  excerpt:
    "Discover how three small business owners transformed their operations by hiring AI employees for customer support, bookkeeping, and content creation.",
  tag: "Case Study",
  date: "April 20, 2026",
  readTime: "8 min read",
};

const blogPosts = [
  {
    title: "The Complete Guide to AI Customer Support",
    excerpt:
      "Everything you need to know about deploying AI-powered customer support agents — from setup to scaling across multiple channels.",
    tag: "Guide",
    tagColor: "#6366f1",
    date: "Apr 15, 2026",
    readTime: "12 min read",
    icon: BookOpen,
  },
  {
    title: "5 Signs Your Business Needs an AI Employee",
    excerpt:
      "Overwhelmed by repetitive tasks? Struggling to scale? Here are five clear indicators it's time to bring AI into your workforce.",
    tag: "Business",
    tagColor: "#0ea5e9",
    date: "Apr 10, 2026",
    readTime: "5 min read",
    icon: Briefcase,
  },
  {
    title: "AI vs. Traditional Outsourcing: A Cost Comparison",
    excerpt:
      "We break down the real costs of hiring AI employees versus traditional outsourcing — including hidden fees, training time, and ROI.",
    tag: "Analysis",
    tagColor: "#f59e0b",
    date: "Apr 5, 2026",
    readTime: "7 min read",
    icon: BarChart3,
  },
  {
    title: "How to Train Your AI Employee in Under 30 Minutes",
    excerpt:
      "A step-by-step tutorial on uploading your data, configuring workflows, and getting your AI employee productive fast.",
    tag: "Tutorial",
    tagColor: "#10b981",
    date: "Mar 28, 2026",
    readTime: "10 min read",
    icon: GraduationCap,
  },
  {
    title: "The Rise of AI-First Small Businesses",
    excerpt:
      "A growing wave of entrepreneurs are building companies with AI employees from day one. Here's what that looks like.",
    tag: "Trends",
    tagColor: "#ec4899",
    date: "Mar 20, 2026",
    readTime: "6 min read",
    icon: TrendingUp,
  },
  {
    title: "Data Privacy and AI: What Small Businesses Need to Know",
    excerpt:
      "From SOC 2 compliance to data encryption — everything you need to know about keeping your business data safe with AI.",
    tag: "Security",
    tagColor: "#8b5cf6",
    date: "Mar 15, 2026",
    readTime: "9 min read",
    icon: Shield,
  },
];

export default function BlogPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState("All");
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Thanks for subscribing with ${email}! We'll keep you in the loop.`);
      setEmail("");
    }
  };

  const filtered =
    activeCategory === "All"
      ? blogPosts
      : blogPosts.filter(
          (p) =>
            p.tag.toLowerCase() === activeCategory.toLowerCase() ||
            (activeCategory === "Case Studies" && p.tag === "Case Study") ||
            (activeCategory === "Tutorials" && p.tag === "Tutorial") ||
            (activeCategory === "Guides" && p.tag === "Guide")
        );

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
              href="/marketplace"
              className="text-sm font-medium transition-colors hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Marketplace
            </Link>
            <Link
              href="/help"
              className="text-sm font-medium transition-colors hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Help Center
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
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles size={18} style={{ color: "var(--accent)" }} />
            <span
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "var(--accent)" }}
            >
              Our Blog
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            AI Market Blog
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Insights, guides, and stories about the future of AI-powered workforces for
            small businesses.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="rounded-full px-5 py-2 text-sm font-medium border transition-all"
                style={{
                  borderColor:
                    activeCategory === cat ? "var(--accent)" : "var(--border-light)",
                  background:
                    activeCategory === cat ? "var(--accent)" : "var(--bg-card)",
                  color: activeCategory === cat ? "#fff" : "var(--text-secondary)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="#" className="block group">
            <div
              className="rounded-2xl overflow-hidden gradient-primary p-8 md:p-12 relative"
            >
              <div className="relative z-10 max-w-2xl">
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white mb-4">
                  {featuredPost.tag}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:underline decoration-2 underline-offset-4">
                  {featuredPost.title}
                </h2>
                <p className="text-white/80 text-base md:text-lg mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Tag size={14} />
                    {featuredPost.tag}
                  </span>
                  <span>{featuredPost.date}</span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {featuredPost.readTime}
                  </span>
                </div>
              </div>
              <div className="absolute top-6 right-8 opacity-10">
                <BookOpen size={180} className="text-white" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <Link href="#" key={i} className="group">
                <div
                  className="rounded-2xl border p-6 h-full flex flex-col transition-shadow hover:shadow-lg"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                      style={{ background: post.tagColor }}
                    >
                      {post.tag}
                    </span>
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ background: "var(--bg-surface)" }}
                    >
                      <post.icon size={18} style={{ color: post.tagColor }} />
                    </div>
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2 group-hover:underline decoration-1 underline-offset-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {post.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-4 flex-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--border-light)" }}>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>{post.date}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {post.readTime}
                      </span>
                    </div>
                    <span
                      className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                      style={{ color: "var(--accent)" }}
                    >
                      Read More <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg" style={{ color: "var(--text-muted)" }}>
                No posts found in this category yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div
            className="rounded-2xl border p-8 md:p-12 text-center"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "var(--bg-surface)" }}
            >
              <Mail size={24} style={{ color: "var(--accent)" }} />
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Stay in the Loop
            </h2>
            <p
              className="text-base mb-8 max-w-lg mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Get the latest insights on AI employees, automation tips, and product updates
              delivered to your inbox every week.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-lg border py-3 px-4 text-sm outline-none transition-colors focus:border-[var(--primary)]"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                type="submit"
                className="rounded-lg px-6 py-3 text-sm font-semibold text-white gradient-primary transition-shadow hover:shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
              >
                <Send size={16} />
                Subscribe
              </button>
            </form>
            <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded gradient-primary">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              AI Market
            </span>
          </Link>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            &copy; 2026 AI Market. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
