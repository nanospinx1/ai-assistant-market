import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as NotificationRepo from "@/lib/repositories/notifications";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const url = req.nextUrl;
  const unreadOnly = url.searchParams.get("unread") === "true";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10) || 20, 100);

  const notifications = NotificationRepo.listByUser(user.id, unreadOnly, limit);
  const unreadCount = NotificationRepo.unreadCount(user.id);

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();

  if (body.markAllRead) {
    NotificationRepo.markAllRead(user.id);
    return NextResponse.json({ success: true });
  }

  if (Array.isArray(body.ids) && body.ids.length > 0) {
    NotificationRepo.markRead(user.id, body.ids);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Provide ids array or markAllRead: true" }, { status: 400 });
}
