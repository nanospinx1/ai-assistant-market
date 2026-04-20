import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { seedDatabase } from "@/lib/seed";
import * as UserRepo from "@/lib/repositories/users";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    seedDatabase();
    const user = UserRepo.findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = UserRepo.verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await createSession({ id: user.id, email: user.email, name: user.name, company: user.company ?? undefined });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, company: user.company ?? undefined },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
