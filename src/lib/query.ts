import {
  INVESTMENT_TYPES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  type InvestmentType,
  type PropertyQuery,
  type PropertyStatus,
  type PropertyType,
} from "@/lib/types";

/** Next 15 hands page props their search params as a promise of this shape. */
export type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function num(value: string | string[] | undefined): number | undefined {
  const raw = first(value);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function oneOf<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  const raw = first(value);
  return raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : undefined;
}

const SORTS = ["newest", "price_asc", "price_desc", "roi_desc", "area_desc"] as const;

/**
 * Turns raw query params into a validated `PropertyQuery`.
 *
 * Anything unrecognised is dropped rather than passed through, so a crafted
 * URL can't reach the database with an unexpected column or operator.
 */
export function parsePropertyQuery(
  params: SearchParams,
  overrides: Partial<PropertyQuery> = {},
): PropertyQuery {
  const query: PropertyQuery = {
    q: first(params.q)?.slice(0, 120),
    type: oneOf<PropertyType>(params.type, PROPERTY_TYPES),
    country: first(params.country)?.slice(0, 80),
    city: first(params.city)?.slice(0, 80),
    minPrice: num(params.minPrice),
    maxPrice: num(params.maxPrice),
    minArea: num(params.minArea),
    bedrooms: num(params.bedrooms),
    investmentType: oneOf<InvestmentType>(params.investmentType, INVESTMENT_TYPES),
    minRoi: num(params.minRoi),
    status: oneOf<PropertyStatus>(params.status, PROPERTY_STATUSES),
    sort: oneOf(params.sort, SORTS) ?? "newest",
    ...overrides,
  };

  // Strip undefined so the Supabase builder doesn't add empty predicates.
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined),
  ) as PropertyQuery;
}

/** A readable summary of the active filters, used in the results header. */
export function describeQuery(query: PropertyQuery): string | null {
  const parts: string[] = [];
  if (query.q) parts.push(`“${query.q}”`);
  if (query.country) parts.push(query.country);
  if (query.minPrice) parts.push(`from $${(query.minPrice / 1_000_000).toFixed(1)}M`);
  if (query.maxPrice) parts.push(`up to $${(query.maxPrice / 1_000_000).toFixed(1)}M`);
  if (query.minRoi) parts.push(`${query.minRoi}%+ ROI`);
  return parts.length ? parts.join(" · ") : null;
}
