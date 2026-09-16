/**
 * Environment access.
 *
 * Only `NEXT_PUBLIC_*` values are readable from the browser. Everything else
 * in this file must only ever be touched from server components, route
 * handlers or server actions — `serverEnv` throws if that is violated.
 */

/**
 * Treats an empty or whitespace-only variable as unset.
 *
 * This is not defensive padding. Next inlines `process.env.NEXT_PUBLIC_*` at
 * build time and substitutes an **empty string** for a variable that has no
 * value — so `process.env.X ?? fallback` never reaches the fallback, because
 * `""` is neither null nor undefined. That is precisely how every Vercel
 * build of this project failed: `siteUrl` resolved to `""` and
 * `new URL("")` threw `ERR_INVALID_URL` while prerendering.
 *
 * Use this rather than `??` for any variable with a default.
 */
function read(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** `dengler.vercel.app` → `https://dengler.vercel.app`. */
function withProtocol(host: string): string {
  return /^https?:\/\//i.test(host) ? host : `https://${host}`;
}

/**
 * The public origin, used for canonical URLs, hreflang, Open Graph and the
 * sitemap.
 *
 * Falling straight back to localhost on a deployed site would be its own bug —
 * every canonical and OG URL would point at a machine nobody can reach — so
 * the platform's own host is consulted first. `VERCEL_PROJECT_PRODUCTION_URL`
 * is stable across deployments; `VERCEL_URL` is the per-deployment host, which
 * is what previews should advertise.
 */
function resolveSiteUrl(): string {
  const explicit = read(process.env.NEXT_PUBLIC_SITE_URL);

  if (explicit) {
    const candidate = withProtocol(explicit);
    try {
      new URL(candidate);
      return candidate;
    } catch {
      // An explicitly configured value that cannot parse is a mistake worth
      // surfacing loudly, rather than silently publishing localhost canonicals.
      throw new Error(
        `NEXT_PUBLIC_SITE_URL is not a valid URL: ${JSON.stringify(explicit)}`,
      );
    }
  }

  const platformHost =
    read(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) ??
    read(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    read(process.env.NEXT_PUBLIC_VERCEL_URL) ??
    read(process.env.VERCEL_URL);

  if (platformHost) {
    const candidate = withProtocol(platformHost);
    try {
      new URL(candidate);
      return candidate;
    } catch {
      // Not the operator's doing — fall through to the local default.
    }
  }

  return "http://localhost:3000";
}

export const publicEnv = {
  siteUrl: resolveSiteUrl(),
  supabaseUrl: read(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? "",
  supabaseAnonKey: read(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? "",
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
  // Dynamic access on purpose: it is not inlined into any bundle, so these
  // names cannot leak into client JavaScript the way a literal read would.
  return read(process.env[name]) ?? "";
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
