import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as UserRepo from "@/lib/repositories/users";

export async function PUT(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current and new passwords are required" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }
  if (!/[A-Z]/.test(newPassword)) {
    return NextResponse.json({ error: "New password must contain an uppercase letter" }, { status: 400 });
  }
  if (!/[a-z]/.test(newPassword)) {
    return NextResponse.json({ error: "New password must contain a lowercase letter" }, { status: 400 });
  }
  if (!/[0-9]/.test(newPassword)) {
    return NextResponse.json({ error: "New password must contain a number" }, { status: 400 });
  }

  const user = UserRepo.findUserById(auth.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const valid = UserRepo.verifyPassword(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
  }

  UserRepo.updateUserPassword(auth.user.id, UserRepo.hashPassword(newPassword));

  return NextResponse.json({ success: true });
}
