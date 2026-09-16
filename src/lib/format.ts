/**
 * Display formatting.
 *
 * All formatters take an explicit locale so that switching the interface to
 * Arabic later changes number and date rendering with it.
 */

const CURRENCY_LOCALE = "en-US";

/** `$2,850,000` — full precision, for the detail page. */
export function formatPrice(
  amount: number,
  currency = "USD",
  locale = CURRENCY_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** `$2.85M` — compact, for cards and dense tables. */
export function formatPriceCompact(
  amount: number,
  currency = "USD",
  locale = CURRENCY_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: amount >= 1_000_000 ? 2 : 0,
  }).format(amount);
}

/** Square metres, switching to hectares once a plot gets large. */
export function formatArea(sqm: number, locale = CURRENCY_LOCALE): string {
  if (sqm >= 50_000) {
    const ha = sqm / 10_000;
    return `${new Intl.NumberFormat(locale, {
      maximumFractionDigits: ha >= 100 ? 0 : 1,
    }).format(ha)} ha`;
  }
  return `${new Intl.NumberFormat(locale).format(sqm)} m²`;
}

export function formatNumber(value: number, locale = CURRENCY_LOCALE): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatPercent(
  value: number | null,
  locale = CURRENCY_LOCALE,
): string {
  if (value === null) return "—";
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)}%`;
}

export function formatDate(iso: string, locale = CURRENCY_LOCALE): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** Turns a title into a URL-safe slug. Used by the admin form. */
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
