import type {
  Inquiry,
  InquiryStatus,
  LocalizedProperty,
  Property,
  PropertyQuery,
  SiteStat,
} from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Facets } from "./filters";

/** Fields an admin may set when creating or editing a property. */
export type PropertyInput = Omit<
  Property,
  "id" | "created_at" | "updated_at" | "images"
> & {
  /** Ordered gallery URLs. Index 0 is not implicitly the cover. */
  gallery: string[];
};

export interface DataStore {
  readonly mode: "supabase" | "demo";

  /*
   * Read methods take a locale and hand back records whose display fields are
   * already resolved, so no view component has to know which language it is
   * rendering. `getPropertyById` is the exception: the admin dashboard edits
   * both languages, so it returns the raw row.
   */
  listProperties(query?: PropertyQuery, locale?: Locale): Promise<LocalizedProperty[]>;
  getPropertyBySlug(slug: string, locale?: Locale): Promise<LocalizedProperty | null>;
  getPropertyById(id: string): Promise<Property | null>;
  getFacets(locale?: Locale): Promise<Facets>;
  /** All published slugs, for the sitemap and static params. */
  listPublishedSlugs(): Promise<string[]>;

  createProperty(input: PropertyInput): Promise<Property>;
  updateProperty(id: string, input: Partial<PropertyInput>): Promise<Property>;
  deleteProperty(id: string): Promise<void>;

  listInquiries(): Promise<Inquiry[]>;
  createInquiry(
    input: Omit<Inquiry, "id" | "created_at" | "status" | "property_title">,
  ): Promise<Inquiry>;
  updateInquiryStatus(id: string, status: InquiryStatus): Promise<void>;
  deleteInquiry(id: string): Promise<void>;

  listStats(): Promise<SiteStat[]>;
  updateStats(stats: SiteStat[]): Promise<void>;
}
