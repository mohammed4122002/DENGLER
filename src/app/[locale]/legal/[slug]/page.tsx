import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { photo } from "@/lib/data/images";
import { SITE } from "@/lib/site";
import {
  fill,
  getDictionary,
  isLocale,
  LOCALES,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";
import { buildAlternates } from "@/lib/i18n/metadata";

/**
 * The three legal pages share one route. Slugs stay English in both languages
 * so a link to `/legal/privacy` resolves whichever site it was copied from.
 */
const SLUGS = ["privacy", "terms", "disclosures"] as const;
type LegalSlug = (typeof SLUGS)[number];

function isLegalSlug(value: string): value is LegalSlug {
  return (SLUGS as readonly string[]).includes(value);
}

function page(t: Dictionary, slug: LegalSlug) {
  return t.legal[slug];
}

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw) || !isLegalSlug(slug)) {
    return { robots: { index: false, follow: false } };
  }

  const content = page(getDictionary(raw), slug);
  return {
    title: content.title,
    description: content.lead,
    ...buildAlternates(raw, `/legal/${slug}`),
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw) || !isLegalSlug(slug)) notFound();

  const locale: Locale = raw;
  const t = getDictionary(locale);
  const content = page(t, slug);

  return (
    <>
      <PageHeader
        eyebrow={t.legal.eyebrow}
        title={content.title}
        lead={content.lead}
        image={photo("detailFacade", 1600)}
      />

      <section className="shell max-w-3xl py-20 md:py-28">
        {content.sections.map((section, index) => (
          <Reveal
            key={section.heading}
            delay={index * 0.06}
            className="border-t border-hairline py-9 first:border-t-0 first:pt-0"
          >
            <h2 className="font-display text-[1.75rem] leading-tight text-ink">
              {section.heading}
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-[1.85] text-graphite">
              {fill(section.body, { email: SITE.email })}
            </p>
          </Reveal>
        ))}
      </section>
    </>
  );
}
