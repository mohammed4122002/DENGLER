import type { Property, PropertyQuery } from "@/lib/types";

/**
 * Case-, diacritic- and orthography-insensitive text for the free-text search.
 *
 * The NFD pass strips Latin accents (Zürich → Zurich). It also decomposes the
 * hamza-carrying Arabic letters — إ becomes ا plus a combining hamza-below —
 * which is why the mark range cleared afterwards runs to U+065F rather than
 * stopping at the harakat. Miss that and "الامارات" would not match
 * "الإمارات", which is how most people actually type it.
 *
 * The explicit replacements then fold the letter forms Arabic writers use
 * interchangeably — أ/إ/آ → ا, ى → ي, ة → ه — and tatweel is dropped.
 *
 * `public.fold_arabic` in 0002_bilingual.sql must stay equivalent to this:
 * that folds the indexed column, this folds the query term, so a difference
 * between them shows up as a search that silently returns nothing.
 */
export function foldSearchText(value: string): string {
  return value
    .normalize("NFD")
    // Latin combining accents.
    .replace(/[̀-ͯ]/g, "")
    // Arabic harakat, plus the combining hamza forms NFD just produced.
    .replace(/[ً-ٰٟ]/g, "")
    // Tatweel is decorative elongation and carries no meaning.
    .replace(/ـ/g, "")
    .replace(/[آأإ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase();
}

export function matchesQuery(property: Property, query: PropertyQuery): boolean {
  const {
    q,
    type,
    country,
    city,
    minPrice,
    maxPrice,
    minArea,
    bedrooms,
    investmentType,
    minRoi,
    status,
    featuredOnly,
  } = query;

  if (type && type !== "all" && property.property_type !== type) return false;
  if (country && property.country !== country) return false;
  if (city && property.city !== city) return false;
  if (typeof minPrice === "number" && property.price < minPrice) return false;
  if (typeof maxPrice === "number" && property.price > maxPrice) return false;
  if (typeof minArea === "number" && property.area < minArea) return false;
  if (typeof bedrooms === "number" && (property.bedrooms ?? 0) < bedrooms) return false;
  if (investmentType && investmentType !== "all" && property.investment_type !== investmentType) {
    return false;
  }
  if (typeof minRoi === "number" && (property.roi ?? 0) < minRoi) return false;
  if (status && status !== "all" && property.status !== status) return false;
  if (featuredOnly && !property.featured) return false;

  if (q && q.trim()) {
    const needle = foldSearchText(q.trim());
    // Both languages go into the haystack, so an Arabic query finds a record
    // whose English text matches and vice versa — a visitor searching "Dubai"
    // on the Arabic site should still find دبي.
    const haystack = foldSearchText(
      [
        property.title,
        property.title_ar,
        property.tagline,
        property.tagline_ar,
        property.location,
        property.location_ar,
        property.city,
        property.city_ar,
        property.country,
        property.country_ar,
        property.description,
        property.description_ar,
        property.features.join(" "),
        property.features_ar.join(" "),
      ]
        .filter(Boolean)
        .join(" "),
    );
    // Every whitespace-separated term must appear somewhere.
    if (!needle.split(/\s+/).every((term) => haystack.includes(term))) return false;
  }

  return true;
}

export function sortProperties(
  properties: Property[],
  sort: PropertyQuery["sort"] = "newest",
): Property[] {
  const sorted = [...properties];
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "roi_desc":
      return sorted.sort((a, b) => (b.roi ?? -1) - (a.roi ?? -1));
    case "area_desc":
      return sorted.sort((a, b) => b.area - a.area);
    case "newest":
    default:
      return sorted.sort(
        (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
      );
  }
}

/** Distinct values used to populate the search filters. */
export function buildFacets(properties: Property[]) {
  const countries = [...new Set(properties.map((p) => p.country))].sort();
  const cities = [...new Set(properties.map((p) => p.city))].sort();
  const prices = properties.map((p) => p.price);
  return {
    countries,
    cities,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    counts: {
      villa: properties.filter((p) => p.property_type === "villa").length,
      hotel: properties.filter((p) => p.property_type === "hotel").length,
      land: properties.filter((p) => p.property_type === "land").length,
    },
  };
}

export type Facets = ReturnType<typeof buildFacets>;
