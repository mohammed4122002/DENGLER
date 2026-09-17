import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { Hero } from "@/components/home/Hero";
import { PhotoTour } from "@/components/home/PhotoTour";
import { PremiumCta } from "@/components/home/PremiumCta";
import { WhyUs } from "@/components/home/WhyUs";
import { store } from "@/lib/store";
import { SITE } from "@/lib/site";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { buildAlternates } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = getDictionary(raw);

  return {
    title: `${SITE.name} — ${t.meta.tagline}`,
    description: t.meta.description,
    ...buildAlternates(raw, "/"),
  };
}

/**
 * Revalidated rather than fully static: the catalogue is editable from the
 * dashboard, and an hour is a reasonable staleness budget for a home page.
 */
export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const t = getDictionary(locale);

  const [featured, tourProperty, facets, stats] = await Promise.all([
    store.listProperties({ featuredOnly: true, limit: 4, sort: "newest" }, locale),
    store.getPropertyBySlug("palm-residence-dubai", locale),
    store.getFacets(locale),
    store.listStats(),
  ]);

  return (
    <>
      <Hero locale={locale} t={t} countries={facets.countries} />
      <FeaturedProperties properties={featured} locale={locale} t={t} />
      {/* Dropped if an editor deletes the listing this band walks through —
          better an absent section than one rendering an empty gallery. */}
      {tourProperty && (
        <PhotoTour property={tourProperty} locale={locale} t={t} />
      )}
      <WhyUs locale={locale} t={t} />
      <PremiumCta locale={locale} t={t} stats={stats} />
    </>
  );
}
