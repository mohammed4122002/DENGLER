import type { Metadata } from "next";

import { SITE } from "@/lib/site";
import { LOCALES, LOCALE_META, localePath, type Locale } from "./config";

/**
 * Canonical, hreflang and `og:url` for one page, in one call.
 *
 * All three are returned together on purpose. `openGraph` merges as a whole in
 * Next's metadata resolution: a page that sets `alternates` but not
 * `openGraph` silently keeps the *layout's* `openGraph.url`, which points at
 * the locale root. Every interior page was therefore advertising the home page
 * as its Open Graph URL, so a shared link to a listing resolved to the home
 * page. Returning them as one object makes that impossible to forget.
 *
 * `x-default` points at English. Both locales list each other, which is what
 * the hreflang spec requires — a one-way declaration is ignored.
 */
export function buildAlternates(locale: Locale, path: string): Metadata {
  return {
    alternates: {
      canonical: localePath(locale, path),
      languages: Object.fromEntries([
        ...LOCALES.map((l) => [LOCALE_META[l].hreflang, localePath(l, path)]),
        ["x-default", localePath("en", path)],
      ]),
    },
    openGraph: {
      url: `${SITE.url}${localePath(locale, path)}`,
      locale: LOCALE_META[locale].tag,
      alternateLocale: LOCALES.filter((l) => l !== locale).map(
        (l) => LOCALE_META[l].tag,
      ),
    },
  };
}

export { getDictionary } from "./index";
export { isLocale, type Locale } from "./config";
