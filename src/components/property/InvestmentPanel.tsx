import { DemoBadge, DemoDisclaimer } from "@/components/site/DemoBadge";
import { formatPercent, formatPrice } from "@/lib/format";
import { INVESTMENT_TYPE_LABELS, type Property } from "@/lib/types";

/**
 * The investment read-out. Any figure we do not hold is rendered as an em
 * dash rather than a zero — a missing yield and a zero yield are very
 * different statements to make about an asset.
 */
export function InvestmentPanel({ property }: { property: Property }) {
  const rows: { label: string; value: string; accent?: boolean; note?: string }[] = [
    {
      label: "Investment",
      value: formatPrice(property.price, property.currency),
      accent: true,
    },
    {
      label: "Estimated annual revenue",
      value: property.annual_revenue
        ? formatPrice(property.annual_revenue, property.currency)
        : "—",
      note: property.annual_revenue ? "Gross, before operating costs" : undefined,
    },
    {
      label: "Projected ROI",
      value: formatPercent(property.roi),
      accent: true,
      note: property.roi ? "Total return, annualised" : undefined,
    },
    { label: "Occupancy", value: formatPercent(property.occupancy_rate) },
    {
      label: "Expected appreciation",
      value: formatPercent(property.appreciation),
      note: property.appreciation ? "Per annum, capital value" : undefined,
    },
    {
      label: "Investment type",
      value: INVESTMENT_TYPE_LABELS[property.investment_type],
    },
  ];

  return (
    <section
      className="border border-hairline bg-cream/50 p-7 md:p-9"
      aria-labelledby="investment-overview"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="investment-overview"
          className="font-display text-[1.75rem] leading-none text-ink"
        >
          Investment overview
        </h2>
        <DemoBadge />
      </div>

      <dl className="mt-8 divide-y divide-hairline">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-6 py-4 first:pt-0"
          >
            <dt className="text-[0.8125rem] text-muted">
              {row.label}
              {row.note && (
                <span className="mt-0.5 block text-[11px] text-muted/70">
                  {row.note}
                </span>
              )}
            </dt>
            <dd
              className={`shrink-0 text-end font-display leading-none ${
                row.accent ? "text-2xl text-gold-deep" : "text-xl text-ink"
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <DemoDisclaimer className="mt-7 border-t border-hairline pt-6" />
    </section>
  );
}
