import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { seedDatabase } from "@/lib/seed";
import * as UserRepo from "@/lib/repositories/users";

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
    await createSession({ id, email, name, company });

    return NextResponse.json({
      user: { id, email, name, company },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
