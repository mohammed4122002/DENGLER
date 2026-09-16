import Link from "next/link";

import { SmartImage } from "@/components/site/SmartImage";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ArrowIcon } from "@/components/ui/Icons";
import { photo, type PhotoKey } from "@/lib/data/images";

interface Category {
  href: string;
  label: string;
  title: string;
  copy: string;
  image: PhotoKey;
  count: number;
}

/**
 * The three pillars. Each panel is weighted differently on desktop — villas
 * take the tall leading column, hotels and land stack beside it — so the three
 * categories read as a considered composition rather than three equal boxes.
 */
export function CategoryExplorer({
  counts,
}: {
  counts: { villa: number; hotel: number; land: number };
}) {
  const categories: Category[] = [
    {
      href: "/villas",
      label: "01 — Villas",
      title: "VILLAS",
      copy: "Private residences held for use, for yield, or for both. Architect-led, coastal and city, from Dubai to the Côte d'Azur.",
      image: "villaPalmModern",
      count: counts.villa,
    },
    {
      href: "/hotels",
      label: "02 — Hotels",
      title: "HOTELS",
      copy: "Trading hospitality assets and consented conversions, sold with the operator, the accounts and the booking book in place.",
      image: "hotelResortPool",
      count: counts.hotel,
    },
    {
      href: "/land",
      label: "03 — Land",
      title: "LAND",
      copy: "Development parcels where the scarcity is structural — zoning, water rights, frontage or consent that cannot be recreated.",
      image: "landCoastalPlot",
      count: counts.land,
    },
  ];

  return (
    <section className="bg-paper">
      <div className="shell py-24 md:py-32">
        <SectionHeading
          eyebrow="Explore by category"
          title={
            <>
              Three ways to hold
              <br />
              <span className="italic text-gold-deep">real assets.</span>
            </>
          }
          link={{ href: "/properties", label: "All inventory" }}
        />

        <div className="mt-16 grid gap-5 lg:grid-cols-12 lg:gap-6">
          <Reveal className="lg:col-span-6">
            <CategoryPanel category={categories[0]} tall />
          </Reveal>
          <div className="grid gap-5 lg:col-span-6 lg:gap-6">
            <Reveal delay={0.1}>
              <CategoryPanel category={categories[1]} />
            </Reveal>
            <Reveal delay={0.18}>
              <CategoryPanel category={categories[2]} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryPanel({
  category,
  tall = false,
}: {
  category: Category;
  tall?: boolean;
}) {
  return (
    <Link
      href={category.href}
      className={`group relative block w-full overflow-hidden bg-ink ${
        tall ? "aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[640px]" : "aspect-[16/10] lg:aspect-[16/9]"
      }`}
    >
      <SmartImage
        src={photo(category.image, 1400)}
        alt=""
        fill
        sizes="(min-width:1024px) 46vw, 92vw"
        className="object-cover opacity-80 transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] group-hover:opacity-95"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,9,8,0.9)_5%,rgba(10,9,8,0.25)_55%,rgba(10,9,8,0.35)_100%)]"
        aria-hidden
      />
      {/* Gold hairline that draws itself along the bottom edge on hover. */}
      <span
        className="absolute inset-x-0 bottom-0 h-px origin-[inline-start] scale-x-0 bg-gold-soft transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
        aria-hidden
      />

      <div className="absolute inset-0 flex flex-col justify-between p-7 md:p-9">
        <p className="eyebrow !text-paper/55">{category.label}</p>

        <div>
          <h3
            className={`font-display leading-none text-paper ${
              tall ? "text-[clamp(3rem,7vw,5.5rem)]" : "text-[clamp(2.5rem,5vw,4rem)]"
            }`}
          >
            {category.title}
          </h3>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/65">
            {category.copy}
          </p>
          <span className="mt-6 inline-flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-gold-soft">
            {category.count} {category.count === 1 ? "listing" : "listings"}
            <ArrowIcon
              size={16}
              className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
