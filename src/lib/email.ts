/**
 * Email service using Resend API.
 * Gracefully skips sending if RESEND_API_KEY is not configured.
 */

const RESEND_API_KEY = (process.env.RESEND_API_KEY || "").trim();
const FROM_EMAIL = (process.env.FROM_EMAIL || "AI Market <noreply@nanospinx.com>").trim();

export function isEmailConfigured(): boolean {
  return !!RESEND_API_KEY;
}

export async function sendVerificationEmail(toEmail: string, code: string): Promise<{ id?: string; skipped?: boolean }> {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send. Code:", code);
    return { skipped: true };
  }

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f1420;color:#e8eaf2;border-radius:12px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:1.6rem;font-weight:800;color:#818cf8;">🤖 AI Market</span>
      </div>
      <h2 style="text-align:center;font-size:1.2rem;font-weight:700;margin-bottom:8px;">Verify Your Email</h2>
      <p style="text-align:center;color:#7b82a0;font-size:0.9rem;margin-bottom:24px;">Enter the code below to activate your account.</p>
      <div style="text-align:center;background:#1a1e2e;border:2px solid #6366f1;border-radius:8px;padding:20px;margin-bottom:24px;">
        <span style="font-size:2rem;font-weight:800;letter-spacing:0.3em;color:#818cf8;">${code}</span>
      </div>
      <p style="text-align:center;color:#555b78;font-size:0.78rem;">If you didn't create an AI Market account, you can safely ignore this email.</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: `AI Market — Your verification code is ${code}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[email] Resend API error ${res.status}:`, err.slice(0, 300));
    throw new Error(`Failed to send verification email`);
  }

  const data = await res.json();
  console.log(`[email] Verification sent to ${toEmail} (id: ${data.id})`);
  return data;
}
