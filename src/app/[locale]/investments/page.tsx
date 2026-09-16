import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/site/PageHeader";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { DemoBadge, DemoDisclaimer } from "@/components/site/DemoBadge";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ArrowIcon } from "@/components/ui/Icons";
import { photo } from "@/lib/data/images";
import { formatPercent, formatPriceCompact } from "@/lib/format";
import { store } from "@/lib/store";
import {
  fill,
  getDictionary,
  isLocale,
  localePath,
  type Locale,
} from "@/lib/i18n";
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
    title: t.nav.investments,
    description: t.investmentsPage.lead,
    ...buildAlternates(raw, "/investments"),
  };
}

export const revalidate = 3600;

export default async function InvestmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const t = getDictionary(locale);
  const properties = await store.listProperties({ sort: "roi_desc" }, locale);

  const topSix = properties.slice(0, 6);
  const byStrategy = Object.entries(
    properties.reduce<Record<string, number>>((acc, property) => {
      acc[property.investment_type] = (acc[property.investment_type] ?? 0) + 1;
      return acc;
    }, {}),
  );

  return (
    <>
      <PageHeader
        eyebrow={t.investmentsPage.eyebrow}
        title={
          <>
            {t.investmentsPage.titleLineOne}
            <br />
            <span className="italic text-gold-soft">
              {t.investmentsPage.titleLineTwo}
            </span>
          </>
        }
        lead={t.investmentsPage.lead}
        image={photo("hotelResortPool", 2000)}
      />

      {/* --- Strategy summary ---------------------------------------------- */}
      <section className="border-b border-hairline bg-cream/40">
        <div className="shell flex flex-wrap items-center gap-x-10 gap-y-6 py-10">
          <p className="eyebrow">{t.investmentsPage.strategiesRepresented}</p>
          {byStrategy.map(([strategy, count]) => (
            <p key={strategy} className="text-sm text-graphite">
              <span className="font-display text-2xl text-ink tabular-nums">
                {count}
              </span>{" "}
              <span className="text-muted">
                {t.enums.investmentType[strategy as keyof typeof t.enums.investmentType]}
              </span>
            </p>
          ))}
          <DemoBadge label={t.demo.badge} className="ms-auto" />
        </div>
      </section>

      {/* --- Comparison table ----------------------------------------------- */}
      <section className="shell py-20 md:py-28">
        <SectionHeading
          eyebrow={t.investmentsPage.sideBySide}
          title={
            <>
              {t.investmentsPage.tableTitleLineOne}
              <br />
              <span className="italic text-gold-deep">
                {t.investmentsPage.tableTitleLineTwo}
              </span>
            </>
          }
          lead={t.investmentsPage.tableLead}
        />

        <Reveal className="mt-14" y={16}>
          {/* Horizontally scrollable on small screens rather than reflowed into
              cards: a comparison table is only useful if the rows stay aligned. */}
          <div className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <caption className="sr-only">{t.investmentsPage.tableCaption}</caption>
              <thead>
                <tr className="border-b border-ink/15 text-start">
                  <Th className="w-[30%]">{t.investmentsPage.columns.asset}</Th>
                  <Th>{t.investmentsPage.columns.type}</Th>
                  <Th>{t.investmentsPage.columns.strategy}</Th>
                  <Th align="end">{t.investmentsPage.columns.investment}</Th>
                  <Th align="end">{t.investmentsPage.columns.annualRevenue}</Th>
                  <Th align="end">{t.investmentsPage.columns.roi}</Th>
                  <Th align="end">{t.investmentsPage.columns.occupancy}</Th>
                  <Th align="end" srOnly>
                    {t.investmentsPage.columns.link}
                  </Th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr
                    key={property.id}
                    className="group border-b border-hairline transition-colors duration-300 hover:bg-cream/50"
                  >
                    <td className="py-4 pe-4">
                      <Link
                        href={localePath(locale, `/properties/${property.slug}`)}
                        className="font-display text-lg text-ink transition-colors duration-300 group-hover:text-gold-deep"
                      >
                        {property.title}
                      </Link>
                      <span className="mt-0.5 block text-xs text-muted">
                        {property.location}
                      </span>
                    </td>
                    <td className="py-4 pe-4 text-graphite">
                      {t.enums.propertyType[property.property_type]}
                    </td>
                    <td className="py-4 pe-4 text-graphite">
                      {t.enums.investmentType[property.investment_type]}
                    </td>
                    <td className="py-4 pe-4 text-end tabular-nums text-ink">
                      {formatPriceCompact(property.price, property.currency, locale)}
                    </td>
                    <td className="py-4 pe-4 text-end tabular-nums text-graphite">
                      {property.annual_revenue
                        ? formatPriceCompact(
                            property.annual_revenue,
                            property.currency,
                            locale,
                          )
                        : "—"}
                    </td>
                    <td className="py-4 pe-4 text-end tabular-nums font-medium text-gold-deep">
                      {formatPercent(property.roi, locale)}
                    </td>
                    <td className="py-4 pe-4 text-end tabular-nums text-graphite">
                      {formatPercent(property.occupancy_rate, locale)}
                    </td>
                    <td className="py-4 text-end">
                      <Link
                        href={localePath(locale, `/properties/${property.slug}`)}
                        aria-label={fill(t.investmentsPage.viewAria, {
                          title: property.title,
                        })}
                        className="inline-flex text-muted transition-all duration-500 group-hover:translate-x-1 group-hover:text-gold"
                      >
                        <ArrowIcon size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DemoDisclaimer
            lead={t.demo.disclaimerLead}
            body={t.demo.disclaimer}
            className="mt-8 max-w-2xl"
          />
        </Reveal>
      </section>

      {/* --- Highest projected return ---------------------------------------- */}
      <section className="border-t border-hairline bg-paper">
        <div className="shell py-20 md:py-28">
          <SectionHeading
            eyebrow={t.investmentsPage.highestEyebrow}
            title={
              <>
                {t.investmentsPage.highestTitleLineOne}
                <br />
                <span className="italic text-gold-deep">
                  {t.investmentsPage.highestTitleLineTwo}
                </span>
              </>
            }
            link={{
              href: `${localePath(locale, "/properties")}?sort=roi_desc`,
              label: t.investmentsPage.searchByRoi,
            }}
          />
          <div className="mt-14">
            <PropertyGrid
              properties={topSix}
              locale={locale}
              t={t}
              priorityCount={3}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Th({
  children,
  align = "start",
  className = "",
  srOnly = false,
}: {
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
  srOnly?: boolean;
}) {
  return (
    <th
      scope="col"
      className={`pb-4 pe-4 text-[11px] font-medium uppercase tracking-[0.16em] text-muted rtl:tracking-normal rtl:normal-case ${
        align === "end" ? "text-end" : "text-start"
      } ${srOnly ? "sr-only" : ""} ${className}`}
    >
      {children}
    </th>
  );
}
