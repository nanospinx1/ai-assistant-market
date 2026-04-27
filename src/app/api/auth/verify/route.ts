import { NextRequest, NextResponse } from "next/server";
import { requireAuth, createSession } from "@/lib/auth";
import * as UserRepo from "@/lib/repositories/users";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    const success = UserRepo.verifyEmail(auth.user.id, code.toUpperCase().trim());
    if (!success) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // Re-issue session with updated email_verified
    await createSession({ ...auth.user, email_verified: true });

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
