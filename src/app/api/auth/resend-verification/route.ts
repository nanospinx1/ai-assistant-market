import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as UserRepo from "@/lib/repositories/users";
import { sendVerificationEmail, isEmailConfigured } from "@/lib/email";

export async function POST() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    // Don't resend if already verified
    if (UserRepo.isEmailVerified(auth.user.id)) {
      return NextResponse.json({ message: "Email already verified" });
    }

    if (!isEmailConfigured()) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
    }

    const code = UserRepo.generateVerifyCode();
    UserRepo.setVerifyCode(auth.user.id, code);

    await sendVerificationEmail(auth.user.email, code);

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }
}
