"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bot, Sun, Moon, ArrowLeft, Shield } from "lucide-react";
import { useTheme } from "@/components/layout/Providers";

const sections = [
  { id: "introduction", title: "Introduction" },
  { id: "information-we-collect", title: "Information We Collect" },
  { id: "how-we-use", title: "How We Use Your Information" },
  { id: "data-sharing", title: "Data Sharing" },
  { id: "ai-employee-data", title: "AI Employee Data" },
  { id: "data-security", title: "Data Security" },
  { id: "data-retention", title: "Data Retention" },
  { id: "your-rights", title: "Your Rights" },
  { id: "cookies", title: "Cookies" },
  { id: "childrens-privacy", title: "Children's Privacy" },
  { id: "international-transfers", title: "International Transfers" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "contact", title: "Contact" },
];

export default function PrivacyPolicy() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("introduction");

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
                <Shield className="h-5 w-5" style={{ color: "var(--text-primary)" }} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
                Privacy Policy
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
                {/* 1. Introduction */}
                <section id="introduction" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    1. Introduction
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      AI Market (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the AI Market platform, a service that enables
                      businesses to hire, deploy, and manage AI-powered virtual employees. This Privacy Policy explains how
                      we collect, use, share, and protect your personal information when you use our website, platform, and
                      related services (collectively, the &quot;Service&quot;).
                    </p>
                    <p>
                      By accessing or using AI Market, you acknowledge that you have read, understood, and agree to be bound
                      by this Privacy Policy. If you do not agree with our practices, please do not use the Service.
                    </p>
                  </div>
                </section>

                {/* 2. Information We Collect */}
                <section id="information-we-collect" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    2. Information We Collect
                  </h2>
                  <div className="space-y-5 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                        Account Information
                      </h3>
                      <p>
                        When you create an account, we collect your name, email address, company name, and billing details
                        (such as payment method and billing address). This information is necessary to provide you with
                        access to the Service and process your subscription payments.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                        Usage Data
                      </h3>
                      <p>
                        We collect information about how you interact with our platform, including how you configure and
                        use AI employees, task logs, deployment configurations, feature usage, and interaction patterns.
                        This data helps us understand how our Service is used and identify areas for improvement.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                        Technical Data
                      </h3>
                      <p>
                        We automatically collect certain technical information when you access our Service, including your
                        IP address, browser type and version, device information, operating system, referring URLs, and
                        cookies. We use this information to ensure the security and proper functioning of the Service.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                        Business Data
                      </h3>
                      <p>
                        You may provide documents, files, and other data to train and customize your AI employees. This
                        includes any content you upload, input, or otherwise make available through the Service for the
                        purpose of configuring your AI employees to perform specific tasks.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                        Communication Data
                      </h3>
                      <p>
                        We collect information from your communications with us, including support tickets, feedback
                        submissions, demo requests, and any other correspondence you send to us through the Service or
                        via email.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. How We Use Your Information */}
                <section id="how-we-use" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    3. How We Use Your Information
                  </h2>
                  <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p className="mb-3">We use the information we collect for the following purposes:</p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Provide and improve our services:</strong> To
                        operate, maintain, and enhance the AI Market platform, including developing new features and
                        improving existing functionality.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Process payments and manage subscriptions:</strong> To
                        process your transactions, manage your billing cycle, and send you invoices and payment
                        confirmations.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Train and customize your AI employees:</strong> To
                        use your business data exclusively for training and customizing your AI employees within your
                        account. We only use your data for your employees and never for other customers&apos; AI employees.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Send service notifications and updates:</strong> To
                        communicate with you about your account, service updates, security alerts, and administrative
                        messages.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Analyze usage patterns:</strong> To understand how
                        users interact with our platform, identify trends, and make data-driven decisions to improve the
                        Service.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Comply with legal obligations:</strong> To fulfill
                        our legal and regulatory requirements, including responding to lawful requests from public
                        authorities.
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 4. Data Sharing */}
                <section id="data-sharing" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    4. Data Sharing
                  </h2>
                  <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      <strong style={{ color: "var(--text-primary)" }}>We do not sell your personal data.</strong> We may
                      share your information only in the following limited circumstances:
                    </p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Service providers:</strong> We share data with
                        trusted third-party service providers who assist us in operating the Service, including payment
                        processors, email delivery services, cloud hosting providers, and analytics tools. These
                        providers are contractually obligated to protect your data and use it only for the purposes we
                        specify.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Legal requirements:</strong> We may disclose your
                        information if required to do so by law, court order, or in response to a valid legal process,
                        such as a subpoena or government regulatory inquiry.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Business transfers:</strong> In the event of a
                        merger, acquisition, reorganization, or sale of assets, your information may be transferred to
                        the acquiring entity. We will provide notice before your personal data is transferred and becomes
                        subject to a different privacy policy.
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 5. AI Employee Data */}
                <section id="ai-employee-data" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    5. AI Employee Data
                  </h2>
                  <div
                    className="rounded-lg p-5 mb-4 border"
                    style={{ background: "var(--bg-surface)", borderColor: "var(--border-light)" }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      We take the privacy of your business data seriously. The following commitments apply to all data
                      you provide for the purpose of training and operating your AI employees:
                    </p>
                  </div>
                  <ul className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--text-muted)" }} />
                      <span>
                        <strong style={{ color: "var(--text-primary)" }}>Account isolation:</strong> Your business data
                        used to train AI employees is strictly isolated to your account. No other customer or user of
                        AI Market can access your data.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--text-muted)" }} />
                      <span>
                        <strong style={{ color: "var(--text-primary)" }}>No cross-customer training:</strong> We never use
                        your data to train, fine-tune, or improve other customers&apos; AI employees. Your training data is
                        used exclusively for your benefit.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--text-muted)" }} />
                      <span>
                        <strong style={{ color: "var(--text-primary)" }}>No general model training:</strong> We do not use
                        your data to improve our general-purpose AI models without obtaining your explicit, informed
                        consent. Any such use would require a separate agreement.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--text-muted)" }} />
                      <span>
                        <strong style={{ color: "var(--text-primary)" }}>Data deletion:</strong> You can request the
                        deletion of all training data associated with your AI employees at any time. Upon request, we
                        will permanently remove the data within 30 days.
                      </span>
                    </li>
                  </ul>
                </section>

                {/* 6. Data Security */}
                <section id="data-security" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    6. Data Security
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      We implement robust security measures designed to protect your information from unauthorized
                      access, alteration, disclosure, or destruction. Our security practices include:
                    </p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Encryption:</strong> All data is encrypted at
                        rest using AES-256 encryption and in transit using TLS 1.3.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>SOC 2 compliance:</strong> We maintain SOC 2
                        Type II certification, demonstrating our commitment to security, availability, and
                        confidentiality.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Regular security audits:</strong> We conduct
                        regular penetration testing and vulnerability assessments by independent third-party security
                        firms.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Access controls:</strong> We enforce strict
                        role-based access controls, multi-factor authentication, and the principle of least privilege
                        for all employees accessing customer data.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Incident response:</strong> We maintain a
                        comprehensive incident response plan and will notify affected users within 72 hours of
                        discovering a data breach.
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 7. Data Retention */}
                <section id="data-retention" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    7. Data Retention
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      We retain your information only for as long as necessary to fulfill the purposes outlined in this
                      Privacy Policy or as required by law:
                    </p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Account data:</strong> Retained while your
                        account is active and for 30 days following account deletion, after which it is permanently
                        removed from our systems.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Usage logs:</strong> Retained for 12 months from
                        the date of collection, then automatically deleted or anonymized.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Billing records:</strong> Retained for 7 years
                        as required by applicable tax and financial regulations.
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 8. Your Rights */}
                <section id="your-rights" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    8. Your Rights
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      Depending on your location and applicable data protection laws, you may have the following rights
                      regarding your personal information:
                    </p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Access:</strong> You have the right to request a
                        copy of the personal data we hold about you.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Correction:</strong> You have the right to
                        request that we correct any inaccurate or incomplete personal data.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Deletion:</strong> You have the right to request
                        that we delete your personal data, subject to certain legal exceptions.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Data portability:</strong> You have the right to
                        receive your personal data in a structured, commonly used, machine-readable format and to
                        transmit it to another controller.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Opt-out of marketing:</strong> You can
                        unsubscribe from marketing communications at any time by clicking the &quot;unsubscribe&quot; link in our
                        emails or by contacting us directly.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Withdraw consent:</strong> Where we rely on your
                        consent to process personal data, you have the right to withdraw that consent at any time.
                      </li>
                    </ul>
                    <p>
                      To exercise any of these rights, please{" "}
                      <Link href="/contact" className="underline" style={{ color: "var(--text-primary)" }}>
                        contact us
                      </Link>
                      . We will respond to your request within 30 days.
                    </p>
                  </div>
                </section>

                {/* 9. Cookies */}
                <section id="cookies" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    9. Cookies
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      We use cookies and similar tracking technologies to enhance your experience on our platform. The
                      types of cookies we use include:
                    </p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Essential cookies:</strong> Required for the
                        basic operation of the Service, including session management and authentication. These cookies
                        cannot be disabled.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Analytics cookies:</strong> Help us understand
                        how users interact with the platform by collecting usage patterns and aggregated statistics.
                        These cookies do not identify you personally.
                      </li>
                      <li>
                        <strong style={{ color: "var(--text-primary)" }}>Preference cookies:</strong> Remember your
                        settings and preferences, such as your selected theme, language, and display options, to provide
                        a more personalized experience.
                      </li>
                    </ul>
                    <p>
                      You can manage your cookie preferences through our cookie consent banner displayed when you first
                      visit the platform, or at any time through your browser settings. Please note that disabling
                      certain cookies may affect the functionality of the Service.
                    </p>
                  </div>
                </section>

                {/* 10. Children's Privacy */}
                <section id="childrens-privacy" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    10. Children&apos;s Privacy
                  </h2>
                  <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      AI Market is designed for use by businesses and professionals. We do not knowingly collect personal
                      information from children under the age of 16. If we become aware that we have inadvertently
                      collected data from a child under 16, we will take immediate steps to delete that information from
                      our systems. If you believe we may have collected information from a child under 16, please
                      contact us at{" "}
                      <Link href="/contact" className="underline" style={{ color: "var(--text-primary)" }}>
                        our contact page
                      </Link>
                      .
                    </p>
                  </div>
                </section>

                {/* 11. International Transfers */}
                <section id="international-transfers" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    11. International Transfers
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      Your data is primarily stored and processed in the United States. If you are accessing the Service
                      from outside the United States, please be aware that your information may be transferred to,
                      stored, and processed in a country that may have different data protection laws than your country
                      of residence.
                    </p>
                    <p>
                      For users in the European Union and United Kingdom, we rely on Standard Contractual Clauses
                      (SCCs) approved by the European Commission as a legal mechanism for transferring personal data
                      outside the EU/UK. These clauses ensure that your data receives an adequate level of protection
                      regardless of where it is processed.
                    </p>
                  </div>
                </section>

                {/* 12. Changes to This Policy */}
                <section id="changes" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    12. Changes to This Policy
                  </h2>
                  <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p>
                      We may update this Privacy Policy from time to time to reflect changes in our practices,
                      technologies, legal requirements, or other factors. When we make material changes, we will notify
                      you via email and through a prominent notice on the platform at least 30 days before the changes
                      take effect. We encourage you to review this Privacy Policy periodically to stay informed about
                      how we are protecting your information. Your continued use of the Service after the effective date
                      of any changes constitutes your acceptance of the updated Privacy Policy.
                    </p>
                  </div>
                </section>

                {/* 13. Contact */}
                <section id="contact" style={{ scrollMarginTop: "5rem" }}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    13. Contact
                  </h2>
                  <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    <p className="mb-3">
                      If you have any questions, concerns, or requests regarding this Privacy Policy or our data
                      practices, please contact us:
                    </p>
                    <div
                      className="rounded-lg p-5 border"
                      style={{ background: "var(--bg-surface)", borderColor: "var(--border-light)" }}
                    >
                      <p style={{ color: "var(--text-primary)" }} className="font-semibold mb-1">
                        AI Market — Privacy Team
                      </p>
                      <p>
                        <Link href="/contact" className="underline" style={{ color: "var(--text-primary)" }}>
                          Contact our Privacy Team
                        </Link>
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
