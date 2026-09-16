"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";

import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  issueSessionValue,
  passwordMatches,
  requireAdmin,
} from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { slugify } from "@/lib/format";
import { store, type PropertyInput } from "@/lib/store";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  INQUIRY_STATUSES,
  INVESTMENT_TYPES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
} from "@/lib/types";
import {
  DEFAULT_LOCALE,
  getDictionary,
  isLocale,
  localePath,
  LOCALES,
} from "@/lib/i18n";

/** The dashboard's language comes from the form that submitted the action. */
function dictFor(formData: FormData) {
  const raw = String(formData.get("locale") ?? "");
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return { locale, t: getDictionary(locale) };
}

export interface ActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

/* ------------------------------------------------------------------ *
 * Authentication
 * ------------------------------------------------------------------ */

export async function signIn(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { locale, t } = dictFor(formData);
  const password = String(formData.get("password") ?? "");
  const email = String(formData.get("email") ?? "");

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Deliberately vague: never confirm whether the address exists.
      return { status: "error", message: t.admin.credentialsRejected };
    }
  } else {
    if (!passwordMatches(password)) {
      return { status: "error", message: t.admin.credentialsRejected };
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE, issueSessionValue(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });
  }

  redirect(localePath(locale, "/admin"));
}

export async function signOut(locale: string = DEFAULT_LOCALE): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  }

  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect(localePath(isLocale(locale) ? locale : DEFAULT_LOCALE, "/admin/login"));
}

/* ------------------------------------------------------------------ *
 * Properties
 * ------------------------------------------------------------------ */

const numeric = (max: number) =>
  z.coerce.number().min(0).max(max).nullable().catch(null);

/** Optional Arabic text: an empty field is stored as null, not "". */
const arabicText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .nullable()
    .catch(null);

