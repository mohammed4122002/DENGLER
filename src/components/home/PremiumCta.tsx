import Link from "next/link";

import { SmartImage } from "@/components/site/SmartImage";
import { Reveal } from "@/components/site/Reveal";
import { ArrowIcon } from "@/components/ui/Icons";
import { photo } from "@/lib/data/images";

export function PremiumCta() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <SmartImage
        src={photo("detailSunset", 2000)}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-45"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_50%,rgba(10,9,8,0.55),rgba(10,9,8,0.92))]"
        aria-hidden
      />
      <div className="absolute inset-0 grain" aria-hidden />

      <div className="shell relative z-10 flex flex-col items-center py-32 text-center md:py-44">
        <Reveal>
          <p className="eyebrow !text-gold-soft">Private introductions</p>
          <h2 className="mt-6 max-w-3xl display-lg text-paper">
            Your next investment
            <br />
            <span className="italic text-gold-soft">starts here.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-lg text-[0.9375rem] leading-relaxed text-paper/60">
            Tell us the market, the ticket size and the hold period. We will
            come back with what is available — including what never reaches a
            public listing.
          </p>
        </Reveal>

        <Reveal delay={0.14} className="mt-11 flex flex-col gap-3 sm:flex-row">
          <Link href="/investments" className="btn btn-ghost-light group">
            Explore Opportunities
            <ArrowIcon
              size={16}
              className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
            />
          </Link>
          <Link href="/contact" className="btn btn-ghost-light">
            Speak to an advisor
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
