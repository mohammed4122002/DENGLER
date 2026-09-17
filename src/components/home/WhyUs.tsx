import { Reveal, RevealGroup } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import type { Dictionary } from "@/lib/i18n";

/**
 * Four reasons, each on its own raised card behind a gold-tinted numeral tile.
 *
 * The numeral is the icon. Four hand-picked pictograms would each need to be
 * argued for — a shield for security, a leaf for growth — and pictograms that
 * have to be argued for are decoration. A number says "this is the second of
 * four" and nothing else, which is exactly what it is.
 */
export function WhyUs({ t }: { t: Dictionary }) {
  return (
    <section className="border-t border-hairline bg-cream">
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

        <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </section>
  );
}
