import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import * as DeploymentRepo from "@/lib/repositories/deployments";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-in-production-ai-market-2026"
);

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  company?: string;
  email_verified?: boolean;
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    company: user.company,
    email_verified: user.email_verified ?? false,
  })
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
 * Require authenticated AND email-verified user.
 * Returns 403 if not verified.
 */
export async function requireVerified(): Promise<
  { user: SessionUser; error?: never } | { user?: never; error: NextResponse }
> {
  const result = await requireAuth();
  if (result.error) return result;
  
  // Check live verification status from DB
  const { isEmailVerified } = await import("@/lib/repositories/users");
  if (!isEmailVerified(result.user.id)) {
    return { error: NextResponse.json({ error: "Email not verified" }, { status: 403 }) };
  }
  return result;
}

/**
 * Verify that a deployment belongs to the authenticated user.
 * Uses the deployments repository.
 */
export function verifyDeploymentOwnership(
  deploymentId: string,
  userId: string
): { deployment: any; error?: never } | { deployment?: never; error: NextResponse } {
  const deployment = DeploymentRepo.findByIdAndUser(deploymentId, userId);
  if (!deployment) {
    return { error: NextResponse.json({ error: "Deployment not found" }, { status: 404 }) };
  }
  return { deployment };
}
