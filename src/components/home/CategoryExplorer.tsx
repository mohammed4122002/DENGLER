import Link from "next/link";

import { SmartImage } from "@/components/site/SmartImage";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ArrowIcon } from "@/components/ui/Icons";
import { photo, type PhotoKey } from "@/lib/data/images";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";

interface Category {
  href: string;
  label: string;
  title: string;
  copy: string;
  image: PhotoKey;
  count: number;
  /** Plural form is a language decision, so the caller supplies both words. */
  countLabel: string;
}

/**
 * The three pillars. Each panel is weighted differently on desktop — villas
 * take the tall leading column, hotels and land stack beside it — so the three
 * categories read as a considered composition rather than three equal boxes.
 */
export function CategoryExplorer({
  counts,
  locale,
  t,
}: {
  counts: { villa: number; hotel: number; land: number };
  locale: Locale;
  t: Dictionary;
}) {
  const countLabel = (n: number) => (n === 1 ? t.common.listing : t.common.listings);

  const categories: Category[] = [
    {
      href: localePath(locale, "/villas"),
      label: t.categories.villa.label,
      title: t.categories.villa.title,
      copy: t.categories.villa.copy,
      image: "villaPalmModern",
      count: counts.villa,
      countLabel: countLabel(counts.villa),
    },
    {
      href: localePath(locale, "/hotels"),
      label: t.categories.hotel.label,
      title: t.categories.hotel.title,
      copy: t.categories.hotel.copy,
      image: "hotelResortPool",
      count: counts.hotel,
      countLabel: countLabel(counts.hotel),
    },
    {
      href: localePath(locale, "/land"),
      label: t.categories.land.label,
      title: t.categories.land.title,
      copy: t.categories.land.copy,
      image: "landCoastalPlot",
      count: counts.land,
      countLabel: countLabel(counts.land),
    },
  ];

  return (
    <section className="bg-paper">
      <div className="shell py-16 md:py-24">
        <SectionHeading
          eyebrow={t.categories.eyebrow}
          title={
            <>
              {t.categories.titleLineOne}
              <br />
              <span className="text-gold-deep">
                {t.categories.titleLineTwo}
              </span>
            </>
          }
          link={{
            href: localePath(locale, "/properties"),
            label: t.common.allInventory,
          }}
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:gap-6">
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
      className={`group relative block w-full overflow-hidden rounded-[var(--radius-card)] bg-ink shadow-[var(--shadow-raised)] transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[var(--shadow-float)] ${
        tall ? "aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[560px]" : "aspect-[16/10] lg:aspect-[16/9]"
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
          <span className="mt-6 inline-flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-gold-soft rtl:tracking-normal rtl:normal-case">
            <span className="tabular-nums">{category.count}</span>{" "}
            {category.countLabel}
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
