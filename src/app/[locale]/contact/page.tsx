import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InquiryForm } from "@/components/property/InquiryForm";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
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
    title: t.nav.contact,
    description: t.contactPage.lead,
    alternates: buildAlternates(raw, "/contact"),
  };
}

export default async function ContactPage({
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
        eyebrow={t.contactPage.eyebrow}
        title={
          <>
            {t.contactPage.titleLineOne}
            <br />
            <span className="italic text-gold-soft">
              {t.contactPage.titleLineTwo}
            </span>
          </>
        }
        lead={t.contactPage.lead}
        image={photo("interiorTerrace", 2000)}
      />

      <section className="shell grid gap-14 py-20 lg:grid-cols-12 lg:gap-16 md:py-28">
        <Reveal className="lg:col-span-5">
          <h2 className="font-display text-[1.75rem] text-ink">
            {t.contactPage.directLines}
          </h2>
          <dl className="mt-8 divide-y divide-hairline">
            <ContactRow label={t.contactPage.email}>
              <a href={`mailto:${SITE.email}`} className="nav-link hover:text-gold" dir="ltr">
                {SITE.email}
              </a>
            </ContactRow>
            <ContactRow label={t.contactPage.telephone}>
              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                className="nav-link hover:text-gold"
                dir="ltr"
              >
                {SITE.phone}
              </a>
            </ContactRow>
            <ContactRow label={t.contactPage.offices}>
              {SITE.address[locale]}
            </ContactRow>
            <ContactRow label={t.contactPage.hours}>
              {t.contactPage.hoursValue}
            </ContactRow>
          </dl>

          <p className="mt-10 max-w-sm text-sm leading-relaxed text-muted">
            {t.contactPage.offMarketNote}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="border border-hairline p-7 md:p-10">
            <h2 className="font-display text-[1.75rem] text-ink">
              {t.contactPage.sendEnquiry}
            </h2>
            <div className="mt-8">
              <InquiryForm
                locale={locale}
                t={t}
                submitLabel={t.contactPage.submit}
              />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function ContactRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-4 first:pt-0">
      <dt className="eyebrow">{label}</dt>
      <dd className="text-end text-sm text-graphite">{children}</dd>
    </div>
  );
}
