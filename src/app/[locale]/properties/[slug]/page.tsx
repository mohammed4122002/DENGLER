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
  fill,
  getDictionary,
  isLocale,
  isRtl,
  localePath,
  LOCALES,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";
import { buildAlternates } from "@/lib/i18n/metadata";
import type { LocalizedProperty } from "@/lib/types";

export const revalidate = 3600;

/** Pre-render the catalogue in both languages; anything new renders on demand. */
export async function generateStaticParams() {
  const slugs = await store.listPublishedSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};

  const locale: Locale = raw;
  const t = getDictionary(locale);
  const property = await store.getPropertyBySlug(slug, locale);

  if (!property) {
    return { title: t.notFound.notFoundTitle, robots: { index: false, follow: false } };
  }

  const title = `${property.title} — ${property.location}`;
  const facts = [
    formatPrice(property.price, property.currency, locale),
    formatArea(property.area, locale),
    property.bedrooms
      ? `${property.bedrooms} ${
          property.property_type === "hotel" ? t.detail.keys : t.detail.bedrooms
        }`
      : null,
  ].filter(Boolean);

  const description = `${property.tagline} ${facts.join(" · ")} — ${
    t.enums.propertyType[property.property_type]
  }, ${SITE.name}.`;

  // Spread the shared block, then extend its `openGraph` rather than replacing
  // it — a bare `openGraph: {...}` here would drop the canonical URL, the
  // BCP-47 locale tag and the alternate-locale list the helper supplies.
  const shared = buildAlternates(locale, `/properties/${property.slug}`);

  return {
    title,
    description,
    ...shared,
    openGraph: {
      ...shared.openGraph,
      type: "article",
      title,
      description,
      images: [
        { url: property.cover_image, width: 1600, height: 1067, alt: property.title },
      ],
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
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const t = getDictionary(locale);
  const property = await store.getPropertyBySlug(slug, locale);

  if (!property || !property.published) notFound();

  const related = (
    await store.listProperties(
      { type: property.property_type, limit: 4, sort: "newest" },
      locale,
    )
  )
    .filter((item) => item.id !== property.id)
    .slice(0, 3);

  return (
    <>
      <StructuredData property={property} locale={locale} />

      <article className="pt-[var(--nav-h)]">
        {/* --- Title block ------------------------------------------------- */}
        <header className="shell pt-12 md:pt-16">
          <Reveal>
            <nav
              aria-label={t.detail.breadcrumb}
              className="mb-8 text-xs tracking-wide text-muted rtl:tracking-normal"
            >
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href={localePath(locale, "/")} className="nav-link hover:text-gold">
                    {t.nav.home}
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link
                    href={localePath(locale, "/properties")}
                    className="nav-link hover:text-gold"
                  >
                    {t.nav.properties}
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-graphite">{property.title}</li>
              </ol>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-hairline px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-graphite rtl:tracking-normal rtl:normal-case">
                {t.enums.propertyType[property.property_type]}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] rtl:tracking-normal rtl:normal-case ${
                  property.status === "available"
                    ? "bg-gold/12 text-gold-deep"
                    : "bg-ink/8 text-graphite"
                }`}
              >
                {t.enums.status[property.status]}
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

              {/* `2,850,000 USD` is materially wider than `$2,850,000`: an ISO
                  code is three letters and a space where the symbol is one
                  character. The lower clamp bound is set for that longer form
                  so the price never pushes the header past the viewport. */}
              <div className="flex min-w-0 items-center gap-4">
                <FavoriteButton
                  propertyId={property.id}
                  saveLabel={fill(t.card.saveToShortlist, { title: property.title })}
                  removeLabel={fill(t.card.removeFromShortlist, {
                    title: property.title,
                  })}
                  tone="dark"
                />
                <p className="font-display text-[clamp(1.6rem,4vw,3rem)] leading-none text-ink tabular-nums">
                  {formatPrice(property.price, property.currency, locale)}
                </p>
              </div>
            </div>
          </Reveal>
        </header>

        {/* --- Gallery ------------------------------------------------------ */}
        <div className="shell mt-10 md:mt-14">
          <Gallery
            images={property.images}
            title={property.title}
            t={t}
            rtl={isRtl(locale)}
          />
        </div>

        {/* --- Key facts ---------------------------------------------------- */}
        <div className="shell mt-12">
          <Reveal>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-y border-hairline py-8 sm:grid-cols-4">
              <Fact
                icon={<AreaIcon size={16} />}
                label={
                  property.property_type === "land"
                    ? t.detail.plotArea
                    : t.detail.builtArea
                }
                value={formatArea(property.area, locale)}
              />
              {property.bedrooms !== null && (
                <Fact
                  icon={<BedIcon size={16} />}
                  label={
                    property.property_type === "hotel"
                      ? t.detail.keys
                      : t.detail.bedrooms
                  }
                  value={formatNumber(property.bedrooms, locale)}
                />
              )}
              {property.bathrooms !== null && (
                <Fact
                  icon={<BathIcon size={16} />}
                  label={t.detail.bathrooms}
                  value={formatNumber(property.bathrooms, locale)}
                />
              )}
              {property.year_built !== null && (
                <Fact
                  icon={<CalendarIcon size={16} />}
                  label={t.detail.yearBuilt}
                  value={formatNumber(property.year_built, locale)}
                />
              )}
            </dl>
          </Reveal>
        </div>

        {/* --- Body --------------------------------------------------------- */}
        <div className="shell grid gap-14 py-16 lg:grid-cols-12 lg:gap-x-16 lg:py-24">
          {/* `min-w-0`: grid items default to an automatic minimum of their
              min-content width, so one stubborn child (here the map frame)
              can widen the whole column past its track. */}
          <div className="min-w-0 space-y-16 lg:col-span-7">
            <Reveal>
              <section aria-labelledby="description-heading">
                <h2 id="description-heading" className="font-display text-[1.75rem] text-ink">
                  {t.detail.aboutThisProperty}
                </h2>
                <p className="mt-3 font-display text-xl leading-snug text-gold-deep">
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
                    {t.detail.features}
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

            {/* Anchored: the home page's tour band links straight here. */}
            <Reveal>
              <div id="location" className="scroll-mt-[calc(var(--nav-h)+1.5rem)]">
                <LocationMap property={property} locale={locale} t={t} />
              </div>
            </Reveal>
          </div>

          {/* The rail carries only the investment read-out. The enquiry form
              lives in its own band below, which keeps this column short enough
              for `sticky` to have somewhere to travel — and gives the form the
              width it deserves. */}
          <aside className="min-w-0 lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
              <InvestmentPanel property={property} locale={locale} t={t} />

              <a href="#enquire" className="btn btn-outline group mt-5 w-full">
                {t.common.requestInvestmentDetails}
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
              <p className="eyebrow !text-gold-soft">{t.detail.nextStep}</p>
              <h2 id="enquiry-heading" className="mt-5 display-md text-paper">
                {t.detail.requestPackLineOne}
                <br />
                <span className="text-gold-soft">
                  {t.detail.requestPackLineTwo}
                </span>
              </h2>
              <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-paper/60">
                {fill(t.detail.requestPackLead, { title: property.title })}
              </p>
              <dl className="mt-10 space-y-4 text-sm">
                <div className="flex items-baseline justify-between gap-6 border-t border-paper/12 pt-4">
                  <dt className="text-paper/40">{t.detail.reference}</dt>
                  <dd className="font-mono text-xs text-paper/75" dir="ltr">
                    {property.slug}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-6 border-t border-paper/12 pt-4">
                  <dt className="text-paper/40">{t.detail.responseTime}</dt>
                  <dd className="text-paper/75">{t.detail.oneBusinessDay}</dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-7">
              <InquiryForm
                propertyId={property.id}
                propertyTitle={property.title}
                locale={locale}
                t={t}
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
                eyebrow={t.detail.comparableAssets}
                title={
                  <>
                    {t.detail.othersIn}{" "}
                    <span className="text-gold-deep">
                      {t.enums.propertyTypePlural[property.property_type]}
                    </span>
                  </>
                }
                link={{
                  href: localePath(
                    locale,
                    `/${property.property_type === "land" ? "land" : `${property.property_type}s`}`,
                  ),
                  label: t.common.viewCategory,
                }}
              />
              <div className="mt-14">
                <PropertyGrid properties={related} locale={locale} t={t} />
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
      <dd className="mt-3 font-display text-[1.75rem] leading-none text-ink tabular-nums">
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
function StructuredData({
  property,
  locale,
}: {
  property: LocalizedProperty;
  locale: Locale;
}) {
  const json = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.tagline,
    inLanguage: locale,
    url: `${SITE.url}${localePath(locale, `/properties/${property.slug}`)}`,
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
