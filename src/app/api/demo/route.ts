import { NextResponse } from "next/server";
import { isEmailConfigured } from "@/lib/email";

const RESEND_API_KEY = (process.env.RESEND_API_KEY || "").trim();
const FROM_EMAIL = (process.env.FROM_EMAIL || "AI Market <noreply@nanospinx.com>").trim();
const DEMO_RECIPIENT = "noreply@nanospinx.com"; // receives demo requests

export async function POST(req: Request) {
  try {
    const { name, email, company, role, date, time, message } = await req.json();

    if (!name || !email || !company || !date || !time) {
      return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
    }

    // ── Build notification email to ourselves ──
    const internalHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0f1420;color:#e8eaf2;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:1.6rem;font-weight:800;color:#818cf8;">🤖 AI Market</span>
        </div>
        <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:16px;color:#e8eaf2;">New Demo Request</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#7b82a0;font-size:0.85rem;width:120px;">Name</td><td style="padding:8px 0;color:#e8eaf2;font-size:0.9rem;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#7b82a0;font-size:0.85rem;">Email</td><td style="padding:8px 0;color:#e8eaf2;font-size:0.9rem;"><a href="mailto:${email}" style="color:#818cf8;">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#7b82a0;font-size:0.85rem;">Company</td><td style="padding:8px 0;color:#e8eaf2;font-size:0.9rem;">${company}</td></tr>
          ${role ? `<tr><td style="padding:8px 0;color:#7b82a0;font-size:0.85rem;">Role</td><td style="padding:8px 0;color:#e8eaf2;font-size:0.9rem;">${role}</td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#7b82a0;font-size:0.85rem;">Preferred Date</td><td style="padding:8px 0;color:#e8eaf2;font-size:0.9rem;">${date}</td></tr>
          <tr><td style="padding:8px 0;color:#7b82a0;font-size:0.85rem;">Preferred Time</td><td style="padding:8px 0;color:#e8eaf2;font-size:0.9rem;">${time}</td></tr>
          ${message ? `<tr><td style="padding:8px 0;color:#7b82a0;font-size:0.85rem;vertical-align:top;">Message</td><td style="padding:8px 0;color:#e8eaf2;font-size:0.9rem;">${message}</td></tr>` : ""}
        </table>
      </div>
    `;

    // ── Build confirmation email to the user ──
    const confirmHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#0f1420;color:#e8eaf2;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:1.6rem;font-weight:800;color:#818cf8;">🤖 AI Market</span>
        </div>
        <h2 style="text-align:center;font-size:1.2rem;font-weight:700;margin-bottom:8px;">Demo Request Received!</h2>
        <p style="text-align:center;color:#7b82a0;font-size:0.9rem;margin-bottom:24px;">
          Hi ${name}, thanks for your interest in AI Market!
        </p>
        <div style="background:#1a1e2e;border:1px solid #2a2f42;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;color:#7b82a0;font-size:0.85rem;">Your requested time:</p>
          <p style="margin:0;font-size:1.1rem;font-weight:700;color:#818cf8;">${date} at ${time} (PST)</p>
        </div>
        <p style="text-align:center;color:#7b82a0;font-size:0.85rem;margin-bottom:0;">
          Our team will review your request and send a calendar invite within 24 hours. 
          If you need to reschedule, simply reply to this email.
        </p>
      </div>
    `;

    if (!isEmailConfigured()) {
      console.log("[demo] Email not configured. Demo request:", { name, email, company, date, time });
      return NextResponse.json({ success: true, message: "Demo request received (email skipped in dev mode)." });
    }

    // Send both emails in parallel
    const [internalRes, confirmRes] = await Promise.all([
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [DEMO_RECIPIENT],
          reply_to: email,
          subject: `Demo Request: ${name} from ${company} — ${date} at ${time}`,
          html: internalHtml,
        }),
      }),
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          subject: "AI Market — Your demo request is confirmed!",
          html: confirmHtml,
        }),
      }),
    ]);

    if (!internalRes.ok) {
      const err = await internalRes.text();
      console.error("[demo] Failed to send internal email:", err.slice(0, 300));
    }
    if (!confirmRes.ok) {
      const err = await confirmRes.text();
      console.error("[demo] Failed to send confirmation email:", err.slice(0, 300));
    }

    console.log(`[demo] Demo request from ${name} (${email}) for ${date} at ${time}`);
    return NextResponse.json({ success: true, message: "Demo scheduled successfully!" });
  } catch (err: any) {
    console.error("[demo] Error:", err);
    return NextResponse.json({ error: "Failed to submit demo request." }, { status: 500 });
  }
}
