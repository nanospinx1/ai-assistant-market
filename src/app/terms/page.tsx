"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bot, Sun, Moon, ArrowLeft, FileText } from "lucide-react";
import { useTheme } from "@/components/layout/Providers";

const sections = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "description", title: "Description of Service" },
  { id: "registration", title: "Account Registration" },
  { id: "billing", title: "Subscription & Billing" },
  { id: "acceptable-use", title: "Acceptable Use" },
  { id: "ai-performance", title: "AI Employee Performance" },
  { id: "intellectual-property", title: "Intellectual Property" },
  { id: "data-privacy", title: "Data & Privacy" },
  { id: "sla", title: "Service Level Agreement" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "indemnification", title: "Indemnification" },
  { id: "termination", title: "Termination" },
  { id: "disputes", title: "Dispute Resolution" },
  { id: "modifications", title: "Modifications" },
  { id: "contact", title: "Contact" },
];

export default function TermsOfService() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("acceptance");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-main)" }}>
      {/* Header */}
      <header className="border-b sticky top-0 z-30" style={{ borderColor: "var(--border)", background: "var(--bg-main)" }}>
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

      {/* Main Content */}
      <div className="flex-1 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Page Title */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: "var(--primary-light)" }}
              >
                <FileText className="h-5 w-5" style={{ color: "var(--text-primary)" }} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
                Terms of Service
              </h1>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Last updated: April 1, 2026
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Table of Contents — Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <nav className="lg:sticky lg:top-24">
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  On this page
                </p>
                <ul className="space-y-1">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="block text-sm py-1.5 px-3 rounded-md transition-colors"
                        style={{
                          color: activeSection === s.id ? "var(--text-primary)" : "var(--text-muted)",
                          background: activeSection === s.id ? "var(--bg-surface)" : "transparent",
                          fontWeight: activeSection === s.id ? 600 : 400,
                          borderLeft: activeSection === s.id ? "2px solid var(--text-primary)" : "2px solid transparent",
                        }}
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0 max-w-3xl">
              <div className="space-y-12">
                {/* 1. Acceptance of Terms */}
                <section id="acceptance" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    1. Acceptance of Terms
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      By accessing, browsing, or using the AI Market platform (&quot;Service&quot;), you acknowledge that you have
                      read, understood, and agree to be bound by these Terms of Service (&quot;Terms&quot;), as well as our{" "}
                      <Link href="/privacy" className="underline" style={{ color: "var(--text-primary)" }}>
                        Privacy Policy
                      </Link>
                      , which is incorporated herein by reference.
                    </p>
                    <p>
                      If you do not agree to these Terms, you must not access or use the Service. If you are using the
                      Service on behalf of a business or other legal entity, you represent that you have the authority to
                      bind that entity to these Terms, and &quot;you&quot; refers to both you individually and the entity you
                      represent.
                    </p>
                  </div>
                </section>

                {/* 2. Description of Service */}
                <section id="description" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    2. Description of Service
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      AI Market is a platform that enables businesses to hire, deploy, and manage AI-powered virtual
                      employees. Our Service provides access to a marketplace of pre-built AI employees designed for
                      various business functions, as well as tools to create, customize, and manage your own AI
                      employees tailored to your specific business needs.
                    </p>
                    <p>
                      The Service includes, but is not limited to, the AI employee marketplace, custom AI employee
                      builder, deployment and management tools, performance monitoring dashboards, integration
                      capabilities, and customer support. We reserve the right to modify, suspend, or discontinue any
                      part of the Service at any time with reasonable notice.
                    </p>
                  </div>
                </section>

                {/* 3. Account Registration */}
                <section id="registration" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    3. Account Registration
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>To use the Service, you must create an account. When registering, you agree that:</p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>You must be at least 18 years of age or the legal age of majority in your jurisdiction.</li>
                      <li>
                        You must provide accurate, current, and complete information during registration and keep your
                        account information up to date.
                      </li>
                      <li>
                        You are responsible for maintaining the confidentiality of your account credentials and for all
                        activities that occur under your account.
                      </li>
                      <li>
                        You may not create more than one account per person. Duplicate accounts may be suspended or
                        terminated.
                      </li>
                      <li>
                        If you are registering on behalf of a business or organization, you represent and warrant that
                        you have the authority to bind that entity to these Terms.
                      </li>
                    </ul>
                    <p>
                      You must notify us immediately at{" "}
                      <a href="mailto:legal@nanospinx.com" className="underline" style={{ color: "var(--text-primary)" }}>
                        legal@nanospinx.com
                      </a>{" "}
                      if you suspect any unauthorized use of your account or any other breach of security.
                    </p>
                  </div>
                </section>

                {/* 4. Subscription & Billing */}
                <section id="billing" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    4. Subscription &amp; Billing
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>The Service operates on a subscription-based pricing model. By subscribing, you agree to the following:</p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Monthly subscription:</strong> Each AI employee
                        requires a separate monthly subscription. Pricing is displayed on the marketplace listing for
                        each AI employee.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Free trial:</strong> New users are eligible for
                        a 7-day free trial. During the trial, you will have full access to the selected AI employee. If
                        you do not cancel before the trial ends, your subscription will automatically convert to a paid
                        plan.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Auto-renewal:</strong> Subscriptions
                        automatically renew at the end of each billing period unless cancelled. You may cancel at any
                        time through your account settings.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Price changes:</strong> We reserve the right to
                        modify subscription pricing. We will provide at least 30 days&apos; written notice via email before
                        any price change takes effect. The new price will apply at the start of your next billing cycle
                        following the notice period.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Refund policy:</strong> We offer a pro-rated
                        refund if you cancel within the first 14 days of a paid subscription. After 14 days, no refunds
                        will be issued for the current billing period.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Taxes:</strong> All fees are exclusive of
                        applicable taxes. You are responsible for paying all taxes associated with your use of the
                        Service, unless we are legally required to collect them.
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 5. Acceptable Use */}
                <section id="acceptable-use" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    5. Acceptable Use
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>You agree to use the Service responsibly and lawfully. You must not:</p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>
                        Use the Service for any illegal, fraudulent, or unauthorized purpose, or in violation of any
                        applicable local, state, national, or international law or regulation.
                      </li>
                      <li>
                        Attempt to reverse-engineer, decompile, disassemble, or otherwise derive the source code or
                        underlying algorithms of any AI employee or component of the Service.
                      </li>
                      <li>
                        Use the Service to generate content that is harmful, threatening, abusive, harassing, defamatory,
                        misleading, or fraudulent, or that violates the rights of any third party.
                      </li>
                      <li>
                        Deliberately overload, disrupt, or impair the Service, or attempt to bypass rate limits, security
                        measures, or access controls.
                      </li>
                      <li>
                        Resell, redistribute, sublicense, or commercially exploit AI employee outputs or any part of the
                        Service without our prior written authorization.
                      </li>
                    </ul>
                    <p>
                      We reserve the right to investigate and take appropriate action against anyone who, in our sole
                      discretion, violates this section, including suspending or terminating their account and reporting
                      them to law enforcement authorities.
                    </p>
                  </div>
                </section>

                {/* 6. AI Employee Performance */}
                <section id="ai-performance" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    6. AI Employee Performance
                  </h2>
                  <div
                    className="rounded-lg p-5 mb-4 border"
                    style={{ background: "var(--bg-surface)", borderColor: "var(--border-light)" }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      AI employees are powerful tools designed to assist your business, but they are not replacements for
                      professional judgment or human oversight.
                    </p>
                  </div>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>
                        AI employees are tools designed to augment your business operations. They are not substitutes for
                        licensed professional advice, including legal, medical, financial, or other regulated advice.
                      </li>
                      <li>
                        While we strive for high accuracy and reliability, we cannot guarantee that AI employee outputs
                        will be error-free, complete, or suitable for every use case.
                      </li>
                      <li>
                        You are solely responsible for reviewing, validating, and approving all outputs generated by your
                        AI employees before relying on them or distributing them to third parties.
                      </li>
                      <li>
                        Critical business decisions, especially those with legal, financial, or safety implications,
                        should always involve human review and professional judgment.
                      </li>
                      <li>
                        We provide built-in performance metrics, monitoring tools, and activity logs to help you track
                        and evaluate the performance of your AI employees.
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 7. Intellectual Property */}
                <section id="intellectual-property" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    7. Intellectual Property
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>AI Market platform:</strong> The Service,
                        including all software, algorithms, designs, text, graphics, and other content, is owned by
                        AI Market and protected by intellectual property laws. You may not copy, modify, or distribute
                        any part of the platform without our written consent.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Your data:</strong> You retain full ownership of
                        all data, content, and materials you upload or provide to the Service. We claim no ownership
                        rights over your data.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>AI employee outputs:</strong> You own the outputs
                        generated by your AI employees. You are free to use, modify, and distribute these outputs as you
                        see fit, subject to applicable laws and these Terms.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>License to process:</strong> By using the
                        Service, you grant us a limited, non-exclusive, non-transferable license to process your data
                        solely for the purpose of providing, maintaining, and improving the Service for your account.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Feedback:</strong> Any feedback, suggestions, or
                        ideas you provide regarding the Service may be used by us to improve the platform without any
                        obligation or compensation to you.
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 8. Data & Privacy */}
                <section id="data-privacy" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    8. Data &amp; Privacy
                  </h2>
                  <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      Your use of the Service is also governed by our{" "}
                      <Link href="/privacy" className="underline" style={{ color: "var(--text-primary)" }}>
                        Privacy Policy
                      </Link>
                      , which describes how we collect, use, share, and protect your personal information. By using the
                      Service, you consent to the data practices described in the Privacy Policy. We encourage you to
                      review the Privacy Policy carefully and contact us if you have any questions.
                    </p>
                  </div>
                </section>

                {/* 9. Service Level Agreement */}
                <section id="sla" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    9. Service Level Agreement
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>We are committed to providing a reliable and high-performing Service:</p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Uptime target:</strong> We target 99.9% uptime
                        for the Service, measured on a monthly basis, excluding scheduled maintenance windows.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Scheduled maintenance:</strong> We will provide
                        at least 48 hours&apos; advance notice for planned maintenance through email and platform
                        notifications. Maintenance windows are typically scheduled during off-peak hours.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Service credits:</strong> If the Service fails
                        to meet the 99.9% uptime target in any given month, you may be eligible for service credits.
                        Credits are calculated as a percentage of your monthly subscription fee proportional to the
                        excess downtime and will be applied to your next billing cycle.
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 10. Limitation of Liability */}
                <section id="liability" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    10. Limitation of Liability
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      To the maximum extent permitted by applicable law, AI Market and its officers, directors,
                      employees, agents, and affiliates shall not be liable for any indirect, incidental, special,
                      consequential, or punitive damages, including but not limited to loss of profits, data, business
                      opportunities, or goodwill, arising out of or in connection with your use of the Service, even if
                      we have been advised of the possibility of such damages.
                    </p>
                    <p>
                      Our total aggregate liability for all claims arising out of or related to these Terms or your use
                      of the Service shall not exceed the total fees paid by you to AI Market during the twelve (12)
                      months immediately preceding the event giving rise to the claim.
                    </p>
                    <p>
                      Some jurisdictions do not allow the exclusion or limitation of certain damages. In such cases, our
                      liability will be limited to the fullest extent permitted by applicable law.
                    </p>
                  </div>
                </section>

                {/* 11. Indemnification */}
                <section id="indemnification" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    11. Indemnification
                  </h2>
                  <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      You agree to indemnify, defend, and hold harmless AI Market and its officers, directors,
                      employees, agents, and affiliates from and against any and all claims, damages, losses,
                      liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or related
                      to: (a) your use of the Service; (b) any data or content you provide to the Service; (c) your
                      violation of these Terms; (d) your violation of any applicable law or regulation; or (e) your
                      infringement of any third-party rights, including intellectual property rights.
                    </p>
                  </div>
                </section>

                {/* 12. Termination */}
                <section id="termination" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    12. Termination
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      Either party may terminate this agreement at any time. You may cancel your account through your
                      account settings or by contacting our support team.
                    </p>
                    <p>
                      We reserve the right to suspend or terminate your account immediately, without prior notice, if we
                      reasonably believe that you have violated these Terms, engaged in fraudulent activity, or if your
                      use of the Service poses a risk to other users or to our systems.
                    </p>
                    <p>Upon termination of your account:</p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>
                        You will have 30 days to export your data, including AI employee configurations, training data,
                        and generated outputs, using our data export tools.
                      </li>
                      <li>
                        After the 30-day export period, all data associated with your account will be permanently deleted
                        from our systems in accordance with our data retention policies.
                      </li>
                      <li>
                        Any outstanding fees for the current billing period remain due and payable.
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 13. Dispute Resolution */}
                <section id="disputes" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    13. Dispute Resolution
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      These Terms are governed by and construed in accordance with the laws of the State of California,
                      United States, without regard to its conflict of law provisions.
                    </p>
                    <p>
                      In the event of any dispute arising out of or relating to these Terms or your use of the Service,
                      you agree to first attempt to resolve the dispute informally by contacting us at{" "}
                      <a href="mailto:legal@nanospinx.com" className="underline" style={{ color: "var(--text-primary)" }}>
                        legal@nanospinx.com
                      </a>
                      . We will make good-faith efforts to resolve the dispute within 30 days.
                    </p>
                    <p>
                      If the dispute cannot be resolved informally within 30 days, it shall be submitted to binding
                      arbitration administered by the American Arbitration Association (AAA) in San Francisco, California,
                      in accordance with the AAA&apos;s Commercial Arbitration Rules.
                    </p>
                    <p>
                      <strong style={{ color: "var(--text-primary)" }}>Class action waiver:</strong> You agree that any
                      dispute resolution proceedings will be conducted only on an individual basis and not in a class,
                      consolidated, or representative action. You waive any right to participate in a class action
                      lawsuit or class-wide arbitration against AI Market.
                    </p>
                  </div>
                </section>

                {/* 14. Modifications */}
                <section id="modifications" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    14. Modifications
                  </h2>
                  <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      We reserve the right to modify these Terms at any time. When we make changes, we will update the
                      &quot;Last updated&quot; date at the top of this page and notify you via email at least 30 days before the
                      changes take effect. We may also provide notice through a prominent announcement on the platform.
                      Your continued use of the Service after the effective date of any modifications constitutes your
                      acceptance of the updated Terms. If you do not agree to the modified Terms, you must discontinue
                      your use of the Service before they take effect.
                    </p>
                  </div>
                </section>

                {/* 15. Contact */}
                <section id="contact" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    15. Contact
                  </h2>
                  <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p className="mb-3">
                      If you have any questions or concerns about these Terms of Service, please contact us:
                    </p>
                    <div
                      className="rounded-lg p-5 border"
                      style={{ background: "var(--bg-surface)", borderColor: "var(--border-light)" }}
                    >
                      <p style={{ color: "var(--text-primary)" }} className="font-semibold mb-1">
                        AI Market — Legal Team
                      </p>
                      <p>
                        Email:{" "}
                        <a href="mailto:legal@nanospinx.com" className="underline" style={{ color: "var(--text-primary)" }}>
                          legal@nanospinx.com
                        </a>
                      </p>
                      <p>San Francisco, CA</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            &copy; 2026 AI Market. All rights reserved.
          </p>
          <Link
            href="/"
            className="text-sm underline mt-2 inline-block transition-colors hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-muted)" }}
          >
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
