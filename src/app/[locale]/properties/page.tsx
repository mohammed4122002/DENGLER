import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { SearchPanel } from "@/components/property/SearchPanel";
import { photo } from "@/lib/data/images";
import { describeQuery, parsePropertyQuery, type SearchParams } from "@/lib/query";
import { store } from "@/lib/store";
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
    title: t.nav.properties,
    description: t.propertiesPage.lead,
    ...buildAlternates(raw, "/properties"),
  };
}

export default async function PropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ locale: raw }, search] = await Promise.all([params, searchParams]);
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const t = getDictionary(locale);
  const query = parsePropertyQuery(search);

  const [properties, facets] = await Promise.all([
    store.listProperties(query, locale),
    store.getFacets(locale),
  ]);

  const summary = describeQuery(query, locale);

  return (
    <>
      <PageHeader
        eyebrow={t.propertiesPage.eyebrow}
        title={
          <>
            {t.propertiesPage.titleLineOne}
            <br />
            <span className="text-gold-soft">
              {t.propertiesPage.titleLineTwo}
            </span>
          </>
        }
        lead={t.propertiesPage.lead}
        image={photo("heroCoastal", 2000)}
      />

      <Suspense fallback={<SearchSkeleton />}>
        <SearchPanel facets={facets} resultCount={properties.length} t={t} />
      </Suspense>

      <section className="shell py-16 md:py-24">
        {summary && (
          <p className="mb-10 text-sm text-muted">
            {t.search.showingResultsFor}{" "}
            <span className="text-ink">{summary}</span>
          </p>
        )}
        <PropertyGrid
          properties={properties}
          locale={locale}
          t={t}
          priorityCount={3}
        />
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
