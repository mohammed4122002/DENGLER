import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { isSupabaseConfigured, serverEnv } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

const COOKIE = "dengler_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8; // One working day.

export type AdminAccess =
  | { ok: true; via: "supabase"; email: string }
  | { ok: true; via: "password" }
  | { ok: true; via: "dev-open" }
  | { ok: false; reason: "unauthenticated" | "not-admin" | "not-configured" };

/* ------------------------------------------------------------------ *
 * Signed cookie (demo mode)
 * ------------------------------------------------------------------ */

/**
 * The cookie is `expiry.nonce.hmac`. It carries no user data — it only
 * asserts "this browser proved knowledge of ADMIN_PASSWORD before <expiry>",
 * which is all the demo gate needs to say.
 */
function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual throws on a length mismatch, so compare lengths first —
  // length is not the secret here, the value is.
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

function sessionSecret(): string {
  // Falling back to the password keeps the gate working when only
  // ADMIN_PASSWORD is set, which is the common single-variable setup.
  return serverEnv.adminSessionSecret || serverEnv.adminPassword;
}

export function issueSessionValue(): string {
  const expiry = Date.now() + MAX_AGE_SECONDS * 1000;
  const nonce = randomBytes(12).toString("hex");
  const payload = `${expiry}.${nonce}`;
  return `${payload}.${sign(payload, sessionSecret())}`;
}

function verifySessionValue(value: string | undefined): boolean {
  if (!value) return false;

  const parts = value.split(".");
  if (parts.length !== 3) return false;

  const [expiry, nonce, signature] = parts;
  const payload = `${expiry}.${nonce}`;

  if (!safeEqual(signature, sign(payload, sessionSecret()))) return false;

  const expiresAt = Number(expiry);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export const ADMIN_COOKIE = COOKIE;
export const ADMIN_COOKIE_MAX_AGE = MAX_AGE_SECONDS;

/**
 * Constant-time check of a submitted password against ADMIN_PASSWORD.
 * Returns false when no password is configured — an unset variable must never
 * mean "everything matches".
 */
export function passwordMatches(submitted: string): boolean {
  const expected = serverEnv.adminPassword;
  if (!expected) return false;
  return safeEqual(submitted, expected);
}

/* ------------------------------------------------------------------ *
 * Access check
 * ------------------------------------------------------------------ */

/**
 * Resolves whether the current request may use the dashboard.
 *
 *  · Supabase configured → the signed-in user must have profiles.role = 'admin'.
 *  · Otherwise           → a valid signed cookie from the password gate.
 *  · Development only    → if no ADMIN_PASSWORD is set at all, the dashboard
 *                          opens so the demo is explorable out of the box.
 *                          This never applies in production.
 */
export async function checkAdminAccess(): Promise<AdminAccess> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { ok: false, reason: "unauthenticated" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") return { ok: false, reason: "not-admin" };
    return { ok: true, via: "supabase", email: user.email ?? "" };
  }

  const store = await cookies();
  if (verifySessionValue(store.get(COOKIE)?.value)) {
    return { ok: true, via: "password" };
  }

  if (!serverEnv.adminPassword) {
    return process.env.NODE_ENV === "production"
      ? { ok: false, reason: "not-configured" }
      : { ok: true, via: "dev-open" };
  }

  return { ok: false, reason: "unauthenticated" };
}

/** Throws unless the caller is an admin. Every admin server action calls this. */
export async function requireAdmin(): Promise<void> {
  const access = await checkAdminAccess();
  if (!access.ok) {
    throw new Error("Not authorised.");
  }
}
