import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";

interface UserSettings {
  user_id: string;
  company_name: string | null;
  industry: string | null;
  company_size: string | null;
  team_size: string | null;
  customer_volume: string | null;
  business_type: string | null;
  notification_email_errors: number;
  notification_email_tasks: number;
  notification_email_weekly: number;
  notification_inapp: string;
  notification_status_alerts: number;
  default_model_tier: string;
  updated_at: string;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  company: string | null;
}

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const db = getDb();
  const user = db.prepare("SELECT id, email, name, company FROM users WHERE id = ?").get(auth.user.id) as UserRow | undefined;
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(auth.user.id) as UserSettings | undefined;

  if (!settings) {
    db.prepare("INSERT INTO user_settings (user_id) VALUES (?)").run(auth.user.id);
    settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(auth.user.id) as UserSettings;
  }

  return NextResponse.json({
    profile: {
      name: user.name,
      email: user.email,
      company: user.company,
    },
    settings: {
      company_name: settings.company_name,
      industry: settings.industry,
      company_size: settings.company_size,
      team_size: settings.team_size ?? "",
      customer_volume: settings.customer_volume ?? "",
      business_type: settings.business_type ?? "",
      notification_email_errors: !!settings.notification_email_errors,
      notification_email_tasks: !!settings.notification_email_tasks,
      notification_email_weekly: !!settings.notification_email_weekly,
      notification_inapp: settings.notification_inapp,
      notification_status_alerts: !!settings.notification_status_alerts,
      default_model_tier: settings.default_model_tier,
    },
  });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const body = await req.json();
  const db = getDb();

  // Update user profile fields
  if (body.name !== undefined) {
    db.prepare("UPDATE users SET name = ? WHERE id = ?").run(body.name, auth.user.id);
  }

  // Ensure settings row exists
  const existing = db.prepare("SELECT user_id FROM user_settings WHERE user_id = ?").get(auth.user.id);
  if (!existing) {
    db.prepare("INSERT INTO user_settings (user_id) VALUES (?)").run(auth.user.id);
  }

  // Build dynamic update for settings
  const settingsFields: Record<string, unknown> = {};
  const allowedFields = [
    "company_name", "industry", "company_size",
    "team_size", "customer_volume", "business_type",
    "notification_email_errors", "notification_email_tasks", "notification_email_weekly",
    "notification_inapp", "notification_status_alerts",
    "default_model_tier",
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      if (typeof body[field] === "boolean") {
        settingsFields[field] = body[field] ? 1 : 0;
      } else {
        settingsFields[field] = body[field];
      }
    }
  }

  if (Object.keys(settingsFields).length > 0) {
    const setClauses = Object.keys(settingsFields).map((k) => `${k} = ?`).join(", ");
    const values = Object.values(settingsFields);
    db.prepare(`UPDATE user_settings SET ${setClauses}, updated_at = datetime('now') WHERE user_id = ?`)
      .run(...values, auth.user.id);
  }

  return NextResponse.json({ success: true });
}
