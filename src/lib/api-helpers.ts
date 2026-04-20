/**
 * Shared API response helpers and route wrappers.
 *
 * Every API route should use these instead of raw NextResponse.json() calls
 * to guarantee a consistent response envelope and error format.
 */
import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  Response helpers                                                    */
/* ------------------------------------------------------------------ */

/** 200 OK with JSON body */
export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** 201 Created */
export function jsonCreated<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

/** Error response with consistent { error, code? } shape */
export function jsonError(message: string, status = 400, code?: string) {
  const body: { error: string; code?: string } = { error: message };
  if (code) body.code = code;
  return NextResponse.json(body, { status });
}

/* Shorthand error factories */
export const notFound = (msg = "Not found") => jsonError(msg, 404);
export const unauthorized = (msg = "Unauthorized") => jsonError(msg, 401);
export const forbidden = (msg = "Forbidden") => jsonError(msg, 403);
export const conflict = (msg: string) => jsonError(msg, 409);
export const gone = (msg: string) => jsonError(msg, 410);
export const serverError = (msg = "Internal server error") => jsonError(msg, 500);

/* ------------------------------------------------------------------ */
/*  Input helpers                                                       */
/* ------------------------------------------------------------------ */

/** Safely parse a positive integer query param with a default and max. */
export function intParam(
  raw: string | null,
  defaultVal: number,
  max = 200,
): number {
  const n = parseInt(raw || String(defaultVal), 10);
  if (isNaN(n) || n < 0) return defaultVal;
  return Math.min(n, max);
}
