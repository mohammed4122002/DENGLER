import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Gallery } from "@/components/property/Gallery";
import { InquiryForm } from "@/components/property/InquiryForm";
import { InvestmentPanel } from "@/components/property/InvestmentPanel";
import { LocationMap } from "@/components/property/LocationMap";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  AreaIcon,
  ArrowIcon,
  BathIcon,
  BedIcon,
  CalendarIcon,
  PinIcon,
} from "@/components/ui/Icons";
import { formatArea, formatNumber, formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";
import { store } from "@/lib/store";
import {
  PROPERTY_TYPE_LABELS,
  STATUS_LABELS,
  type Property,
} from "@/lib/types";

export const revalidate = 3600;

/** Pre-render the catalogue at build time; anything new is rendered on demand. */
export async function generateStaticParams() {
  const slugs = await store.listPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await store.getPropertyBySlug(slug);

  if (!property) {
    return { title: "Property not found", robots: { index: false, follow: false } };
  }

  const title = `${property.title} — ${property.location}`;
  const description = `${property.tagline} ${formatPrice(
    property.price,
    property.currency,
  )} · ${formatArea(property.area)}${
    property.bedrooms ? ` · ${property.bedrooms} bedrooms` : ""
  }. ${PROPERTY_TYPE_LABELS[property.property_type]} for sale and investment through ${SITE.name}.`;

  return {
    title,
    description,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE.url}/properties/${property.slug}`,
      images: [{ url: property.cover_image, width: 1600, height: 1067, alt: property.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [property.cover_image],
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await store.getPropertyBySlug(slug);

  if (!property || !property.published) notFound();

  const related = (
    await store.listProperties({
      type: property.property_type,
      limit: 4,
      sort: "newest",
    })
  )
    .filter((item) => item.id !== property.id)
    .slice(0, 3);

  return (
    <>
      <StructuredData property={property} />

      <article className="pt-[var(--nav-h)]">
        {/* --- Title block ------------------------------------------------- */}
        <header className="shell pt-12 md:pt-16">
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-8 text-xs tracking-wide text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="nav-link hover:text-gold">Home</Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/properties" className="nav-link hover:text-gold">
                    Properties
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-graphite">{property.title}</li>
              </ol>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-hairline px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-graphite">
                {PROPERTY_TYPE_LABELS[property.property_type]}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${
                  property.status === "available"
                    ? "bg-gold/12 text-gold-deep"
                    : "bg-ink/8 text-graphite"
                }`}
              >
                {STATUS_LABELS[property.status]}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-3xl">
                <h1 className="display-lg text-ink">{property.title}</h1>
                <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                  <PinIcon size={15} />
                  {property.location}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <FavoriteButton
                  propertyId={property.id}
                  title={property.title}
                  tone="dark"
                />
                <p className="font-display text-[clamp(2rem,4vw,3rem)] leading-none text-ink">
                  {formatPrice(property.price, property.currency)}
                </p>
              </div>
            </div>
          </Reveal>
        </header>

        {/* --- Gallery ------------------------------------------------------ */}
        <div className="shell mt-10 md:mt-14">
          <Gallery images={property.images} title={property.title} />
        </div>

        {/* --- Key facts ---------------------------------------------------- */}
        <div className="shell mt-12">
          <Reveal>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-y border-hairline py-8 sm:grid-cols-4">
              <Fact
                icon={<AreaIcon size={16} />}
                label={property.property_type === "land" ? "Plot area" : "Built area"}
                value={formatArea(property.area)}
              />
              {property.bedrooms !== null && (
                <Fact
                  icon={<BedIcon size={16} />}
                  label={property.property_type === "hotel" ? "Keys" : "Bedrooms"}
                  value={formatNumber(property.bedrooms)}
                />
              )}
              {property.bathrooms !== null && (
                <Fact
                  icon={<BathIcon size={16} />}
                  label="Bathrooms"
                  value={formatNumber(property.bathrooms)}
                />
              )}
              {property.year_built !== null && (
                <Fact
                  icon={<CalendarIcon size={16} />}
                  label="Year built"
                  value={String(property.year_built)}
                />
              )}
            </dl>
          </Reveal>
        </div>

        {/* --- Body --------------------------------------------------------- */}
        <div className="shell grid gap-14 py-16 lg:grid-cols-12 lg:gap-x-16 lg:py-24">
          <div className="space-y-16 lg:col-span-7">
            <Reveal>
              <section aria-labelledby="description-heading">
                <h2 id="description-heading" className="font-display text-[1.75rem] text-ink">
                  About this property
                </h2>
                <p className="mt-3 font-display text-xl italic leading-snug text-gold-deep">
                  {property.tagline}
                </p>
                <p className="mt-6 whitespace-pre-line text-[0.9375rem] leading-[1.85] text-graphite">
                  {property.description}
                </p>
              </section>
            </Reveal>

            {property.features.length > 0 && (
              <Reveal>
                <section aria-labelledby="features-heading">
                  <h2 id="features-heading" className="font-display text-[1.75rem] text-ink">
                    Features
                  </h2>
                  <ul className="mt-6 grid gap-x-8 gap-y-px sm:grid-cols-2">
                    {property.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 border-b border-hairline py-3.5 text-sm text-graphite"
                      >
                        <span
                          className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-gold"
                          aria-hidden
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            <Reveal>
              <LocationMap property={property} />
            </Reveal>
          </div>

          {/* The rail carries only the investment read-out. The enquiry form
              lives in its own band below, which keeps this column short enough
              for `sticky` to have somewhere to travel — and gives the form the
              width it deserves. */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
              <InvestmentPanel property={property} />

              <a
                href="#enquire"
                className="btn btn-outline group mt-5 w-full"
              >
                Request Investment Details
                <ArrowIcon
                  size={15}
                  className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                />
              </a>
            </div>
          </aside>
        </div>

        {/* --- Enquiry ------------------------------------------------------ */}
        <section
          id="enquire"
          className="relative overflow-hidden bg-ink text-paper grain scroll-mt-[var(--nav-h)]"
          aria-labelledby="enquiry-heading"
        >
          <div className="shell relative z-10 grid gap-12 py-20 lg:grid-cols-12 lg:gap-16 md:py-28">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow !text-gold-soft">Next step</p>
              <h2
                id="enquiry-heading"
                className="mt-5 display-md text-paper"
              >
                Request the
                <br />
                <span className="italic text-gold-soft">investment pack.</span>
              </h2>
              <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-paper/60">
                Financials, title documents, the full photography set and
                viewing availability — sent directly by the advisor covering{" "}
                {property.title}.
              </p>
              <dl className="mt-10 space-y-4 text-sm">
                <div className="flex items-baseline justify-between gap-6 border-t border-paper/12 pt-4">
                  <dt className="text-paper/40">Reference</dt>
                  <dd className="font-mono text-xs text-paper/75">
                    {property.slug}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-6 border-t border-paper/12 pt-4">
                  <dt className="text-paper/40">Response time</dt>
                  <dd className="text-paper/75">One business day</dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-7">
              <InquiryForm
                propertyId={property.id}
                propertyTitle={property.title}
                tone="light"
              />
            </Reveal>
          </div>
        </section>

        {/* --- Related ------------------------------------------------------ */}
        {related.length > 0 && (
          <section className="border-t border-hairline bg-cream/40">
            <div className="shell py-20 md:py-28">
              <SectionHeading
                eyebrow="Comparable assets"
                title={
                  <>
                    Others in{" "}
                    <span className="italic text-gold-deep">
                      {PROPERTY_TYPE_LABELS[property.property_type].toLowerCase()}s
                    </span>
                  </>
                }
                link={{
                  href: `/${property.property_type === "land" ? "land" : `${property.property_type}s`}`,
                  label: "View category",
                }}
              />
              <div className="mt-14">
                <PropertyGrid properties={related} />
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted">
        <span className="text-gold">{icon}</span>
        {label}
      </dt>
      <dd className="mt-3 font-display text-[1.75rem] leading-none text-ink">
        {value}
      </dd>
    </div>
  );
}

/**
 * schema.org markup so the listing is eligible for rich results.
 *
 * Note what is deliberately absent: no `aggregateRating`, and no yield or ROI
 * in the structured data. Publishing invented performance figures as machine
 * -readable claims is exactly the kind of thing that should not be automated.
 */
function StructuredData({ property }: { property: Property }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.tagline,
    url: `${SITE.url}/properties/${property.slug}`,
    datePosted: property.created_at,
    image: property.images.slice(0, 5).map((image) => image.image_url),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency,
      availability:
        property.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
    about: {
      "@type": property.property_type === "hotel" ? "Hotel" : "Residence",
      name: property.title,
      address: {
        "@type": "PostalAddress",
        addressLocality: property.city,
        addressCountry: property.country,
      },
      ...(property.latitude !== null && property.longitude !== null
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: property.latitude,
              longitude: property.longitude,
            },
          }
        : {}),
      ...(property.bedrooms !== null ? { numberOfRooms: property.bedrooms } : {}),
      floorSize: {
        "@type": "QuantitativeValue",
        value: property.area,
        unitCode: "MTK",
      },
    },
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };

  return (
    <script
      type="application/ld+json"
      // Content is our own, and JSON.stringify escapes the values.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
