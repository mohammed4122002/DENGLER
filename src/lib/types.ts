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
  title: string;
  slug: string;
  description: string;
  property_type: PropertyType;
  status: PropertyStatus;

  price: number;
  currency: string;

  location: string;
  country: string;
  city: string;
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

  created_at: string;
  updated_at: string;

  /** Hydrated relations. */
  images: PropertyImage[];
  features: string[];
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

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  villa: "Villa",
  hotel: "Hotel",
  land: "Land",
};

export const PROPERTY_TYPE_PLURALS: Record<PropertyType, string> = {
  villa: "Villas",
  hotel: "Hotels",
  land: "Land",
};

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  off_market: "Off market",
};

export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  buy_to_hold: "Buy to hold",
  rental_yield: "Rental yield",
  hospitality_operation: "Hospitality operation",
  development: "Development",
  capital_appreciation: "Capital appreciation",
};

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};
