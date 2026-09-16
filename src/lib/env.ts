/**
 * Environment access.
 *
 * Only `NEXT_PUBLIC_*` values are readable from the browser. Everything else
 * in this file must only ever be touched from server components, route
 * handlers or server actions — `serverEnv` throws if that is violated.
 */

export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

/**
 * True when both public Supabase values are present. When false the platform
 * runs against the in-memory demo catalogue instead, and the UI says so.
 */
export const isSupabaseConfigured = Boolean(
  publicEnv.supabaseUrl && publicEnv.supabaseAnonKey,
);

function serverOnly(name: string): string {
  if (typeof window !== "undefined") {
    throw new Error(
      `${name} is server-only and must never be read in the browser.`,
    );
  }
  return process.env[name] ?? "";
}

export const serverEnv = {
  get serviceRoleKey() {
    return serverOnly("SUPABASE_SERVICE_ROLE_KEY");
  },
  get adminPassword() {
    return serverOnly("ADMIN_PASSWORD");
  },
  get adminSessionSecret() {
    return serverOnly("ADMIN_SESSION_SECRET");
  },
};
