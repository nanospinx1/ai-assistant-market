"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Sun,
  Moon,
  Search,
  Rocket,
  CreditCard,
  Settings,
  Plug,
  BarChart3,
  Shield,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquare,
  ArrowRight,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { useTheme } from "@/components/layout/Providers";

const topics = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Learn the basics of hiring and deploying your first AI employee",
    color: "#6366f1",
  },
  {
    icon: CreditCard,
    title: "Account & Billing",
    description: "Manage your subscription, payment methods, and invoices",
    color: "#0ea5e9",
  },
  {
    icon: Settings,
    title: "AI Employee Setup",
    description: "Configure, train, and customize your AI employees",
    color: "#10b981",
  },
  {
    icon: Plug,
    title: "Integrations",
    description: "Connect your AI employees to Slack, email, CRM, and more",
    color: "#f59e0b",
  },
  {
    icon: BarChart3,
    title: "Performance & Analytics",
    description: "Understand your AI employee's metrics and optimize results",
    color: "#ec4899",
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    description: "Learn how we protect your data and ensure compliance",
    color: "#8b5cf6",
  },
];

const faqs: { question: string; answer: string }[] = [
  {
    question: "How do I hire my first AI employee?",
    answer:
      "It's simple! Head to the Marketplace, browse our catalog of AI employees by role or skill, and select the one that fits your needs. Click \"Hire\" to start the deployment process — you'll be guided through a quick configuration wizard, and your AI employee will be live and working within minutes.",
  },
  {
    question: "What tasks can AI employees handle?",
    answer:
      "AI employees can handle a wide range of tasks including customer support (live chat, email, tickets), sales development (lead qualification, demo booking), content creation (blogs, social media, emails), bookkeeping (invoice processing, expense tracking), data entry, appointment scheduling, and much more. Each AI employee specializes in specific areas for optimal performance.",
  },
  {
    question: "How long does deployment take?",
    answer:
      "Most AI employees are ready to work within 5 minutes of hiring. The deployment process includes a brief configuration step where you set preferences, connect your tools, and define any custom workflows. Once configured, your AI employee begins handling tasks immediately.",
  },
  {
    question: "Can I train an AI employee on my own data?",
    answer:
      "Absolutely! You can upload documents, connect your existing tools and databases, and define custom workflows. Your AI employee will learn from your specific business context, brand voice, and processes. The more context you provide, the better it performs. Training updates can be made anytime through the dashboard.",
  },
  {
    question: "What happens if my AI employee makes a mistake?",
    answer:
      "We've built robust human oversight options into every AI employee. You can enable approval modes where critical actions require your sign-off before executing. Correction workflows let you flag errors and the AI learns from them. You can also set confidence thresholds — tasks the AI isn't sure about get escalated to you automatically.",
  },
  {
    question: "How does billing work?",
    answer:
      "Billing is simple and transparent. You pay a monthly fee per AI employee — no long-term contracts, no hidden fees. You can cancel anytime and your AI employee will remain active until the end of your billing cycle. Volume discounts are available for teams hiring 5 or more AI employees.",
  },
  {
    question: "Can I use AI employees on multiple channels?",
    answer:
      "Yes! AI employees can operate across multiple channels simultaneously including email, live chat, Slack, Microsoft Teams, web widgets, WhatsApp, SMS, and via our API. You can configure channel-specific behaviors and responses from the integrations dashboard.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Security is our top priority. We are SOC 2 Type II compliant, all data is encrypted at rest and in transit using AES-256 encryption, and your business data is never used to train our AI models. We offer data residency options, role-based access controls, and detailed audit logs. You can request a full security whitepaper from our team.",
  },
];

export default function HelpCenterPage() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Search results for "${searchQuery}" coming soon! This is a demo.`);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
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
              href="/marketplace"
              className="text-sm font-medium transition-colors hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Marketplace
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium transition-colors hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Blog
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

      {/* Hero with Search */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "var(--bg-surface)" }}
          >
            <HelpCircle size={32} style={{ color: "var(--accent)" }} />
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            How Can We Help?
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto mb-10"
            style={{ color: "var(--text-secondary)" }}
          >
            Find answers, guides, and resources to get the most out of your AI employees.
          </p>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search for help articles, guides, FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border py-4 pl-12 pr-32 text-sm outline-none transition-colors focus:border-[var(--primary)]"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white gradient-primary transition-shadow hover:shadow-lg"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className="text-2xl md:text-3xl font-bold mb-2 text-center"
            style={{ color: "var(--text-primary)" }}
          >
            Popular Topics
          </h2>
          <p
            className="text-center mb-10"
            style={{ color: "var(--text-secondary)" }}
          >
            Browse by category to find what you need
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, i) => (
              <Link href="#" key={i} className="group">
                <div
                  className="rounded-2xl border p-6 h-full transition-shadow hover:shadow-lg"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
                    style={{ background: `${topic.color}15` }}
                  >
                    <topic.icon size={24} style={{ color: topic.color }} />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2 group-hover:underline decoration-1 underline-offset-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {topic.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {topic.description}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 mt-4 text-sm font-medium group-hover:gap-2 transition-all"
                    style={{ color: topic.color }}
                  >
                    Learn more <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <BookOpen size={18} style={{ color: "var(--accent)" }} />
              <span
                className="text-sm font-semibold uppercase tracking-widest"
                style={{ color: "var(--accent)" }}
              >
                FAQ
              </span>
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Frequently Asked Questions
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Quick answers to the questions we hear most often
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border overflow-hidden transition-shadow"
                style={{
                  background: "var(--bg-card)",
                  borderColor: openFaq === i ? "var(--accent)" : "var(--border)",
                }}
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span
                    className="font-medium pr-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {faq.question}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp size={20} style={{ color: "var(--accent)" }} className="shrink-0" />
                  ) : (
                    <ChevronDown size={20} style={{ color: "var(--text-muted)" }} className="shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div
                    className="px-5 pb-5 text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
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
              <MessageSquare size={24} style={{ color: "var(--accent)" }} />
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Still Need Help?
            </h2>
            <p
              className="text-base mb-8 max-w-lg mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Our support team is here to help. Reach out and we&apos;ll get back to you as
              soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white gradient-primary transition-shadow hover:shadow-lg hover:shadow-indigo-500/25"
              >
                <MessageSquare size={16} />
                Contact Support
              </Link>
              <a
                href="mailto:support@nanospinx.com"
                className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:bg-[var(--bg-surface)]"
                style={{
                  borderColor: "var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <Mail size={16} />
                support@nanospinx.com
              </a>
            </div>
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
