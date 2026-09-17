import Link from "next/link";

import { SmartImage } from "@/components/site/SmartImage";
import { DemoBadge } from "@/components/site/DemoBadge";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { AreaIcon, ArrowIcon, BathIcon, BedIcon, PinIcon, TrendIcon } from "@/components/ui/Icons";
import { formatArea, formatPercent, formatPrice } from "@/lib/format";
import { fill, localePath, type Dictionary, type Locale } from "@/lib/i18n";
import type { LocalizedProperty } from "@/lib/types";

/**
 * A raised white card: photograph, status pill, then a block of facts ending
 * in a spec row and a "view details" affordance.
 *
 * The whole surface is a single anchor. The heart calls `preventDefault`
 * rather than being nested outside — keeping one link per card is what makes
 * keyboard and screen-reader traversal sane.
 *
 * The price is the loudest thing in the block on purpose. On a listing card
 * the price is what the eye is hunting for, and the title is how you confirm
 * you found the right one — putting the title first at display size inverts
 * the order people actually read in.
 */
export function PropertyCard({
  property,
  locale,
  t,
  priority = false,
  sizes = "(min-width:1280px) 30vw, (min-width:768px) 45vw, 92vw",
}: {
  property: LocalizedProperty;
  locale: Locale;
  t: Dictionary;
  priority?: boolean;
  sizes?: string;
}) {
  const {
    slug,
    title,
    location,
    price,
    currency,
    area,
    bedrooms,
    bathrooms,
    property_type,
    status,
    investment_type,
    roi,
    cover_image,
    tagline,
  } = property;

  return (
    <article className="group relative h-full">
      <Link
        href={localePath(locale, `/properties/${slug}`)}
        className="card card-hover flex h-full flex-col overflow-hidden outline-offset-4"
        aria-label={`${title} — ${location}, ${formatPrice(price, currency, locale)}`}
      >
        {/* --- Photograph --------------------------------------------------- */}
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-cream">
          <SmartImage
            src={cover_image}
            alt={`${title}, ${location}`}
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
          />

          {/* Gradient only appears on hover, so the grid stays light at rest. */}
          <div
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,9,8,0.55),transparent_55%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            aria-hidden
          />

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-navy">
                {t.enums.propertyType[property_type]}
              </span>
              {status !== "available" && (
                <span className="badge badge-paper">{t.enums.status[status]}</span>
              )}
            </div>
            <FavoriteButton
              propertyId={property.id}
              saveLabel={fill(t.card.saveToShortlist, { title })}
              removeLabel={fill(t.card.removeFromShortlist, { title })}
            />
          </div>

          {/* Investment badge — the thing that separates Crete Roots from a
              conventional listing card. */}
          {roi !== null && (
            <div className="badge badge-gold absolute bottom-3 start-3 shadow-[0_8px_18px_-10px_rgba(7,22,40,0.8)]">
              <TrendIcon size={12} />
              {formatPercent(roi, locale)} {t.card.projectedRoi}
            </div>
          )}
        </div>

        {/* --- Detail ------------------------------------------------------- */}
        <div className="flex flex-1 flex-col p-5">
          <p className="flex items-center gap-1.5 text-[0.8125rem] text-muted">
            <PinIcon size={13} className="shrink-0" />
            {location}
          </p>

          <h3 className="mt-1.5 font-display text-[1.0625rem] font-bold leading-snug text-ink transition-colors duration-300 group-hover:text-gold-deep">
            {title}
          </h3>

          <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-graphite/85">
            {tagline}
          </p>

          <p className="mt-3 font-display text-[1.375rem] font-extrabold leading-none text-ink tabular-nums">
            {formatPrice(price, currency, locale)}
          </p>

          <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[10px] bg-cream px-3 py-2.5 text-[0.75rem] text-graphite">
            {bedrooms !== null && (
              <div className="flex items-center gap-1.5">
                <BedIcon size={14} className="text-muted" />
                <dt className="sr-only">{t.card.bedrooms}</dt>
                <dd>
                  {bedrooms}{" "}
                  {property_type === "hotel" ? t.card.keys : t.card.bedroomsShort}
                </dd>
              </div>
            )}
            {bathrooms !== null && (
              <div className="flex items-center gap-1.5">
                <BathIcon size={14} className="text-muted" />
                <dt className="sr-only">{t.card.bathrooms}</dt>
                <dd>
                  {bathrooms} {t.card.bathroomsShort}
                </dd>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <AreaIcon size={14} className="text-muted" />
              <dt className="sr-only">{t.card.area}</dt>
              <dd>{formatArea(area, locale)}</dd>
            </div>
          </dl>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted rtl:tracking-normal rtl:normal-case">
              {t.enums.investmentType[investment_type]}
            </span>
            <DemoBadge label={t.demo.badge} />
          </div>

          {/* `mt-auto` pins this to the bottom so a row of cards with titles of
              different lengths still lines its actions up. */}
          <span className="mt-auto flex items-center gap-2 border-t border-hairline pt-4 text-[0.8125rem] font-semibold text-ink transition-colors duration-300 group-hover:text-gold-deep">
            {t.card.viewDetails}
            <ArrowIcon
              size={14}
              className="rtl-flip transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}
