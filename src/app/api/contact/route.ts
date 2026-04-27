import { NextResponse } from "next/server";
import { isEmailConfigured } from "@/lib/email";

const RESEND_API_KEY = (process.env.RESEND_API_KEY || "").trim();
const FROM_EMAIL = (process.env.FROM_EMAIL || "AI Market <noreply@nanospinx.com>").trim();
const CONTACT_RECIPIENT = "noreply@nanospinx.com";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
    }

    // ── Internal notification email ──
    const internalHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0f1420;color:#e8eaf2;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:1.6rem;font-weight:800;color:#818cf8;">🤖 AI Market</span>
        </div>
        <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:16px;color:#e8eaf2;">New Contact Form Submission</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#7b82a0;font-size:0.85rem;width:120px;">Name</td><td style="padding:8px 0;color:#e8eaf2;font-size:0.9rem;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#7b82a0;font-size:0.85rem;">Email</td><td style="padding:8px 0;color:#e8eaf2;font-size:0.9rem;"><a href="mailto:${email}" style="color:#818cf8;">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#7b82a0;font-size:0.85rem;">Subject</td><td style="padding:8px 0;color:#e8eaf2;font-size:0.9rem;">${subject}</td></tr>
          <tr><td style="padding:8px 0;color:#7b82a0;font-size:0.85rem;vertical-align:top;">Message</td><td style="padding:8px 0;color:#e8eaf2;font-size:0.9rem;">${message}</td></tr>
        </table>
      </div>
    `;

    // ── Confirmation email to user ──
    const confirmHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#0f1420;color:#e8eaf2;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:1.6rem;font-weight:800;color:#818cf8;">🤖 AI Market</span>
        </div>
        <h2 style="text-align:center;font-size:1.2rem;font-weight:700;margin-bottom:8px;">We Got Your Message!</h2>
        <p style="text-align:center;color:#7b82a0;font-size:0.9rem;margin-bottom:24px;">
          Hi ${name}, thanks for reaching out to AI Market!
        </p>
        <div style="background:#1a1e2e;border:1px solid #2a2f42;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;color:#7b82a0;font-size:0.85rem;">Your subject:</p>
          <p style="margin:0;font-size:1rem;font-weight:700;color:#818cf8;">${subject}</p>
        </div>
        <p style="text-align:center;color:#7b82a0;font-size:0.85rem;margin-bottom:0;">
          Our team will review your message and get back to you within 24 hours.
          If you need immediate help, visit our <a href="https://nanospinx.com/help" style="color:#818cf8;">Help Center</a>.
        </p>
      </div>
    `;

    if (!isEmailConfigured()) {
      console.log("[contact] Email not configured. Contact form submission:", { name, email, subject });
      return NextResponse.json({ success: true, message: "Message received (email skipped in dev mode)." });
    }

    // Send both emails in parallel
    const [internalRes, confirmRes] = await Promise.all([
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [CONTACT_RECIPIENT],
          reply_to: email,
          subject: `Contact Form: ${subject} — ${name}`,
          html: internalHtml,
        }),
      }),
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          subject: "AI Market — We received your message!",
          html: confirmHtml,
        }),
      }),
    ]);

    if (!internalRes.ok) {
      const err = await internalRes.text();
      console.error("[contact] Failed to send internal email:", err.slice(0, 300));
    }
    if (!confirmRes.ok) {
      const err = await confirmRes.text();
      console.error("[contact] Failed to send confirmation email:", err.slice(0, 300));
    }

    console.log(`[contact] Contact form from ${name} (${email}), subject: ${subject}`);
    return NextResponse.json({ success: true, message: "Message sent successfully!" });
  } catch (err: any) {
    console.error("[contact] Error:", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
