import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/site/PageHeader";
import { PremiumCta } from "@/components/home/PremiumCta";
import { SmartImage } from "@/components/site/SmartImage";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { photo } from "@/lib/data/images";
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
    title: t.nav.about,
    description: t.aboutPage.lead,
    ...buildAlternates(raw, "/about"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const t = getDictionary(locale);

  return (
    <>
      <PageHeader
        eyebrow={t.aboutPage.eyebrow}
        title={
          <>
            {t.aboutPage.titleLineOne}
            <br />
            <span className="italic text-gold-soft">
              {t.aboutPage.titleLineTwo}
            </span>
          </>
        }
        lead={t.aboutPage.lead}
        image={photo("detailFacade", 2000)}
      />

      {/* --- Statement ------------------------------------------------------ */}
      <section className="shell py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <p className="font-display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.25] text-ink">
              {t.aboutPage.statement}
            </p>
            <div className="mt-10 space-y-6 text-[0.9375rem] leading-[1.85] text-graphite">
              {t.aboutPage.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-cream">
              <SmartImage
                src={photo("interiorStair", 1400)}
                alt={t.aboutPage.imageAlt}
                fill
                sizes="(min-width:1024px) 40vw, 92vw"
                className="object-cover"
              />
            </div>
            <div className="mt-6 border-t border-hairline pt-6">
              <p className="eyebrow">{t.aboutPage.offices}</p>
              <p className="mt-3 font-display text-2xl text-ink">
                {SITE.address[locale]}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- Principles ------------------------------------------------------ */}
      <section className="border-y border-hairline bg-cream/45">
        <div className="shell py-20 md:py-28">
          <SectionHeading
            eyebrow={t.aboutPage.howWeWork}
            title={
              <>
                {t.aboutPage.principlesTitleLineOne}
                <br />
                <span className="italic text-gold-deep">
                  {t.aboutPage.principlesTitleLineTwo}
                </span>
              </>
            }
          />

          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2">
            {t.aboutPage.principles.map((principle, index) => (
              <Reveal
                key={principle.title}
                delay={index * 0.08}
                className="border-t border-ink/12 pt-7"
              >
                <p className="font-display text-2xl text-gold tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-display text-[1.75rem] leading-tight text-ink">
                  {principle.title}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-graphite/85">
                  {principle.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <PremiumCta locale={locale} t={t} />
    </>
  );
}
