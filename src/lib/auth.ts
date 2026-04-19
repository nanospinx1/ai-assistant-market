import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";
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

/**
 * Require authentication for API routes.
 * Returns the session user or a 401 response.
 */
export async function requireAuth(): Promise<
  { user: SessionUser; error?: never } | { user?: never; error: NextResponse }
> {
  const user = await getSession();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user };
}

/**
 * Verify that a deployment belongs to the authenticated user.
 * Returns the deployment row or a 404 response.
 */
export function verifyDeploymentOwnership(
  deploymentId: string,
  userId: string
): { deployment: any; error?: never } | { deployment?: never; error: NextResponse } {
  const db = getDb();
  const deployment = db
    .prepare("SELECT * FROM deployments WHERE id = ? AND user_id = ?")
    .get(deploymentId, userId) as any;

  if (!deployment) {
    return { error: NextResponse.json({ error: "Deployment not found" }, { status: 404 }) };
  }
  return { deployment };
}

export function initializeDb() {
  seedDatabase();
  return getDb();
}