const propertySchema = z.object({
  title: z.string().trim().min(2).max(160),
  title_ar: arabicText(160),
  slug: z.string().trim().max(120).optional(),
  tagline: z.string().trim().max(240).default(""),
  tagline_ar: arabicText(240),
  description: z.string().trim().max(8000).default(""),
  description_ar: arabicText(8000),
  property_type: z.enum(PROPERTY_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  price: z.coerce.number().min(0).max(1e12),
  currency: z.string().trim().length(3).toUpperCase(),
  location: z.string().trim().min(2).max(200),
  location_ar: arabicText(200),
  country: z.string().trim().min(2).max(100),
  country_ar: arabicText(100),
  city: z.string().trim().min(1).max(100),
  city_ar: arabicText(100),
  latitude: z.coerce.number().min(-90).max(90).nullable().catch(null),
  longitude: z.coerce.number().min(-180).max(180).nullable().catch(null),
  area: z.coerce.number().min(0).max(1e10),
  bedrooms: numeric(10_000),
  bathrooms: numeric(10_000),
  year_built: z.coerce.number().min(1500).max(2200).nullable().catch(null),
  investment_type: z.enum(INVESTMENT_TYPES),
  roi: numeric(1000),
  annual_revenue: numeric(1e12),
  occupancy_rate: numeric(100),
  appreciation: numeric(1000),
  featured: z.boolean(),
  published: z.boolean(),
  cover_image: z.string().trim().max(1000).default(""),
});

/** Textarea-per-line input → a clean array, blank lines dropped. */
function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/[\r\n]+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function readPropertyForm(formData: FormData) {
  const gallery = lines(formData.get("gallery"));
  const features = lines(formData.get("features"));
  const featuresAr = lines(formData.get("features_ar"));

  const parsed = propertySchema.safeParse({
    title: formData.get("title") ?? "",
    title_ar: formData.get("title_ar") ?? "",
    slug: formData.get("slug") ?? "",
    tagline: formData.get("tagline") ?? "",
    tagline_ar: formData.get("tagline_ar") ?? "",
    description: formData.get("description") ?? "",
    description_ar: formData.get("description_ar") ?? "",
    property_type: formData.get("property_type"),
    status: formData.get("status"),
    price: formData.get("price") ?? 0,
    currency: formData.get("currency") ?? "USD",
    location: formData.get("location") ?? "",
    location_ar: formData.get("location_ar") ?? "",
    country: formData.get("country") ?? "",
    country_ar: formData.get("country_ar") ?? "",
    city: formData.get("city") ?? "",
    city_ar: formData.get("city_ar") ?? "",
    latitude: formData.get("latitude") || null,
    longitude: formData.get("longitude") || null,
    area: formData.get("area") ?? 0,
    bedrooms: formData.get("bedrooms") || null,
    bathrooms: formData.get("bathrooms") || null,
    year_built: formData.get("year_built") || null,
    investment_type: formData.get("investment_type"),
    roi: formData.get("roi") || null,
    annual_revenue: formData.get("annual_revenue") || null,
    occupancy_rate: formData.get("occupancy_rate") || null,
    appreciation: formData.get("appreciation") || null,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    cover_image: formData.get("cover_image") ?? "",
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      error: `${issue.path.join(".") || "form"}: ${issue.message}`,
    } as const;
  }

  const { slug, ...rest } = parsed.data;

  const input: PropertyInput = {
    ...rest,
    slug: slug ? slugify(slug) : slugify(rest.title),
    // Fall back to the first gallery frame so a listing is never coverless.
    cover_image: rest.cover_image || gallery[0] || "",
    features,
    // Only a complete Arabic list is stored; a partial one would render a
    // half-English feature list on the Arabic site.
    features_ar: featuresAr.length === features.length ? featuresAr : [],
    gallery,
  };

  return { input } as const;
}

export async function saveProperty(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { t } = dictFor(formData);

  try {
    await requireAdmin();
  } catch {
    return { status: "error", message: t.admin.notAuthorised };
  }

  const result = readPropertyForm(formData);
  if ("error" in result) {
    return { status: "error", message: result.error };
  }

  const id = String(formData.get("id") ?? "");

  try {
    if (id) {
      await store.updateProperty(id, result.input);
    } else {
      await store.createProperty(result.input);
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : t.admin.couldNotSave,
    };
  }

  revalidateEverything(result.input.slug);

  return {
    status: "success",
    message: id ? t.admin.propertyUpdated : t.admin.propertyCreated,
  };
}

export async function togglePublished(id: string, published: boolean) {
  await requireAdmin();
  await store.updateProperty(id, { published });
  revalidateEverything();
}

export async function toggleFeatured(id: string, featured: boolean) {
  await requireAdmin();
  await store.updateProperty(id, { featured });
  revalidateEverything();
}

export async function deleteProperty(id: string, locale: string = DEFAULT_LOCALE) {
  await requireAdmin();
  await store.deleteProperty(id);
  revalidateEverything();
  redirect(
    localePath(isLocale(locale) ? locale : DEFAULT_LOCALE, "/admin/properties"),
  );
}

/**
 * Reorders a property's gallery by moving one image up or down. The first
 * entry is the cover, so reordering is also how the cover gets chosen.
 */
export async function moveImage(
  propertyId: string,
  index: number,
  direction: -1 | 1,
) {
  await requireAdmin();

  const property = await store.getPropertyById(propertyId);
  if (!property) return;

  const gallery = property.images.map((image) => image.image_url);
  const target = index + direction;
  if (target < 0 || target >= gallery.length) return;

  [gallery[index], gallery[target]] = [gallery[target], gallery[index]];

  await store.updateProperty(propertyId, { gallery, cover_image: gallery[0] });
  revalidateEverything(property.slug);
}

export async function removeImage(propertyId: string, index: number) {
  await requireAdmin();

  const property = await store.getPropertyById(propertyId);
  if (!property) return;

  const gallery = property.images
    .map((image) => image.image_url)
    .filter((_, i) => i !== index);

  await store.updateProperty(propertyId, {
    gallery,
    cover_image: gallery[0] ?? "",
  });
  revalidateEverything(property.slug);
}

export async function addImage(propertyId: string, formData: FormData) {
  await requireAdmin();

  const url = String(formData.get("image_url") ?? "").trim();
  if (!url) return;

  const property = await store.getPropertyById(propertyId);
  if (!property) return;

  const gallery = [...property.images.map((image) => image.image_url), url];
  await store.updateProperty(propertyId, {
    gallery,
    cover_image: property.cover_image || gallery[0],
  });
  revalidateEverything(property.slug);
}

/* ------------------------------------------------------------------ *
 * Leads
 * ------------------------------------------------------------------ */

export async function setInquiryStatus(id: string, status: string) {
  await requireAdmin();

  const parsed = z.enum(INQUIRY_STATUSES).safeParse(status);
  if (!parsed.success) return;

  await store.updateInquiryStatus(id, parsed.data);
  revalidateLeads();
}

export async function deleteInquiry(id: string) {
  await requireAdmin();
  await store.deleteInquiry(id);
  revalidateLeads();
}

function revalidateLeads() {
  for (const locale of LOCALES) {
    revalidatePath(localePath(locale, "/admin/leads"));
    revalidatePath(localePath(locale, "/admin"));
  }
}

/* ------------------------------------------------------------------ *
 * Site stats
 * ------------------------------------------------------------------ */

export async function saveStats(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { t } = dictFor(formData);

  try {
    await requireAdmin();
  } catch {
    return { status: "error", message: t.admin.notAuthorised };
  }

  const existing = await store.listStats();

  const updated = existing.map((stat, index) => ({
    ...stat,
    label: String(formData.get(`label_${stat.id}`) ?? stat.label)
      .trim()
      .slice(0, 80),
    value: String(formData.get(`value_${stat.id}`) ?? stat.value)
      .trim()
      .slice(0, 40),
    sort_order: index,
  }));

  try {
    await store.updateStats(updated);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : t.admin.couldNotSave,
    };
  }

  revalidateEverything();
  return { status: "success", message: t.admin.figuresUpdated };
}

/* ------------------------------------------------------------------ */

/**
 * Both language trees are separate routes, so an edit has to invalidate each
 * of them — revalidating only `/properties` would leave `/ar/properties` stale.
 */
function revalidateEverything(slug?: string) {
  const paths = [
    "/",
    "/properties",
    "/villas",
    "/hotels",
    "/land",
    "/investments",
    "/admin/properties",
    ...(slug ? [`/properties/${slug}`] : []),
  ];

  for (const locale of LOCALES) {
    for (const path of paths) revalidatePath(localePath(locale, path));
  }
  revalidatePath("/sitemap.xml");
}
