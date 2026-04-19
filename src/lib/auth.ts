import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-in-production-ai-market-2026"
);

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  company?: string;
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ id: user.id, email: user.email, name: user.name, company: user.company })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set("session-token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session-token");
}

export function initializeDb() {
  seedDatabase();
  return getDb();
}
