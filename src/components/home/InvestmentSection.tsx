import Link from "next/link";

import { SmartImage } from "@/components/site/SmartImage";
import { DemoBadge, DemoDisclaimer } from "@/components/site/DemoBadge";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ArrowIcon } from "@/components/ui/Icons";
import { formatPercent, formatPriceCompact } from "@/lib/format";
import { INVESTMENT_TYPE_LABELS, type Property } from "@/lib/types";

/**
 * The section that makes DENGLER an investment platform rather than a listings
 * site: the same asset, expressed as capital in, revenue out, and return.
 */
export function InvestmentSection({ properties }: { properties: Property[] }) {
  if (properties.length === 0) return null;

  const [lead, ...rest] = properties;

  return (
    <section className="relative overflow-hidden bg-ink text-paper grain">
      <div className="shell relative z-10 py-24 md:py-32">
        <SectionHeading
          tone="light"
          eyebrow="Invest beyond property"
          title={
            <>
              Every asset, stated as
              <br />
              <span className="italic text-gold-soft">capital and return.</span>
            </>
          }
          lead="Yield, occupancy, revenue and development upside are published on the listing itself — not held back until the second meeting."
          link={{ href: "/investments", label: "All opportunities" }}
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          {/* --- Lead opportunity ------------------------------------------ */}
          <Reveal className="lg:col-span-7">
            <Link
              href={`/properties/${lead.slug}`}
              className="group relative block h-full overflow-hidden border border-paper/12"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <SmartImage
                  src={lead.cover_image}
                  alt={`${lead.title}, ${lead.location}`}
                  fill
                  sizes="(min-width:1024px) 56vw, 92vw"
                  className="object-cover transition-transform duration-[1300ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
                <div
                  className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,9,8,0.85),transparent_60%)]"
                  aria-hidden
                />
              </div>

              <div className="p-7 md:p-9">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="eyebrow !text-gold-soft">
                    {INVESTMENT_TYPE_LABELS[lead.investment_type]}
                  </span>
                  <DemoBadge />
                </div>

                <h3 className="mt-4 font-display text-[clamp(2rem,3.4vw,3rem)] leading-none text-paper">
                  {lead.title}
                </h3>
                <p className="mt-2 text-sm text-paper/50">{lead.location}</p>

                <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-paper/12 pt-8 sm:grid-cols-3">
                  <Figure label="Investment" value={formatPriceCompact(lead.price, lead.currency)} />
                  <Figure
                    label="Est. annual revenue"
                    value={
                      lead.annual_revenue
                        ? formatPriceCompact(lead.annual_revenue, lead.currency)
                        : "—"
                    }
                  />
                  <Figure label="Projected ROI" value={formatPercent(lead.roi)} accent />
                  <Figure label="Occupancy" value={formatPercent(lead.occupancy_rate)} />
                  <Figure label="Appreciation p.a." value={formatPercent(lead.appreciation)} />
                  <Figure
                    label="Market"
                    value={lead.country}
                    small
                  />
                </dl>

                <span className="mt-9 inline-flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-gold-soft">
                  Request investment details
                  <ArrowIcon
                    size={16}
                    className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5"
                  />
                </span>
              </div>
            </Link>
          </Reveal>

          {/* --- Supporting opportunities ---------------------------------- */}
          <div className="grid content-start gap-6 lg:col-span-5">
            {rest.slice(0, 3).map((property, index) => (
              <Reveal key={property.id} delay={0.08 * (index + 1)}>
                <Link
                  href={`/properties/${property.slug}`}
                  className="group flex items-center gap-5 border border-paper/12 p-5 transition-colors duration-500 hover:border-gold-soft/40"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden sm:h-28 sm:w-28">
                    <SmartImage
                      src={property.cover_image}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="eyebrow !text-paper/40">
                      {INVESTMENT_TYPE_LABELS[property.investment_type]}
                    </p>
                    <h4 className="mt-1.5 truncate font-display text-xl text-paper">
                      {property.title}
                    </h4>
                    <p className="mt-1 truncate text-xs text-paper/45">
                      {property.location}
                    </p>

                    <div className="mt-3 flex items-baseline gap-4 text-sm">
                      <span className="text-paper/70">
                        {formatPriceCompact(property.price, property.currency)}
                      </span>
                      <span className="text-gold-soft">
                        {formatPercent(property.roi)} ROI
                      </span>
                    </div>
                  </div>

                  <ArrowIcon
                    size={16}
                    className="shrink-0 text-paper/30 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:text-gold-soft"
                  />
                </Link>
              </Reveal>
            ))}

            <Reveal delay={0.3}>
              <DemoDisclaimer className="!text-paper/45 [&_strong]:!text-gold-soft" />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Figure({
  label,
  value,
  accent = false,
  small = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-paper/40">
        {label}
      </dt>
      <dd
        className={`mt-2 font-display leading-none ${
          small ? "text-xl" : "text-[clamp(1.5rem,2.4vw,2.25rem)]"
        } ${accent ? "text-gold-soft" : "text-paper"}`}
      >
        {value}
      </dd>
    </div>
  );
}
