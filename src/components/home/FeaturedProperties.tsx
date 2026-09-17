import { PropertyGrid } from "@/components/property/PropertyGrid";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";
import type { LocalizedProperty } from "@/lib/types";

export function FeaturedProperties({
  properties,
  locale,
  t,
}: {
  properties: LocalizedProperty[];
  locale: Locale;
  t: Dictionary;
}) {
  return (
    <section className="bg-paper">
      <div className="shell py-16 md:py-24">
        <SectionHeading
          eyebrow={t.featured.eyebrow}
          title={
            <>
              {t.featured.titleLineOne}
              <br />
              <span className="text-gold-deep">{t.featured.titleLineTwo}</span>
            </>
          }
          lead={t.featured.lead}
          link={{
            href: localePath(locale, "/properties"),
            label: t.common.viewAllProperties,
          }}
        />

        <Reveal className="mt-12" y={16}>
          <PropertyGrid
            properties={properties}
            locale={locale}
            t={t}
            columns={4}
            priorityCount={4}
          />
        </Reveal>
      </div>
    </section>
  );
}
