import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";
import { store } from "@/lib/store";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await store.listPublishedSlugs();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { url: SITE.url, changeFrequency: "weekly", priority: 1 },
      { url: `${SITE.url}/properties`, changeFrequency: "daily", priority: 0.9 },
      { url: `${SITE.url}/villas`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${SITE.url}/hotels`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${SITE.url}/land`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${SITE.url}/investments`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${SITE.url}/about`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${SITE.url}/contact`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${SITE.url}/legal/privacy`, changeFrequency: "yearly", priority: 0.2 },
      { url: `${SITE.url}/legal/terms`, changeFrequency: "yearly", priority: 0.2 },
      { url: `${SITE.url}/legal/disclosures`, changeFrequency: "yearly", priority: 0.2 },
    ] satisfies MetadataRoute.Sitemap
  ).map((entry) => ({ ...entry, lastModified: now }));

  return [
    ...staticRoutes,
    ...slugs.map((slug) => ({
      url: `${SITE.url}/properties/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
