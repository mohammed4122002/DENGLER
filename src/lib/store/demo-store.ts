import "server-only";

import { SEED_INQUIRIES, SEED_PROPERTIES, SEED_STATS } from "@/lib/data/seed";
import type {
  Inquiry,
  InquiryStatus,
  Property,
  PropertyQuery,
  SiteStat,
} from "@/lib/types";
import { buildFacets, matchesQuery, sortProperties } from "./filters";
import type { DataStore, PropertyInput } from "./types";

/**
 * In-memory store used when Supabase is not configured.
 *
 * Writes are real — the admin dashboard genuinely creates, edits, reorders and
 * deletes — but they live in the server process only, so they are lost on
 * restart and are not shared between serverless instances. The UI states this
 * wherever it matters. Configure Supabase to persist.
 *
 * The state is hung off `globalThis` so that Next's dev-mode module reloading
 * doesn't silently reset the catalogue on every edit.
 */
interface DemoState {
  properties: Property[];
  inquiries: Inquiry[];
  stats: SiteStat[];
  sequence: number;
}

const STATE_KEY = Symbol.for("dengler.demo-state");

function getState(): DemoState {
  const globalRef = globalThis as typeof globalThis & {
    [STATE_KEY]?: DemoState;
  };
  if (!globalRef[STATE_KEY]) {
    globalRef[STATE_KEY] = {
      // Deep-copied so mutations never write back into the seed module.
      properties: structuredClone(SEED_PROPERTIES),
      inquiries: structuredClone(SEED_INQUIRIES),
      stats: structuredClone(SEED_STATS),
      sequence: SEED_PROPERTIES.length + SEED_INQUIRIES.length + 1,
    };
  }
  return globalRef[STATE_KEY];
}

function nextId(prefix: string): string {
  const state = getState();
  state.sequence += 1;
  return `${prefix}_${state.sequence}_${Date.now().toString(36)}`;
}

function toImages(propertyId: string, gallery: string[], createdAt: string) {
  return gallery.map((url, index) => ({
    id: `${propertyId}_img_${index}`,
    property_id: propertyId,
    image_url: url,
    alt: `Property image ${index + 1}`,
    sort_order: index,
    created_at: createdAt,
  }));
}

export const demoStore: DataStore = {
  mode: "demo",

  async listProperties(query = {}) {
    const { properties } = getState();
    const visible = properties.filter(
      (p) => p.published || query.status === "all",
    );
    const filtered = visible.filter((p) => matchesQuery(p, query));
    const sorted = sortProperties(filtered, query.sort);
    return query.limit ? sorted.slice(0, query.limit) : sorted;
  },

  async getPropertyBySlug(slug) {
    return getState().properties.find((p) => p.slug === slug) ?? null;
  },

  async getPropertyById(id) {
    return getState().properties.find((p) => p.id === id) ?? null;
  },

  async getFacets() {
    return buildFacets(getState().properties.filter((p) => p.published));
  },

  async listPublishedSlugs() {
    return getState()
      .properties.filter((p) => p.published)
      .map((p) => p.slug);
  },

  async createProperty(input: PropertyInput) {
    const state = getState();
    const now = new Date().toISOString();
    const id = nextId("prop");
    const { gallery, ...rest } = input;

    const property: Property = {
      ...rest,
      id,
      created_at: now,
      updated_at: now,
      images: toImages(id, gallery, now),
    };

    state.properties.unshift(property);
    return property;
  },

  async updateProperty(id, input) {
    const state = getState();
    const index = state.properties.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Property ${id} not found`);

    const now = new Date().toISOString();
    const { gallery, ...rest } = input;
    const current = state.properties[index];

    const updated: Property = {
      ...current,
      ...rest,
      id: current.id,
      created_at: current.created_at,
      updated_at: now,
      images: gallery ? toImages(id, gallery, now) : current.images,
    };

    state.properties[index] = updated;
    return updated;
  },

  async deleteProperty(id) {
    const state = getState();
    state.properties = state.properties.filter((p) => p.id !== id);
  },

  async listInquiries() {
    return [...getState().inquiries].sort(
      (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
    );
  },

  async createInquiry(input) {
    const state = getState();
    const property = input.property_id
      ? state.properties.find((p) => p.id === input.property_id)
      : undefined;

    const inquiry: Inquiry = {
      ...input,
      id: nextId("inq"),
      property_title: property?.title ?? null,
      status: "new",
      created_at: new Date().toISOString(),
    };

    state.inquiries.unshift(inquiry);
    return inquiry;
  },

  async updateInquiryStatus(id, status: InquiryStatus) {
    const inquiry = getState().inquiries.find((i) => i.id === id);
    if (inquiry) inquiry.status = status;
  },

  async deleteInquiry(id) {
    const state = getState();
    state.inquiries = state.inquiries.filter((i) => i.id !== id);
  },

  async listStats() {
    return [...getState().stats].sort((a, b) => a.sort_order - b.sort_order);
  },

  async updateStats(stats) {
    getState().stats = structuredClone(stats);
  },
};

export type { PropertyQuery };
