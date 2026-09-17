"use client";

import Link from "next/link";
import { useState } from "react";

import { SmartImage } from "@/components/site/SmartImage";
import { Reveal } from "@/components/site/Reveal";
import {
  AreaIcon,
  ArrowIcon,
  PinIcon,
  SearchIcon,
  TrendIcon,
} from "@/components/ui/Icons";
import { formatArea, formatPrice } from "@/lib/format";
import { fill, localePath, type Dictionary, type Locale } from "@/lib/i18n";
import type { LocalizedProperty } from "@/lib/types";

/**
 * The walkthrough band: the pitch and its four supporting lines on the leading
 * side, a large photograph with a working thumbnail strip in the middle, and
 * the property's own card floating on the trailing edge.
 *
 * The thumbnails actually change the photograph — they are not decoration
 * standing in for a feature that does not exist. That is also why this section
 * is called a photo tour rather than a 3D tour: there is no 3D model in this
 * catalogue, and a button promising a walkthrough that opens a still is worse
 * than no button.
 *
 * `index` is clamped against the real gallery length rather than assumed to be
 * four, because an editor can delete an image from the dashboard at any time.
 */
export function PhotoTour({
  property,
  locale,
  t,
}: {
  property: LocalizedProperty;
  locale: Locale;
  t: Dictionary;
}) {
  const shots = property.images.length > 0
    ? property.images
    : [{ id: property.id, image_url: property.cover_image, alt: property.title }];
  const [index, setIndex] = useState(0);
  const active = shots[Math.min(index, shots.length - 1)];
  const href = localePath(locale, `/properties/${property.slug}`);

  return (
    <section className="border-y border-hairline bg-cream">
      <div className="shell py-16 md:py-24">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,19rem)_minmax(0,1fr)_minmax(0,17rem)]">
          {/* ── The pitch ───────────────────────────────────────────── */}
          <Reveal>
            <p className="eyebrow">{t.tour.eyebrow}</p>
            <h2 className="mt-2 display-md text-ink">{t.tour.title}</h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-graphite/85">
              {t.tour.lead}
            </p>

            <ul className="mt-7 space-y-4">
              {t.tour.features.map((feature, i) => (
                <li key={feature} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-paper text-gold-deep shadow-[var(--shadow-raised)]"
                  >
                    {[<SearchIcon key="a" size={16} />, <AreaIcon key="b" size={16} />,
                      <TrendIcon key="c" size={16} />, <PinIcon key="d" size={16} />][i]}
                  </span>
                  <span className="text-[0.875rem] font-medium text-ink">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href={href} className="btn btn-gold group mt-8">
              {t.tour.cta}
              <ArrowIcon
                size={14}
                className="rtl-flip transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
              />
            </Link>
          </Reveal>

          {/* ── The plate ───────────────────────────────────────────── */}
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-ink shadow-[var(--shadow-float)]">
              <div className="relative aspect-[16/10]">
                <SmartImage
                  key={active.image_url}
                  src={active.image_url}
                  alt={active.alt || property.title}
                  fill
                  sizes="(min-width:1280px) 46vw, (min-width:1024px) 60vw, 92vw"
                  className="animate-[fade_600ms_cubic-bezier(0.22,1,0.36,1)] object-cover"
                />
                <span className="badge badge-paper absolute start-4 top-4">
                  {fill(t.tour.counter, {
                    index: String(Math.min(index, shots.length - 1) + 1),
                    total: String(shots.length),
                  })}
                </span>
              </div>

              {/* The strip sits on the plate, as in a lightbox, so the eye does
                  not have to leave the image to change it. */}
              {shots.length > 1 && (
                <ul className="no-scrollbar absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto bg-[linear-gradient(to_top,rgba(7,22,40,0.85),transparent)] p-3">
                  {shots.map((shot, i) => (
                    <li key={shot.id} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={fill(t.tour.thumbLabel, { index: String(i + 1) })}
                        aria-current={i === index}
                        className={`relative block h-14 w-20 overflow-hidden rounded-[8px] ring-2 transition-all duration-300 ${
                          i === index
                            ? "ring-gold"
                            : "opacity-65 ring-transparent hover:opacity-100"
                        }`}
                      >
                        <SmartImage
                          src={shot.image_url}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>

          {/* ── The property, floating ──────────────────────────────── */}
          <Reveal delay={0.18} className="hidden xl:block">
            <div className="card overflow-hidden">
              <div className="p-4">
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <PinIcon size={12} className="shrink-0" />
                  {property.location}
                </p>
                <p className="mt-1.5 font-display text-[1.0625rem] font-bold leading-snug text-ink">
                  {property.title}
                </p>
              </div>
              <div className="relative aspect-[16/10]">
                <SmartImage
                  src={property.cover_image}
                  alt=""
                  fill
                  sizes="272px"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="font-display text-[1.25rem] font-extrabold leading-none text-ink tabular-nums">
                  {formatPrice(property.price, property.currency, locale)}
                </p>
                <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[10px] bg-cream px-3 py-2 text-[0.75rem] text-graphite">
                  {property.bedrooms !== null && (
                    <div>
                      <dt className="sr-only">{t.card.bedrooms}</dt>
                      <dd>
                        {property.bedrooms}{" "}
                        {property.property_type === "hotel"
                          ? t.card.keys
                          : t.card.bedroomsShort}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="sr-only">{t.card.area}</dt>
                    <dd>{formatArea(property.area, locale)}</dd>
                  </div>
                </dl>
                <Link
                  href={`${href}#location`}
                  className="group mt-4 flex items-center justify-between gap-2 rounded-[10px] border border-hairline px-3 py-2.5 text-[0.8125rem] font-semibold text-ink transition-colors duration-300 hover:border-ink"
                >
                  {t.tour.mapLabel}
                  <ArrowIcon
                    size={14}
                    className="rtl-flip text-gold-deep transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
