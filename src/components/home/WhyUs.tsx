import Link from "next/link";

import { Reveal, RevealGroup } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SmartImage } from "@/components/site/SmartImage";
import { ArrowIcon } from "@/components/ui/Icons";
import { photo } from "@/lib/data/images";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";

/**
 * Four reasons in a row, with a dark plate holding the closing line beside
 * them.
 *
 * The numeral is the icon. Four hand-picked pictograms would each need to be
 * argued for — a shield for security, a leaf for growth — and pictograms that
 * have to be argued for are decoration. A number says "this is the second of
 * four" and nothing else, which is exactly what it is.
 */
export function WhyUs({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section className="bg-paper">
      <div className="shell py-16 md:py-24">
        <SectionHeading
          eyebrow={t.why.eyebrow}
          title={
            <>
              {t.why.titleLineOne}{" "}
              <span className="text-gold-deep">{t.why.titleLineTwo}</span>
            </>
          }
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <RevealGroup className="grid gap-5 sm:grid-cols-2">
            {t.why.pillars.map((pillar, index) => (
              <Reveal key={pillar.title} className="h-full">
                <article className="card card-hover h-full p-6">
                  <span
                    aria-hidden
                    className="grid h-11 w-11 place-items-center rounded-[12px] bg-gold/15 font-display text-[0.9375rem] font-extrabold text-gold-deep tabular-nums"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-display text-[1.0625rem] font-bold leading-snug text-ink">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-graphite/85">
                    {pillar.copy}
                  </p>
                </article>
              </Reveal>
            ))}
          </RevealGroup>

          {/* The plate, deliberately not a video. A play button that opens
              nothing is a promise the page cannot keep; this one goes to the
              page that actually has the numbers on it. */}
          <Reveal delay={0.14}>
            <Link
              href={localePath(locale, "/investments")}
              className="group relative flex h-full min-h-[18rem] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-midnight p-7 shadow-[var(--shadow-raised)] transition-shadow duration-500 hover:shadow-[var(--shadow-float)]"
            >
              <SmartImage
                src={photo("heroSky", 1200)}
                alt=""
                fill
                sizes="(min-width:1024px) 352px, 92vw"
                className="object-cover opacity-45 transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,22,40,0.95)_10%,rgba(7,22,40,0.55)_55%,rgba(7,22,40,0.3)_100%)]"
                aria-hidden
              />
              <div className="relative">
                <p className="display-md text-paper">
                  {t.why.aside.title}
                  <br />
                  <span className="text-gold-soft">{t.why.aside.titleAccent}</span>
                </p>
                <p className="mt-3 text-[0.8125rem] leading-relaxed text-paper/65">
                  {t.why.aside.copy}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-gold-soft">
                  {t.why.aside.cta}
                  <ArrowIcon
                    size={14}
                    className="rtl-flip transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
