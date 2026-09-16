import type { Metadata } from "next";

import { LOCALES, LOCALE_META, localePath, type Locale } from "./config";

/**
 * Canonical + hreflang for one page, in one call.
 *
 * Every localised page must declare both, or the two language trees look like
 * duplicate content to a crawler rather than translations of each other. The
 * `x-default` points at English.
 */
export function buildAlternates(
  locale: Locale,
  path: string,
): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localePath(locale, path),
    languages: Object.fromEntries([
      ...LOCALES.map((l) => [LOCALE_META[l].hreflang, localePath(l, path)]),
      ["x-default", localePath("en", path)],
    ]),
  };
}

export { getDictionary } from "./index";
export { isLocale, type Locale } from "./config";
