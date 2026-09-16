import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { SearchPanel } from "@/components/property/SearchPanel";
import { photo } from "@/lib/data/images";
import { describeQuery, parsePropertyQuery, type SearchParams } from "@/lib/query";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: "Properties",
  description:
    "Search the full DENGLER portfolio — villas, hotels and land — by market, budget, area, strategy and projected return.",
  alternates: { canonical: "/properties" },
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = parsePropertyQuery(params);

  const [properties, facets] = await Promise.all([
    store.listProperties(query),
    store.getFacets(),
  ]);

  const summary = describeQuery(query);

  return (
    <>
      <PageHeader
        eyebrow="The portfolio"
        title={
          <>
            Every asset on the
            <br />
            <span className="italic text-gold-soft">DENGLER desk.</span>
          </>
        }
        lead="Villas, hospitality assets and development land across twenty-four markets. Filter by what actually decides the investment: budget, yield, strategy and consent."
        image={photo("heroCoastal", 2000)}
      />

      <Suspense fallback={<SearchSkeleton />}>
        <SearchPanel facets={facets} resultCount={properties.length} />
      </Suspense>

      <section className="shell py-16 md:py-24">
        {summary && (
          <p className="mb-10 text-sm text-muted">
            Showing results for <span className="text-ink">{summary}</span>
          </p>
        )}
        <PropertyGrid properties={properties} priorityCount={3} />
      </section>
    </>
  );
}

function SearchSkeleton() {
  return (
    <div className="border-y border-hairline bg-cream/40">
      <div className="shell h-[168px]" />
    </div>
  );
}
