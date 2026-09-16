import Link from "next/link";

import { SmartImage } from "@/components/site/SmartImage";
import { photo } from "@/lib/data/images";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[85svh] items-center overflow-hidden bg-ink pt-[var(--nav-h)]">
      <SmartImage
        src={photo("detailSunset", 1800)}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_50%,rgba(10,9,8,0.6),rgba(10,9,8,0.94))]"
        aria-hidden
      />
      <div className="absolute inset-0 grain" aria-hidden />

      <div className="shell relative z-10 py-24 text-center">
        <p className="eyebrow !text-gold-soft">404</p>
        <h1 className="mx-auto mt-6 max-w-2xl display-lg text-paper">
          This address is
          <br />
          <span className="italic text-gold-soft">no longer listed.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-[0.9375rem] leading-relaxed text-paper/60">
          The property may have been withdrawn or sold. The portfolio is a good
          place to pick the search back up.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/properties" className="btn btn-ghost-light">
            Browse the portfolio
          </Link>
          <Link href="/contact" className="btn btn-ghost-light">
            Speak to an advisor
          </Link>
        </div>
      </div>
    </section>
  );
}
