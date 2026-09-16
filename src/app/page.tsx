import type { Metadata } from "next";

import { CategoryExplorer } from "@/components/home/CategoryExplorer";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { Hero } from "@/components/home/Hero";
import { InvestmentSection } from "@/components/home/InvestmentSection";
import { PremiumCta } from "@/components/home/PremiumCta";
import { QuickSearch } from "@/components/home/QuickSearch";
import { Stats } from "@/components/home/Stats";
import { WhyDengler } from "@/components/home/WhyDengler";
import { store } from "@/lib/store";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

/**
 * Revalidated rather than fully static: the catalogue is editable from the
 * dashboard, and an hour is a reasonable staleness budget for a home page.
 */
export const revalidate = 3600;

export default async function HomePage() {
  const [featured, investments, facets, stats] = await Promise.all([
    store.listProperties({ featuredOnly: true, limit: 6, sort: "newest" }),
    store.listProperties({ sort: "roi_desc", limit: 4 }),
    store.getFacets(),
    store.listStats(),
  ]);

  return (
    <>
      <Hero />
      <QuickSearch countries={facets.countries} />
      <Stats stats={stats} />
      <FeaturedProperties properties={featured} />
      <CategoryExplorer counts={facets.counts} />
      <InvestmentSection properties={investments} />
      <WhyDengler />
      <PremiumCta />
    </>
  );
}
