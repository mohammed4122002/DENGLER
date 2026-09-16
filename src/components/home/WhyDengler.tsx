import { Reveal, RevealGroup } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import type { Dictionary } from "@/lib/i18n";

export function WhyDengler({ t }: { t: Dictionary }) {
  return (
    <section className="border-t border-hairline bg-cream/45">
      <div className="shell py-24 md:py-32">
        <SectionHeading
          eyebrow={t.why.eyebrow}
          title={
            <>
              {t.why.titleLineOne}
              <br />
              <span className="italic text-gold-deep">{t.why.titleLineTwo}</span>
            </>
          }
        />

        <RevealGroup className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {t.why.pillars.map((pillar, index) => (
            <Reveal key={pillar.title} className="border-t border-ink/12 pt-7">
              <p className="font-display text-2xl text-gold tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-5 font-display text-[1.75rem] leading-tight text-ink">
                {pillar.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-graphite/85">
                {pillar.copy}
              </p>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
