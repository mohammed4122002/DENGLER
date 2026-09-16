import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";
import { store } from "@/lib/store";
import { LOCALES, LOCALE_META, localePath } from "@/lib/i18n/config";

export const revalidate = 3600;

/** Static routes, with how often each is worth recrawling. */
const ROUTES: { path: string; changeFrequency: Frequency; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/properties", changeFrequency: "daily", priority: 0.9 },
  { path: "/villas", changeFrequency: "weekly", priority: 0.8 },
  { path: "/hotels", changeFrequency: "weekly", priority: 0.8 },
  { path: "/land", changeFrequency: "weekly", priority: 0.8 },
  { path: "/investments", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/legal/disclosures", changeFrequency: "yearly", priority: 0.2 },
];

type Frequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

/**
 * Each URL carries the full set of `alternates.languages`, so a crawler sees
 * `/en/properties` and `/ar/properties` as translations of one page rather
 * than as duplicate content. Both entries list each other, which is what the
 * hreflang spec requires — a one-way declaration is ignored.
 */
function alternates(path: string) {
  return {
    languages: Object.fromEntries(
      LOCALES.map((locale) => [
        LOCALE_META[locale].hreflang,
        `${SITE.url}${localePath(locale, path)}`,
      ]),
    ),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await store.listPublishedSlugs();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      entries.push({
        url: `${SITE.url}${localePath(locale, route.path)}`,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: alternates(route.path),
      });
    }

    for (const slug of slugs) {
      const path = `/properties/${slug}`;
      entries.push({
        url: `${SITE.url}${localePath(locale, path)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: alternates(path),
      });
    }
  }

  return entries;
}
