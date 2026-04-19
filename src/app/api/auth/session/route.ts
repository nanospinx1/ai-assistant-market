import { NextResponse } from "next/server";
import { getSession, initializeDb } from "@/lib/auth";

export async function GET() {
  initializeDb();
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: session });
}
