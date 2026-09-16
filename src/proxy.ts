import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  negotiateLocale,
  type Locale,
} from "@/lib/i18n/config";

/**
 * Next 16 renamed the `middleware` convention to `proxy`; this is that file.
 *
 * Two jobs, in order.
 *
 * 1. Locale routing. Every page lives under `/en/…` or `/ar/…`; a request
 *    without a prefix is redirected to one. The choice is the visitor's saved
 *    cookie first, then their `Accept-Language`, then English — so a first-time
 *    Arabic speaker lands on the Arabic site without touching the switcher,
 *    and anyone who has switched stays where they put themselves.
 *
 * 2. Supabase session refresh. Server Components cannot write cookies, so a
 *    token expiring mid-session would silently sign an admin out. Middleware is
 *    the one place that can renew it and return the refreshed cookie.
 *
 * With Supabase unconfigured, step 2 is skipped entirely.
 */

/** Paths that must never be locale-prefixed. */
const PASSTHROUGH = [
  "/_next",
  "/api",
  "/media",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

function resolveLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && isLocale(saved)) return saved;
  return negotiateLocale(request.headers.get("accept-language"));
}

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (PASSTHROUGH.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split("/")[1];

  if (!isLocale(firstSegment)) {
    const locale = resolveLocale(request);
    const target = new URL(
      `/${locale}${pathname === "/" ? "" : pathname}${search}`,
      request.url,
    );
    // 307, not 308: the preferred locale can change when the visitor switches,
    // and a permanent redirect would be cached against them.
    return NextResponse.redirect(target, 307);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    const response = NextResponse.next();
    // Remember the locale that was actually served, so a later unprefixed
    // request lands in the same language.
    if (request.cookies.get(LOCALE_COOKIE)?.value !== firstSegment) {
      response.cookies.set(LOCALE_COOKIE, firstSegment, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return response;
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touching getUser() is what triggers the refresh. Do not remove.
  await supabase.auth.getUser();

  if (request.cookies.get(LOCALE_COOKIE)?.value !== firstSegment) {
    response.cookies.set(LOCALE_COOKIE, firstSegment, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image optimisation — those never
     * need a session or a locale, and would only add latency.
     */
    "/((?!_next/static|_next/image|favicon.ico|media/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};

export { DEFAULT_LOCALE };
