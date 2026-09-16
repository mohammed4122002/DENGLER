import "server-only";

import type {
  Inquiry,
  InquiryStatus,
  Property,
  PropertyImage,
  PropertyQuery,
  SiteStat,
} from "@/lib/types";
import { createAdminSupabase, createServerSupabase } from "@/lib/supabase/server";
import { buildFacets } from "./filters";
import type { DataStore, PropertyInput } from "./types";

/** Columns on `properties`, minus the hydrated relations. */
const PROPERTY_COLUMNS =
  "id, title, slug, description, property_type, status, price, currency, location, country, city, latitude, longitude, area, bedrooms, bathrooms, year_built, investment_type, roi, annual_revenue, occupancy_rate, appreciation, featured, published, cover_image, tagline, created_at, updated_at";

const SELECT_WITH_RELATIONS = `${PROPERTY_COLUMNS}, property_images(id, property_id, image_url, alt, sort_order, created_at), property_features(feature)`;

interface PropertyRow {
  property_images?: PropertyImage[] | null;
  property_features?: { feature: string }[] | null;
  [key: string]: unknown;
}

function hydrate(row: PropertyRow): Property {
  const { property_images, property_features, ...rest } = row;
  return {
    ...(rest as Omit<Property, "images" | "features">),
    images: [...(property_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
    features: (property_features ?? []).map((f) => f.feature),
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
      await client
        .from("property_features")
        .insert(features.map((feature) => ({ property_id: propertyId, feature })));
    }
  }
}

export const supabaseStore: DataStore = {
  mode: "supabase",

  async listProperties(query = {}) {
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
      // `search_text` is a generated column on `properties` (see the migration)
      // holding title + tagline + location + description, lower-cased.
      const term = `%${query.q.trim().toLowerCase()}%`;
      builder = builder.ilike("search_text", term);
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
    return (data ?? []).map(hydrate);
  },

  async getPropertyBySlug(slug) {
    const client = await createServerSupabase();
    const { data, error } = await client
      .from("properties")
      .select(SELECT_WITH_RELATIONS)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`Failed to load property: ${error.message}`);
    return data ? hydrate(data) : null;
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

  async getFacets() {
    const client = await createServerSupabase();
    const { data, error } = await client
      .from("properties")
      .select("country, city, price, property_type")
      .eq("published", true);
    if (error) throw new Error(`Failed to load facets: ${error.message}`);
    return buildFacets((data ?? []) as unknown as Property[]);
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
    const { gallery, features, ...row } = input;

    const { data, error } = await client
      .from("properties")
      .insert(row)
      .select(PROPERTY_COLUMNS)
      .single();
    if (error) throw new Error(`Failed to create property: ${error.message}`);

    await replaceRelations(client, data.id as string, gallery, features);
    const created = await supabaseStore.getPropertyById(data.id as string);
    if (!created) throw new Error("Property vanished immediately after insert.");
    return created;
  },

  async updateProperty(id, input) {
    const client = await writeClient();
    const { gallery, features, ...row } = input;

    if (Object.keys(row).length) {
      const { error } = await client
        .from("properties")
        .update({ ...row, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(`Failed to update property: ${error.message}`);
    }

    await replaceRelations(client, id, gallery, features);
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
