import "server-only";

import type {
  Inquiry,
  InquiryStatus,
  Property,
  PropertyImage,
  PropertyQuery,
  SiteStat,
} from "@/lib/types";
import { localizeProperty } from "@/lib/types";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { createAdminSupabase, createServerSupabase } from "@/lib/supabase/server";
import { buildFacets, foldSearchText } from "./filters";
import type { DataStore, PropertyInput } from "./types";

/** Columns on `properties`, minus the hydrated relations. */
const PROPERTY_COLUMNS =
  "id, title, title_ar, slug, description, description_ar, property_type, status, price, currency, location, location_ar, country, country_ar, city, city_ar, latitude, longitude, area, bedrooms, bathrooms, year_built, investment_type, roi, annual_revenue, occupancy_rate, appreciation, featured, published, cover_image, tagline, tagline_ar, created_at, updated_at";

const SELECT_WITH_RELATIONS = `${PROPERTY_COLUMNS}, property_images(id, property_id, image_url, alt, sort_order, created_at), property_features(feature, feature_ar)`;

interface PropertyRow {
  property_images?: PropertyImage[] | null;
  property_features?: { feature: string; feature_ar: string | null }[] | null;
  [key: string]: unknown;
}

function hydrate(row: PropertyRow): Property {
  const { property_images, property_features, ...rest } = row;
  const features = property_features ?? [];

  return {
    ...(rest as Omit<Property, "images" | "features" | "features_ar">),
    images: [...(property_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
    features: features.map((f) => f.feature),
    // Only a fully translated list counts — see `localizeProperty`.
    features_ar: features.every((f) => f.feature_ar)
      ? features.map((f) => f.feature_ar as string)
      : [],
  };
}

/**
 * Writes use the service-role client when one is configured, so the admin
 * dashboard works regardless of how the RLS policies are tuned. When it isn't,
 * we fall back to the request-scoped client and RLS decides.
 */
async function writeClient() {
  try {
    return createAdminSupabase();
  } catch {
    return await createServerSupabase();
  }
}

async function replaceRelations(
  client: Awaited<ReturnType<typeof writeClient>>,
  propertyId: string,
  gallery?: string[],
  features?: string[],
  featuresAr?: string[],
) {
  if (gallery) {
    await client.from("property_images").delete().eq("property_id", propertyId);
    if (gallery.length) {
      await client.from("property_images").insert(
        gallery.map((image_url, sort_order) => ({
          property_id: propertyId,
          image_url,
          alt: `Property image ${sort_order + 1}`,
          sort_order,
        })),
      );
    }
  }

  if (features) {
    await client.from("property_features").delete().eq("property_id", propertyId);
    if (features.length) {
      await client.from("property_features").insert(
        features.map((feature, index) => ({
          property_id: propertyId,
          feature,
          // Positional pairing: the admin form takes two line-per-entry
          // textareas, so line N of the Arabic list translates line N of the
          // English one. A shorter Arabic list simply leaves the rest null,
          // and `hydrate` then treats the whole list as untranslated.
          feature_ar: featuresAr?.[index] ?? null,
        })),
      );
    }
  }
}

export const supabaseStore: DataStore = {
  mode: "supabase",

  async listProperties(query = {}, locale: Locale = DEFAULT_LOCALE) {
    const client = await createServerSupabase();
    let builder = client.from("properties").select(SELECT_WITH_RELATIONS);

    // Admin views pass `status: "all"`, which is also the signal to include
    // unpublished rows. Everything else sees published inventory only.
    if (query.status !== "all") builder = builder.eq("published", true);

    if (query.type && query.type !== "all") {
      builder = builder.eq("property_type", query.type);
    }
    if (query.country) builder = builder.eq("country", query.country);
    if (query.city) builder = builder.eq("city", query.city);
    if (typeof query.minPrice === "number") builder = builder.gte("price", query.minPrice);
    if (typeof query.maxPrice === "number") builder = builder.lte("price", query.maxPrice);
    if (typeof query.minArea === "number") builder = builder.gte("area", query.minArea);
    if (typeof query.bedrooms === "number") builder = builder.gte("bedrooms", query.bedrooms);
    if (query.investmentType && query.investmentType !== "all") {
      builder = builder.eq("investment_type", query.investmentType);
    }
    if (typeof query.minRoi === "number") builder = builder.gte("roi", query.minRoi);
    if (query.status && query.status !== "all") builder = builder.eq("status", query.status);
    if (query.featuredOnly) builder = builder.eq("featured", true);

    if (query.q?.trim()) {
      // `search_text` is a generated column holding both languages, folded by
      // `public.fold_arabic` (see 0002_bilingual.sql). The query term has to go
      // through the identical folding here or "الامارات" would miss
      // "الإمارات" — `foldSearchText` is the TypeScript half of that pair.
      builder = builder.ilike("search_text", `%${foldSearchText(query.q.trim())}%`);
    }

    switch (query.sort) {
      case "price_asc":
        builder = builder.order("price", { ascending: true });
        break;
      case "price_desc":
        builder = builder.order("price", { ascending: false });
        break;
      case "roi_desc":
        builder = builder.order("roi", { ascending: false, nullsFirst: false });
        break;
      case "area_desc":
        builder = builder.order("area", { ascending: false });
        break;
      default:
        builder = builder.order("created_at", { ascending: false });
    }

    if (query.limit) builder = builder.limit(query.limit);

    const { data, error } = await builder;
    if (error) throw new Error(`Failed to list properties: ${error.message}`);
    return (data ?? []).map((row) => localizeProperty(hydrate(row), locale));
  },

  async getPropertyBySlug(slug, locale: Locale = DEFAULT_LOCALE) {
    const client = await createServerSupabase();
    const { data, error } = await client
      .from("properties")
      .select(SELECT_WITH_RELATIONS)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`Failed to load property: ${error.message}`);
    return data ? localizeProperty(hydrate(data), locale) : null;
  },

  async getPropertyById(id) {
    const client = await writeClient();
    const { data, error } = await client
      .from("properties")
      .select(SELECT_WITH_RELATIONS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Failed to load property: ${error.message}`);
    return data ? hydrate(data) : null;
  },

  async getFacets(locale: Locale = DEFAULT_LOCALE) {
    const client = await createServerSupabase();
    const { data, error } = await client
      .from("properties")
      .select("country, country_ar, city, city_ar, price, property_type")
      .eq("published", true);
    if (error) throw new Error(`Failed to load facets: ${error.message}`);

    // Only the fields `buildFacets` reads are selected, so the rows are
    // shaped for it rather than being full properties.
    const rows = (data ?? []).map((row) => ({
      ...row,
      country: locale === "ar" ? (row.country_ar ?? row.country) : row.country,
      city: locale === "ar" ? (row.city_ar ?? row.city) : row.city,
    }));
    return buildFacets(rows as unknown as Property[]);
  },

  async listPublishedSlugs() {
    const client = await createServerSupabase();
    const { data, error } = await client
      .from("properties")
      .select("slug")
      .eq("published", true);
    if (error) throw new Error(`Failed to load slugs: ${error.message}`);
    return (data ?? []).map((row) => row.slug as string);
  },

  async createProperty(input: PropertyInput) {
    const client = await writeClient();
    const { gallery, features, features_ar, ...row } = input;

    const { data, error } = await client
      .from("properties")
      .insert(row)
      .select(PROPERTY_COLUMNS)
      .single();
    if (error) throw new Error(`Failed to create property: ${error.message}`);

    await replaceRelations(client, data.id as string, gallery, features, features_ar);
    const created = await supabaseStore.getPropertyById(data.id as string);
    if (!created) throw new Error("Property vanished immediately after insert.");
    return created;
  },

  async updateProperty(id, input) {
    const client = await writeClient();
    const { gallery, features, features_ar, ...row } = input;

    if (Object.keys(row).length) {
      const { error } = await client
        .from("properties")
        .update({ ...row, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(`Failed to update property: ${error.message}`);
    }

    await replaceRelations(client, id, gallery, features, features_ar);
    const updated = await supabaseStore.getPropertyById(id);
    if (!updated) throw new Error(`Property ${id} not found after update.`);
    return updated;
  },

  async deleteProperty(id) {
    const client = await writeClient();
    // property_images / property_features cascade via FK.
    const { error } = await client.from("properties").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete property: ${error.message}`);
  },

  async listInquiries() {
    const client = await writeClient();
    const { data, error } = await client
      .from("inquiries")
      .select("id, property_id, name, email, phone, message, status, created_at, properties(title)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list inquiries: ${error.message}`);

    return (data ?? []).map((row) => {
      const { properties, ...rest } = row as typeof row & {
        properties?: { title: string } | null;
      };
      return {
        ...(rest as Omit<Inquiry, "property_title">),
        property_title: properties?.title ?? null,
      } as Inquiry;
    });
  },

  async createInquiry(input) {
    const client = await createServerSupabase();
    const { data, error } = await client
      .from("inquiries")
      .insert({ ...input, status: "new" })
      .select("id, property_id, name, email, phone, message, status, created_at")
      .single();
    if (error) throw new Error(`Failed to submit inquiry: ${error.message}`);
    return { ...(data as Omit<Inquiry, "property_title">), property_title: null };
  },

  async updateInquiryStatus(id, status: InquiryStatus) {
    const client = await writeClient();
    const { error } = await client.from("inquiries").update({ status }).eq("id", id);
    if (error) throw new Error(`Failed to update inquiry: ${error.message}`);
  },

  async deleteInquiry(id) {
    const client = await writeClient();
    const { error } = await client.from("inquiries").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete inquiry: ${error.message}`);
  },

  async listStats() {
    const client = await createServerSupabase();
    const { data, error } = await client
      .from("site_stats")
      .select("id, label, value, sort_order")
      .order("sort_order");
    if (error) throw new Error(`Failed to load stats: ${error.message}`);
    return (data ?? []) as SiteStat[];
  },

  async updateStats(stats) {
    const client = await writeClient();
    const { error } = await client.from("site_stats").upsert(stats);
    if (error) throw new Error(`Failed to update stats: ${error.message}`);
  },
};

export type { PropertyQuery };
