import { Reveal, RevealGroup } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";

const PILLARS = [
  {
    index: "01",
    title: "Curated opportunities",
    copy: "We list a fraction of what we see. An asset earns a place here on the strength of its location, its title and its numbers — never on the size of the fee.",
  },
  {
    index: "02",
    title: "Verified information",
    copy: "Areas, consents, titles and trading accounts are checked against source documents before publication. Where something is unconfirmed, we say so on the listing.",
  },
  {
    index: "03",
    title: "Global markets",
    copy: "Twenty-four markets across the Gulf, the Mediterranean, the Atlantic coast and the Indian Ocean — with local counsel and local valuation in each.",
  },
  {
    index: "04",
    title: "Investment-focused",
    copy: "Every listing carries its yield, occupancy and development upside. You should be able to decide whether an asset is worth a conversation without having one.",
  },
];

export function WhyDengler() {
  return (
    <section className="border-t border-hairline bg-cream/45">
      <div className="shell py-24 md:py-32">
        <SectionHeading
          eyebrow="Why DENGLER"
          title={
            <>
              A shorter list,
              <br />
              <span className="italic text-gold-deep">checked more carefully.</span>
            </>
          }
        />

        <RevealGroup className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <Reveal key={pillar.index} className="border-t border-ink/12 pt-7">
              <p className="font-display text-2xl text-gold">{pillar.index}</p>
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
