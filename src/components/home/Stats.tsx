import { DemoBadge } from "@/components/site/DemoBadge";
import { Reveal, RevealGroup } from "@/components/site/Reveal";
import type { Dictionary } from "@/lib/i18n";
import type { SiteStat } from "@/lib/types";

/**
 * The trust bar. Values come from `site_stats`, not from a hard-coded array,
 * so they can be corrected from the dashboard the moment real numbers exist.
 */
export function Stats({ stats, t }: { stats: SiteStat[]; t: Dictionary }) {
  if (stats.length === 0) return null;

  return (
    <section className="border-b border-hairline bg-cream/45" aria-label={t.stats.ariaLabel}>
      <div className="shell py-16 md:py-20">
        <Reveal className="mb-12 flex items-center gap-4">
          <span className="eyebrow">{t.stats.trustedBy}</span>
          <span className="rule hidden flex-1 sm:block" />
          <DemoBadge label={t.demo.badge} />
        </Reveal>

        <RevealGroup className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="border-t border-ink/12 pt-6">
              <p className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-none text-ink tabular-nums">
                {stat.value}
              </p>
              <p className="mt-3 text-[0.8125rem] leading-snug text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
