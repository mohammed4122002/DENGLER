/**
 * Display formatting.
 *
 * Every formatter takes a locale, so switching the interface to Arabic also
 * switches number grouping, currency placement, compact notation ("2.85 مليون"
 * rather than "2.85M") and month names.
 *
 * Both locales render Latin digits: `ar-AE` does so by default, and it is the
 * prevailing convention in Gulf property and investment material. The Arabic
 * copy in the dictionaries is written to match.
 */

/**
 * Removes the directional marks `Intl` wraps Arabic currency output in.
 *
 * `Intl` prefixes an RLM (U+200F) so the string reads right-to-left as a
 * whole. That makes the first strong character RTL, which drags the trailing
 * "$" of "US$" across to the wrong side of the letters — the price renders as
 * "$US 2,850,000". Stripping the mark lets the first strong character be the
 * "U", so an isolating container (`.numeric`, or a `<bdi>`) resolves the run
 * left-to-right and the symbol stays attached to its code.
 *
 * The isolation still keeps the whole price on the correct side of the line;
 * only the ordering *within* it is forced back to sanity.
 */
function stripBidiMarks(value: string): string {
  return value.replace(/[\u200E\u200F\u061C]/g, "").trim();
}

/**
 * How the currency is written, per locale.
 *
 * English gets the symbol — "$2,850,000" is what a reader expects. Arabic gets
 * the ISO code, because "$", "€" and "£" are bidi-neutral characters: next to
 * Latin letters in a right-to-left line they detach and jump to the wrong end,
 * turning "US$" into "$US" and "8.50 مليون US$" into "8.50 مليون $US". A code
 * is three strong Latin letters with nothing neutral to misplace, and
 * "2,850,000 USD" is also how Gulf investment material quotes a price.
 */
function currencyDisplay(locale: Locale): "symbol" | "code" {
  return locale === "ar" ? "code" : "symbol";
}

import { DEFAULT_LOCALE, LOCALE_META, type Locale } from "@/lib/i18n/config";

function tag(locale: Locale = DEFAULT_LOCALE): string {
  return LOCALE_META[locale]?.tag ?? LOCALE_META[DEFAULT_LOCALE].tag;
}

/** `$2,850,000` / `‏2,850,000 US$` — full precision, for the detail page. */
export function formatPrice(
  amount: number,
  currency = "USD",
  locale: Locale = DEFAULT_LOCALE,
): string {
  return stripBidiMarks(
    new Intl.NumberFormat(tag(locale), {
      style: "currency",
      currency,
      currencyDisplay: currencyDisplay(locale),
      maximumFractionDigits: 0,
    }).format(amount),
  );
}

/** `$2.85M` / `‏2.85 مليون US$` — compact, for cards and dense tables. */
export function formatPriceCompact(
  amount: number,
  currency = "USD",
  locale: Locale = DEFAULT_LOCALE,
): string {
  return stripBidiMarks(
    new Intl.NumberFormat(tag(locale), {
      style: "currency",
      currency,
      currencyDisplay: currencyDisplay(locale),
      notation: "compact",
      maximumFractionDigits: amount >= 1_000_000 ? 2 : 0,
    }).format(amount),
  );
}

/** Square metres, switching to hectares once a plot gets large. */
export function formatArea(sqm: number, locale: Locale = DEFAULT_LOCALE): string {
  const isArabic = locale === "ar";

  if (sqm >= 50_000) {
    const hectares = sqm / 10_000;
    const value = new Intl.NumberFormat(tag(locale), {
      maximumFractionDigits: hectares >= 100 ? 0 : 1,
    }).format(hectares);
    return isArabic ? `${value} هكتار` : `${value} ha`;
  }

  const value = new Intl.NumberFormat(tag(locale)).format(sqm);
  return isArabic ? `${value} م²` : `${value} m²`;
}

export function formatNumber(value: number, locale: Locale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(tag(locale)).format(value);
}

export function formatPercent(
  value: number | null,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (value === null) return "—";
  return `${new Intl.NumberFormat(tag(locale), { maximumFractionDigits: 1 }).format(value)}%`;
}

export function formatDate(iso: string, locale: Locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(tag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * Turns a title into a URL-safe slug.
 *
 * Arabic titles transliterate to nothing under this rule, so a slug derived
 * from one comes back empty — the admin form always derives the slug from the
 * English title, and `saveProperty` falls back to a stable id if that is empty
 * too. Arabic URLs would need percent-encoding on every link and would not be
 * readable in a pasted address, so slugs stay Latin for both locales.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
