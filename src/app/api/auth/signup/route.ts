import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { seedDatabase } from "@/lib/seed";
import * as UserRepo from "@/lib/repositories/users";
import { sendVerificationEmail, isEmailConfigured } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, company } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    seedDatabase();
    const existing = UserRepo.findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = UserRepo.hashPassword(password);
    const id = require("uuid").v4();
    UserRepo.createUser(id, email, name, hashedPassword, company);

    // Generate verification code
    const code = UserRepo.generateVerifyCode();
    UserRepo.setVerifyCode(id, code);

    // Send verification email (or auto-verify if email not configured)
    let autoVerified = false;
    if (isEmailConfigured()) {
      try {
        await sendVerificationEmail(email, code);
      } catch (err) {
        console.error("Failed to send verification email:", err);
        // Still allow signup, user can resend later
      }
    } else {
      // Dev mode: auto-verify when no email service
      UserRepo.verifyEmail(id, code);
      autoVerified = true;
    }

    await createSession({ id, email, name, company, email_verified: autoVerified });

    return NextResponse.json({
      user: { id, email, name, company, email_verified: autoVerified },
      verification_required: !autoVerified,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
