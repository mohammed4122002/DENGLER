import Link from "next/link";

import { SmartImage } from "@/components/site/SmartImage";
import { DemoBadge } from "@/components/site/DemoBadge";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { AreaIcon, ArrowIcon, BathIcon, BedIcon, PinIcon, TrendIcon } from "@/components/ui/Icons";
import { formatArea, formatPercent, formatPrice } from "@/lib/format";
import {
  INVESTMENT_TYPE_LABELS,
  PROPERTY_TYPE_LABELS,
  STATUS_LABELS,
  type Property,
} from "@/lib/types";

/**
 * The card is a single anchor with the whole surface clickable. The heart
 * calls `preventDefault` rather than being nested outside — keeping one link
 * per card is what makes keyboard and screen-reader traversal sane.
 */
export function PropertyCard({
  property,
  priority = false,
  sizes = "(min-width:1280px) 30vw, (min-width:768px) 45vw, 92vw",
}: {
  property: Property;
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
    <article className="group relative">
      <Link
        href={`/properties/${slug}`}
        className="block outline-offset-4"
        aria-label={`${title} — ${location}, ${formatPrice(price, currency)}`}
      >
        {/* --- Photograph --------------------------------------------------- */}
        <div className="relative aspect-[4/3] overflow-hidden bg-cream">
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

          <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-paper/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-ink backdrop-blur-sm">
                {PROPERTY_TYPE_LABELS[property_type]}
              </span>
              {status !== "available" && (
                <span className="rounded-full bg-ink/85 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-paper backdrop-blur-sm">
                  {STATUS_LABELS[status]}
                </span>
              )}
            </div>
            <FavoriteButton propertyId={property.id} title={title} />
          </div>

          {/* Investment badge — the thing that separates DENGLER from a
              conventional listing card. */}
          {roi !== null && (
            <div className="absolute bottom-4 start-4 flex items-center gap-2 rounded-full border border-gold-soft/45 bg-ink/70 px-3.5 py-1.5 text-[11px] text-gold-soft backdrop-blur-md">
              <TrendIcon size={13} />
              <span className="font-medium tracking-wide">
                {formatPercent(roi)} projected ROI
              </span>
            </div>
          )}
        </div>

        {/* --- Detail ------------------------------------------------------- */}
        <div className="pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-[1.6rem] leading-tight text-ink transition-colors duration-500 group-hover:text-gold-deep">
              {title}
            </h3>
            <ArrowIcon
              size={18}
              className="mt-1 shrink-0 text-muted transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:text-gold"
            />
          </div>

          <p className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-muted">
            <PinIcon size={13} className="shrink-0" />
            {location}
          </p>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-graphite/85">
            {tagline}
          </p>

          <p className="mt-5 font-display text-[1.75rem] leading-none text-ink">
            {formatPrice(price, currency)}
          </p>

          <dl className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hairline pt-4 text-[0.8125rem] text-graphite">
            {bedrooms !== null && (
              <div className="flex items-center gap-1.5">
                <BedIcon size={14} className="text-muted" />
                <dt className="sr-only">Bedrooms</dt>
                <dd>
                  {bedrooms} {property_type === "hotel" ? "keys" : "bd"}
                </dd>
              </div>
            )}
            {bathrooms !== null && (
              <div className="flex items-center gap-1.5">
                <BathIcon size={14} className="text-muted" />
                <dt className="sr-only">Bathrooms</dt>
                <dd>{bathrooms} ba</dd>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <AreaIcon size={14} className="text-muted" />
              <dt className="sr-only">Area</dt>
              <dd>{formatArea(area)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted">
              {INVESTMENT_TYPE_LABELS[investment_type]}
            </span>
            <DemoBadge />
          </div>
        </div>
      </Link>
    </article>
  );
}
