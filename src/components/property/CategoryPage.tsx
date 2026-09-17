import { PageHeader } from "@/components/site/PageHeader";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { SearchPanel } from "@/components/property/SearchPanel";
import { Reveal } from "@/components/site/Reveal";
import { parsePropertyQuery, type SearchParams } from "@/lib/query";
import { store } from "@/lib/store";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import type { PropertyType } from "@/lib/types";

/** Which dictionary section each category page reads its copy from. */
const COPY_KEY = {
  villa: "villasPage",
  hotel: "hotelsPage",
  land: "landPage",
} as const;

/**
 * /villas, /hotels and /land all render through here. Each takes its eyebrow,
 * headline, lead and three editorial notes from its own dictionary section, so
 * the three pages read differently — in both languages — while sharing one
 * search implementation and one grid.
 */
export async function CategoryPage({
  type,
  image,
  params,
  searchParams,
}: {
  type: PropertyType;
  image: string;
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ locale: rawLocale }, search] = await Promise.all([params, searchParams]);
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const t = getDictionary(locale);
  const copy = t[COPY_KEY[type]];

  const query = parsePropertyQuery(search, { type });

  const [properties, facets] = await Promise.all([
    store.listProperties(query, locale),
    store.getFacets(locale),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={
          <>
            {copy.titleLineOne}
            <br />
            <span className="text-gold-soft">{copy.titleLineTwo}</span>
          </>
        }
        lead={copy.lead}
        image={image}
      />

      <SearchPanel
        facets={facets}
        lockedType={type}
        resultCount={properties.length}
        t={t}
      />

      {/* Category-specific editorial band — the main thing that makes the
          three pages feel distinct rather than filtered copies. */}
      <section className="border-b border-hairline bg-paper">
        <div className="shell grid gap-10 py-14 sm:grid-cols-3 md:py-16">
          {copy.notes.map((note, index) => (
            <Reveal key={note.heading} delay={index * 0.08}>
              <p className="font-display text-xl text-gold-deep">{note.heading}</p>
              <p className="mt-3 text-sm leading-relaxed text-graphite/85">
                {note.body}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="shell py-16 md:py-24">
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
