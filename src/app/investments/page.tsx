import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/site/PageHeader";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { DemoBadge, DemoDisclaimer } from "@/components/site/DemoBadge";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ArrowIcon } from "@/components/ui/Icons";
import { photo } from "@/lib/data/images";
import { formatPercent, formatPriceCompact } from "@/lib/format";
import { store } from "@/lib/store";
import { INVESTMENT_TYPE_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/types";

export const metadata: Metadata = {
  title: "Investment Opportunities",
  description:
    "Compare DENGLER opportunities by projected ROI, annual revenue, occupancy and development upside — across villas, hotels and land.",
  alternates: { canonical: "/investments" },
};

export const revalidate = 3600;

export default async function InvestmentsPage() {
  const properties = await store.listProperties({ sort: "roi_desc" });

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
        eyebrow="Investment opportunities"
        title={
          <>
            Property, expressed as
            <br />
            <span className="italic text-gold-soft">capital and return.</span>
          </>
        }
        lead="Ranked by projected return, with the assumptions on the listing rather than behind an NDA. Sort, compare, then ask us for the workings."
        image={photo("hotelResortPool", 2000)}
      />

      {/* --- Strategy summary ---------------------------------------------- */}
      <section className="border-b border-hairline bg-cream/40">
        <div className="shell flex flex-wrap items-center gap-x-10 gap-y-6 py-10">
          <p className="eyebrow">Strategies represented</p>
          {byStrategy.map(([strategy, count]) => (
            <p key={strategy} className="text-sm text-graphite">
              <span className="font-display text-2xl text-ink">{count}</span>{" "}
              <span className="text-muted">
                {INVESTMENT_TYPE_LABELS[strategy as keyof typeof INVESTMENT_TYPE_LABELS]}
              </span>
            </p>
          ))}
          <DemoBadge className="ms-auto" />
        </div>
      </section>

      {/* --- Comparison table ----------------------------------------------- */}
      <section className="shell py-20 md:py-28">
        <SectionHeading
          eyebrow="Side by side"
          title={
            <>
              The whole portfolio,
              <br />
              <span className="italic text-gold-deep">on one page.</span>
            </>
          }
          lead="Every published asset with its headline investment figures. A dash means we do not hold that figure — not that it is zero."
        />

        <Reveal className="mt-14" y={16}>
          {/* Horizontally scrollable on small screens rather than reflowed into
              cards: a comparison table is only useful if the rows stay aligned. */}
          <div className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <caption className="sr-only">
                DENGLER portfolio investment comparison
              </caption>
              <thead>
                <tr className="border-b border-ink/15 text-start">
                  <Th className="w-[30%]">Asset</Th>
                  <Th>Type</Th>
                  <Th>Strategy</Th>
                  <Th align="end">Investment</Th>
                  <Th align="end">Annual revenue</Th>
                  <Th align="end">ROI</Th>
                  <Th align="end">Occupancy</Th>
                  <Th align="end" srOnly>Link</Th>
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
                        href={`/properties/${property.slug}`}
                        className="font-display text-lg text-ink transition-colors duration-300 group-hover:text-gold-deep"
                      >
                        {property.title}
                      </Link>
                      <span className="mt-0.5 block text-xs text-muted">
                        {property.location}
                      </span>
                    </td>
                    <td className="py-4 pe-4 text-graphite">
                      {PROPERTY_TYPE_LABELS[property.property_type]}
                    </td>
                    <td className="py-4 pe-4 text-graphite">
                      {INVESTMENT_TYPE_LABELS[property.investment_type]}
                    </td>
                    <td className="py-4 pe-4 text-end tabular-nums text-ink">
                      {formatPriceCompact(property.price, property.currency)}
                    </td>
                    <td className="py-4 pe-4 text-end tabular-nums text-graphite">
                      {property.annual_revenue
                        ? formatPriceCompact(property.annual_revenue, property.currency)
                        : "—"}
                    </td>
                    <td className="py-4 pe-4 text-end tabular-nums font-medium text-gold-deep">
                      {formatPercent(property.roi)}
                    </td>
                    <td className="py-4 pe-4 text-end tabular-nums text-graphite">
                      {formatPercent(property.occupancy_rate)}
                    </td>
                    <td className="py-4 text-end">
                      <Link
                        href={`/properties/${property.slug}`}
                        aria-label={`View ${property.title}`}
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

          <DemoDisclaimer className="mt-8 max-w-2xl" />
        </Reveal>
      </section>

      {/* --- Highest projected return ---------------------------------------- */}
      <section className="border-t border-hairline bg-paper">
        <div className="shell py-20 md:py-28">
          <SectionHeading
            eyebrow="Highest projected return"
            title={
              <>
                Where the numbers
                <br />
                <span className="italic text-gold-deep">are strongest today.</span>
              </>
            }
            link={{ href: "/properties?sort=roi_desc", label: "Search by ROI" }}
          />
          <div className="mt-14">
            <PropertyGrid properties={topSix} priorityCount={3} />
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
      className={`pb-4 pe-4 text-[11px] font-medium uppercase tracking-[0.16em] text-muted ${
        align === "end" ? "text-end" : "text-start"
      } ${srOnly ? "sr-only" : ""} ${className}`}
    >
      {children}
    </th>
  );
}
