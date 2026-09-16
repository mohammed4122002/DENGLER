import type { Locale } from "@/lib/i18n/config";

/**
 * DENGLER domain model.
 *
 * These types are the contract between the data layer (Supabase or the
 * in-memory demo store) and every view. Field names mirror the Postgres
 * columns 1:1 so that a row maps onto a `Property` with no translation layer.
 */

export const PROPERTY_TYPES = ["villa", "hotel", "land"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_STATUSES = [
  "available",
  "reserved",
  "sold",
  "off_market",
] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const INVESTMENT_TYPES = [
  "buy_to_hold",
  "rental_yield",
  "hospitality_operation",
  "development",
  "capital_appreciation",
] as const;
export type InvestmentType = (typeof INVESTMENT_TYPES)[number];

export const INQUIRY_STATUSES = ["new", "contacted", "closed"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  alt: string;
  sort_order: number;
  created_at: string;
}

export interface Property {
  id: string;
  /** Slugs stay Latin in both locales — see `slugify` for why. */
  slug: string;

  /*
   * Localised text.
   *
   * The English field is required; the `_ar` field is nullable and falls back
   * to English when absent, so a half-translated catalogue degrades to a
   * readable page rather than an empty one. `localizeProperty` resolves the
   * pair into the plain field for a given locale.
   */
  title: string;
  title_ar: string | null;
  description: string;
  description_ar: string | null;
  property_type: PropertyType;
  status: PropertyStatus;

  price: number;
  currency: string;

  location: string;
  location_ar: string | null;
  country: string;
  country_ar: string | null;
  city: string;
  city_ar: string | null;
  latitude: number | null;
  longitude: number | null;

  /** Plot or built area in square metres. */
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  year_built: number | null;

  investment_type: InvestmentType;
  /** Projected return on investment, as a percentage (e.g. 14.2). */
  roi: number | null;
  annual_revenue: number | null;
  /** Percentage, 0–100. */
  occupancy_rate: number | null;
  /** Projected annual capital appreciation, as a percentage. */
  appreciation: number | null;

  featured: boolean;
  published: boolean;

  cover_image: string;
  /** Short editorial line used on cards and meta descriptions. */
  tagline: string;
  tagline_ar: string | null;

  created_at: string;
  updated_at: string;

  /** Hydrated relations. */
  images: PropertyImage[];
  features: string[];
  features_ar: string[];
}

/**
 * A `Property` whose display fields have been resolved for one locale.
 *
 * The `_ar` fields are still present — the admin dashboard edits both — but
 * `title`, `tagline`, `description`, `location`, `city`, `country` and
 * `features` now hold the text for `locale`. Public pages only ever receive
 * this type, so a component never has to know which language it is rendering.
 */
export interface LocalizedProperty extends Property {
  locale: Locale;
}

export interface Inquiry {
  id: string;
  property_id: string | null;
  property_title: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: InquiryStatus;
  created_at: string;
}

export interface SiteStat {
  id: string;
  label: string;
  value: string;
  sort_order: number;
}

/** Filters accepted by the search / listing pages. */
export interface PropertyQuery {
  q?: string;
  type?: PropertyType | "all";
  country?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  bedrooms?: number;
  investmentType?: InvestmentType | "all";
  minRoi?: number;
  status?: PropertyStatus | "all";
  sort?: "newest" | "price_asc" | "price_desc" | "roi_desc" | "area_desc";
  featuredOnly?: boolean;
  limit?: number;
}

/**
 * Human-readable labels for every enum live in the dictionaries
 * (`dict.enums.*`), not here — a label is copy, and copy is translated.
 */

/** Resolves a property's display text for one locale, falling back to English. */
export function localizeProperty(
  property: Property,
  locale: Locale,
): LocalizedProperty {
  if (locale !== "ar") return { ...property, locale };

  return {
    ...property,
    locale,
    title: property.title_ar || property.title,
    tagline: property.tagline_ar || property.tagline,
    description: property.description_ar || property.description,
    location: property.location_ar || property.location,
    city: property.city_ar || property.city,
    country: property.country_ar || property.country,
    // An empty Arabic list means "not translated yet", so fall back wholesale
    // rather than showing a partial feature list.
    features: property.features_ar.length ? property.features_ar : property.features,
  };
}
