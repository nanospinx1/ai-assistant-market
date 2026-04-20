import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const db = getDb();
  const url = req.nextUrl;
  const unreadOnly = url.searchParams.get("unread") === "true";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10) || 20, 100);

  let query = "SELECT * FROM notifications WHERE user_id = ?";
  const params: (string | number)[] = [user.id];

  if (unreadOnly) {
    query += " AND is_read = 0";
  }

  query += " ORDER BY created_at DESC LIMIT ?";
  params.push(limit);

  const notifications = db.prepare(query).all(...params);

  // Also return unread count
  const unreadCount = (
    db.prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0").get(user.id) as any
  ).count;

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const db = getDb();

  if (body.markAllRead) {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0").run(user.id);
    return NextResponse.json({ success: true });
  }

  if (Array.isArray(body.ids) && body.ids.length > 0) {
    const placeholders = body.ids.map(() => "?").join(", ");
    db.prepare(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${placeholders})`
    ).run(user.id, ...body.ids);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Provide ids array or markAllRead: true" }, { status: 400 });
}
