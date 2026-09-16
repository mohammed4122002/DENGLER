import { PageHeader } from "@/components/site/PageHeader";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { SearchPanel } from "@/components/property/SearchPanel";
import { Reveal } from "@/components/site/Reveal";
import { parsePropertyQuery, type SearchParams } from "@/lib/query";
import { store } from "@/lib/store";
import type { PropertyType } from "@/lib/types";

/**
 * /villas, /hotels and /land all render through here. Each gets its own
 * header image, copy and accent treatment via `CATEGORY_CONFIG`, so the three
 * pages read differently while sharing one search and one grid.
 */
export async function CategoryPage({
  type,
  eyebrow,
  title,
  lead,
  image,
  notes,
  searchParams,
}: {
  type: PropertyType;
  eyebrow: string;
  title: React.ReactNode;
  lead: string;
  image: string;
  notes: { heading: string; body: string }[];
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = parsePropertyQuery(params, { type });

  const [properties, facets] = await Promise.all([
    store.listProperties(query),
    store.getFacets(),
  ]);

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} lead={lead} image={image} />

      <SearchPanel facets={facets} lockedType={type} resultCount={properties.length} />

      {/* Category-specific editorial band — the main thing that makes the
          three pages feel distinct rather than filtered copies. */}
      <section className="border-b border-hairline bg-paper">
        <div className="shell grid gap-10 py-14 sm:grid-cols-3 md:py-16">
          {notes.map((note, index) => (
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
        <PropertyGrid properties={properties} priorityCount={3} />
      </section>
    </>
  );
}
