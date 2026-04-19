import { NextRequest, NextResponse } from "next/server";
import { createSession, initializeDb } from "@/lib/auth";
import bcryptjs from "bcryptjs";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, company } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const db = initializeDb();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const id = uuid();
    const hashedPassword = bcryptjs.hashSync(password, 10);
    db.prepare("INSERT INTO users (id, email, name, password, company) VALUES (?, ?, ?, ?, ?)")
      .run(id, email, name, hashedPassword, company || null);

    await createSession({ id, email, name, company });

    return NextResponse.json({
      user: { id, email, name, company },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
