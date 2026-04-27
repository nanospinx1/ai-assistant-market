import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { seedDatabase } from "@/lib/seed";
import * as UserRepo from "@/lib/repositories/users";

export async function GET() {
  seedDatabase();
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  // Hydrate email_verified from DB (not stale JWT)
  const verified = UserRepo.isEmailVerified(session.id);
  return NextResponse.json({
    user: { ...session, email_verified: verified },
  });
}
