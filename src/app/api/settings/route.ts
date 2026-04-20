import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as UserRepo from "@/lib/repositories/users";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const user = UserRepo.findUserById(auth.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const settings = UserRepo.getUserSettings(auth.user.id);

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

  if (body.name !== undefined) {
    UserRepo.updateUserName(auth.user.id, body.name);
  }

  const allowedFields = [
    "company_name", "industry", "company_size",
    "team_size", "customer_volume", "business_type",
    "notification_email_errors", "notification_email_tasks", "notification_email_weekly",
    "notification_inapp", "notification_status_alerts",
    "default_model_tier",
  ];

  const settingsFields: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      settingsFields[field] = typeof body[field] === "boolean" ? (body[field] ? 1 : 0) : body[field];
    }
  }

  if (Object.keys(settingsFields).length > 0) {
    UserRepo.updateSettings(auth.user.id, settingsFields);
  }

  return NextResponse.json({ success: true });
}
