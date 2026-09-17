import { DemoBadge, DemoDisclaimer } from "@/components/site/DemoBadge";
import { formatPercent, formatPrice } from "@/lib/format";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { LocalizedProperty } from "@/lib/types";

/**
 * The investment read-out. Any figure we do not hold is rendered as an em
 * dash rather than a zero — a missing yield and a zero yield are very
 * different statements to make about an asset.
 */
export function InvestmentPanel({
  property,
  locale,
  t,
}: {
  property: LocalizedProperty;
  locale: Locale;
  t: Dictionary;
}) {
  const r = t.detail.rows;

  const rows: { label: string; value: string; accent?: boolean; note?: string }[] = [
    {
      label: r.investment,
      value: formatPrice(property.price, property.currency, locale),
      accent: true,
    },
    {
      label: r.annualRevenue,
      value: property.annual_revenue
        ? formatPrice(property.annual_revenue, property.currency, locale)
        : "—",
      note: property.annual_revenue ? r.annualRevenueNote : undefined,
    },
    {
      label: r.projectedRoi,
      value: formatPercent(property.roi, locale),
      accent: true,
      note: property.roi ? r.projectedRoiNote : undefined,
    },
    { label: r.occupancy, value: formatPercent(property.occupancy_rate, locale) },
    {
      label: r.appreciation,
      value: formatPercent(property.appreciation, locale),
      note: property.appreciation ? r.appreciationNote : undefined,
    },
    {
      label: r.investmentType,
      value: t.enums.investmentType[property.investment_type],
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
          {t.detail.investmentOverview}
        </h2>
        <DemoBadge label={t.demo.badge} />
      </div>

      <dl className="mt-8 divide-y divide-hairline">
        {rows.map((row) => (
          <div
            key={row.label}
            /* `flex-wrap` is what keeps a wordy value — "Hospitality
               operation" rather than a figure — from pushing the row past the
               viewport at 320px. The value itself stays `shrink-0` so a
               number never breaks across lines; when it cannot fit beside its
               label it takes a line of its own instead. */
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 first:pt-0"
          >
            <dt className="min-w-0 text-[0.8125rem] text-muted">
              {row.label}
              {row.note && (
                <span className="mt-0.5 block text-[11px] text-muted/70">
                  {row.note}
                </span>
              )}
            </dt>
            <dd
              className={`ms-auto shrink-0 text-end font-display leading-none tabular-nums ${
                row.accent ? "text-2xl text-gold-deep" : "text-xl text-ink"
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <DemoDisclaimer
        lead={t.demo.disclaimerLead}
        body={t.demo.disclaimer}
        className="mt-7 border-t border-hairline pt-6"
      />
    </section>
  );
}
