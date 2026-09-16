/**
 * Localisation scaffolding.
 *
 * The interface ships in English. Everything that would need to change for an
 * Arabic release is centralised here, and the layout is already built on CSS
 * logical properties (`padding-inline`, `inset-inline`, `text-start`) rather
 * than left/right, so flipping `dir` mirrors the whole site without a second
 * stylesheet.
 *
 * To add Arabic:
 *   1. Add "ar" to LOCALES and a matching dictionary below.
 *   2. Resolve the locale from a cookie, a header or a route segment inside
 *      `getLocale()` — nothing else in the app reads the locale directly.
 *   3. Load an Arabic display face alongside Cormorant in `app/layout.tsx`.
 */

export const LOCALES = ["en"] as const;
export type Locale = (typeof LOCALES)[number];

export const RTL_LOCALES: readonly string[] = ["ar", "he", "fa", "ur"];

export const DEFAULT_LOCALE: Locale = "en";

/** Currently fixed. The single seam to widen when a second locale lands. */
export function getLocale(): Locale {
  return DEFAULT_LOCALE;
}

export function getDirection(locale: string): "ltr" | "rtl" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

export const dictionary = {
  en: {
    exploreProperties: "Explore Properties",
    investmentOpportunities: "Investment Opportunities",
    viewProperty: "View Property",
    requestDetails: "Request Investment Details",
    featured: "Featured Properties",
    searchPlaceholder: "Search by name, city or country",
  },
} as const;

export function t(key: keyof (typeof dictionary)["en"], locale: Locale = DEFAULT_LOCALE) {
  return dictionary[locale][key];
}
