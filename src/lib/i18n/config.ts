/**
 * Locale configuration.
 *
 * Both locales are first-class: each has its own URL prefix, its own metadata,
 * its own typeface pairing and its own copy of every property record. Arabic is
 * not a translation layer bolted onto an English site — `ar` and `en` are peers.
 */

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_META: Record<
  Locale,
  {
    /** The language's own name, used in the switcher — never a translation. */
    name: string;
    /** Short form for the compact switcher. */
    short: string;
    dir: "ltr" | "rtl";
    /** BCP 47 tag for Intl formatting and the `lang` attribute. */
    tag: string;
    /** hreflang value. */
    hreflang: string;
  }
> = {
  en: { name: "English", short: "EN", dir: "ltr", tag: "en", hreflang: "en" },
  ar: { name: "العربية", short: "ع", dir: "rtl", tag: "ar-AE", hreflang: "ar" },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return LOCALE_META[locale].dir;
}

export function isRtl(locale: Locale): boolean {
  return LOCALE_META[locale].dir === "rtl";
}

/** `/properties/x` → `/ar/properties/x`. Used by the switcher and hreflang. */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Strips a locale prefix back off a pathname. */
export function stripLocale(pathname: string): string {
  const segments = pathname.split("/");
  if (segments.length > 1 && isLocale(segments[1])) {
    const rest = segments.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname;
}

/** Picks the best locale from an Accept-Language header. */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
}

/** Cookie the switcher writes so a returning visitor keeps their choice. */
export const LOCALE_COOKIE = "dengler_locale";
