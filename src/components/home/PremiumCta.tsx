import Link from "next/link";

import { CountUp } from "@/components/site/CountUp";
import { DemoBadge } from "@/components/site/DemoBadge";
import { Reveal, RevealGroup } from "@/components/site/Reveal";
import { SmartImage } from "@/components/site/SmartImage";
import { Wordmark } from "@/components/site/Wordmark";
import { ArrowIcon } from "@/components/ui/Icons";
import { photo } from "@/lib/data/images";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";
import type { SiteStat } from "@/lib/types";

/**
 * The band that closes the page: a navy skyline plate carrying the lockup, the
 * closing pitch, the primary action, and the four numbers.
 *
 * The numbers used to be their own light section directly under the hero,
 * which put the least interesting content on the site in the second most
 * valuable slot on it — before the visitor had seen a single property. Down
 * here they read as what they are: the reassurance you want *after* you have
 * decided you are interested.
 */
export function PremiumCta({
  locale,
  t,
  stats = [],
}: {
  locale: Locale;
  t: Dictionary;
  /** Omitted on pages that are not the home page: the band still closes them,
   *  it just closes them with the pitch alone. */
  stats?: SiteStat[];
}) {
  return (
    <section className="relative overflow-hidden bg-midnight">
      <SmartImage
        src={photo("hotelUrbanTower", 2000)}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-bottom opacity-30"
      />
      {/* Two passes: a flat navy floor so the type never sits on raw
          photograph, and a lift from the bottom so the skyline reads as a
          silhouette rather than as a picture that happens to be behind text. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,22,40,0.94)_0%,rgba(7,22,40,0.82)_45%,rgba(7,22,40,0.96)_100%)]" aria-hidden />

      <div className="shell relative z-10 py-16 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          <Reveal>
            <Wordmark locale={locale} size="footer" tone="light" />
            <h2 className="mt-6 max-w-xl display-md text-paper">
              {t.cta.titleLineOne}{" "}
              <span className="text-gold-soft">{t.cta.titleLineTwo}</span>
            </h2>
            <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-paper/65">
              {t.cta.lead}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={localePath(locale, "/investments")}
                className="btn btn-gold group"
              >
                {t.common.exploreOpportunities}
                <ArrowIcon
                  size={14}
                  className="rtl-flip transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                />
              </Link>
              <Link
                href={localePath(locale, "/contact")}
                className="btn btn-ghost-light"
              >
                {t.common.speakToAdvisor}
              </Link>
            </div>
          </Reveal>

          {stats.length > 0 && (
            <div>
              <Reveal className="mb-5 flex items-center gap-3">
                <span className="eyebrow !text-paper/45">{t.stats.trustedBy}</span>
                <DemoBadge label={t.demo.badge} />
              </Reveal>

              <RevealGroup
                className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
                aria-label={t.stats.ariaLabel}
              >
                {stats.map((stat) => (
                  <div key={stat.id} className="border-s border-white/15 ps-4">
                    <p className="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-extrabold leading-none text-paper tabular-nums">
                      <CountUp value={stat.value} />
                    </p>
                    <p className="mt-2 text-[0.75rem] leading-snug text-paper/55">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </RevealGroup>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
