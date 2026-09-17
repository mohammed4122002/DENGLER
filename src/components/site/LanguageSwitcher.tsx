"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_META,
  localePath,
  stripLocale,
  type Locale,
} from "@/lib/i18n/config";

/**
 * Switches language without losing the reader's place.
 *
 * It rewrites the current path rather than sending everyone to the home page —
 * `/en/properties/palm-residence-dubai?type=villa` becomes the same
 * listing in Arabic, filters intact. That works because slugs and query keys
 * are locale-independent by design.
 *
 * Real anchors, not a client-side toggle: the language of a page is part of its
 * URL, so switching is a navigation. It also means the control works before
 * hydration and can be opened in a new tab.
 */
interface SwitcherProps {
  locale: Locale;
  tone?: "dark" | "light";
  label: string;
}

/**
 * `useSearchParams` opts a component out of static prerendering, and this one
 * lives in the root layout — without a boundary it would make every page in
 * the site dynamic.
 *
 * So it renders behind Suspense with a fallback that is the same control minus
 * the query string. The server prerenders working language links; the client
 * swaps in the version that also carries the active filters. Nothing is ever
 * missing, and no page loses its static rendering.
 */
export function LanguageSwitcher(props: SwitcherProps) {
  return (
    <Suspense fallback={<Switcher {...props} suffix="" />}>
      <SwitcherWithQuery {...props} />
    </Suspense>
  );
}

function SwitcherWithQuery(props: SwitcherProps) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  return <Switcher {...props} suffix={query ? `?${query}` : ""} />;
}

function Switcher({
  locale,
  tone = "dark",
  label,
  suffix,
}: SwitcherProps & { suffix: string }) {
  const pathname = usePathname();
  const bare = stripLocale(pathname ?? "/");
  const isLight = tone === "light";

  return (
    <div
      className={`flex items-center gap-1 ${isLight ? "text-white/70" : "text-graphite"}`}
      role="group"
      aria-label={label}
    >
      {LOCALES.map((target, index) => {
        const current = target === locale;

        return (
          <span key={target} className="flex items-center">
            {index > 0 && (
              <span
                className={`mx-1 text-[10px] ${isLight ? "text-white/25" : "text-hairline"}`}
                aria-hidden
              >
                /
              </span>
            )}
            <Link
              href={`${localePath(target, bare)}${suffix}`}
              hrefLang={LOCALE_META[target].hreflang}
              lang={LOCALE_META[target].tag}
              aria-current={current ? "true" : undefined}
              // Persist the choice for any later unprefixed request, so the
              // middleware sends them back to the same language next time.
              onClick={() => {
                document.cookie = `${LOCALE_COOKIE}=${target};path=/;max-age=31536000;samesite=lax`;
              }}
              className={`text-xs transition-colors duration-300 ${
                current
                  ? isLight
                    ? "text-gold-soft"
                    : "text-gold-deep"
                  : "hover:text-gold"
              }`}
            >
              {/* The language's own name, never translated — a reader looking
                  for Arabic is looking for "العربية", not "Arabic". Below the
                  `sm` breakpoint it contracts to a single letter: at 320px the
                  full word plus the wordmark and the menu button do not fit,
                  and a switcher that overflows is worse than a terse one. */}
              {target === "ar" ? (
                <>
                  <span className="sm:hidden">{LOCALE_META[target].short}</span>
                  <span className="hidden sm:inline">{LOCALE_META[target].name}</span>
                </>
              ) : (
                LOCALE_META[target].short
              )}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
