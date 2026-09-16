import type { Metadata } from "next";

import { PageHeader } from "@/components/site/PageHeader";
import { PremiumCta } from "@/components/home/PremiumCta";
import { SmartImage } from "@/components/site/SmartImage";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { photo } from "@/lib/data/images";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "DENGLER is a real estate and investment platform for villas, hotels and land — built around published numbers rather than withheld ones.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    index: "01",
    title: "Publish the numbers",
    body: "Yield, occupancy, revenue and appreciation belong on the listing. If an asset only looks good once the figures are hidden, it does not belong on the platform.",
  },
  {
    index: "02",
    title: "Say what is unconfirmed",
    body: "A consent applied for is not a consent granted. A ramping hotel is not a stabilised one. We label the difference rather than smoothing it into a projection.",
  },
  {
    index: "03",
    title: "Fewer listings, checked harder",
    body: "Title, built area, servicing and trading history are verified against source documents before anything is published. That work is the product.",
  },
  {
    index: "04",
    title: "Local counsel everywhere",
    body: "Ownership structures, non-resident rules and transfer taxes differ in every market we cover. Each transaction is run with counsel and valuation on the ground.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About DENGLER"
        title={
          <>
            A shorter list,
            <br />
            <span className="italic text-gold-soft">checked more carefully.</span>
          </>
        }
        lead="DENGLER exists because buying a villa, a hotel or a development parcel should not require three months of due diligence to establish what a listing could simply have said."
        image={photo("detailFacade", 2000)}
      />

      {/* --- Statement ------------------------------------------------------ */}
      <section className="shell py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <p className="font-display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.25] text-ink">
              Most property platforms are built to generate enquiries. The
              numbers that would let you rule an asset out are the numbers they
              hold back, because an enquiry is worth more than an honest
              answer.
            </p>
            <div className="mt-10 space-y-6 text-[0.9375rem] leading-[1.85] text-graphite">
              <p>
                DENGLER is built the other way round. Every listing carries its
                price, its area, its consent status, its trading history where
                one exists, and its projected return with the basis stated. You
                should be able to decide an asset is not for you without
                speaking to anybody.
              </p>
              <p>
                What remains after that filter is a much shorter list — and a
                much better conversation. We cover villas held for use and for
                yield, hospitality assets that already trade, and land where the
                scarcity is structural rather than narrative.
              </p>
              <p>
                We work across twenty-four markets from three offices, with
                local counsel and local valuation in each. We do not operate
                assets, we do not take a position alongside our clients, and we
                do not list what we have not checked.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-cream">
              <SmartImage
                src={photo("interiorStair", 1400)}
                alt="Interior of a DENGLER-listed residence"
                fill
                sizes="(min-width:1024px) 40vw, 92vw"
                className="object-cover"
              />
            </div>
            <div className="mt-6 border-t border-hairline pt-6">
              <p className="eyebrow">Offices</p>
              <p className="mt-3 font-display text-2xl text-ink">{SITE.address}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- Principles ------------------------------------------------------ */}
      <section className="border-y border-hairline bg-cream/45">
        <div className="shell py-20 md:py-28">
          <SectionHeading
            eyebrow="How we work"
            title={
              <>
                Four rules we
                <br />
                <span className="italic text-gold-deep">do not bend.</span>
              </>
            }
          />

          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <Reveal
                key={principle.index}
                delay={index * 0.08}
                className="border-t border-ink/12 pt-7"
              >
                <p className="font-display text-2xl text-gold">{principle.index}</p>
                <h3 className="mt-4 font-display text-[1.75rem] leading-tight text-ink">
                  {principle.title}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-graphite/85">
                  {principle.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <PremiumCta />
    </>
  );
}
