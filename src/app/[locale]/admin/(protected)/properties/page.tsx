import Link from "next/link";
import { notFound } from "next/navigation";

import { PropertyRowActions } from "@/components/admin/PropertyRowActions";
import { SmartImage } from "@/components/site/SmartImage";
import { formatDate, formatPriceCompact } from "@/lib/format";
import { store } from "@/lib/store";
import { getDictionary, isLocale, localePath, type Locale } from "@/lib/i18n";

export default async function AdminPropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const t = getDictionary(locale);
  const properties = await store.listProperties(
    { status: "all", sort: "newest" },
    locale,
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">{t.admin.inventory}</p>
          <h1 className="mt-3 font-display text-4xl leading-none text-ink">
            {t.admin.properties}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {properties.length} {t.admin.total} ·{" "}
            {properties.filter((p) => p.published).length} {t.admin.publishedCount}
          </p>
        </div>
        <Link
          href={localePath(locale, "/admin/properties/new")}
          className="btn btn-solid !py-3 !px-6"
        >
          {t.admin.addProperty}
        </Link>
      </header>

      <ul className="divide-y divide-hairline border-y border-hairline">
        {properties.map((property) => (
          <li
            key={property.id}
            className="flex flex-wrap items-center gap-x-6 gap-y-4 py-5"
          >
            <div className="relative h-16 w-24 shrink-0 overflow-hidden bg-cream">
              {property.cover_image && (
                <SmartImage
                  src={property.cover_image}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="min-w-[14rem] flex-1">
              <Link
                href={localePath(locale, `/admin/properties/${property.id}`)}
                className="nav-link font-display text-xl text-ink hover:text-gold-deep"
              >
                {property.title}
              </Link>
              <p className="mt-1 text-xs text-muted">
                {t.enums.propertyType[property.property_type]} · {property.location} ·{" "}
                {t.enums.status[property.status]}
              </p>
              <p className="mt-1 text-[11px] text-muted/70">
                <span dir="ltr">/properties/{property.slug}</span> ·{" "}
                {t.admin.updated} {formatDate(property.updated_at, locale)}
              </p>
            </div>

            <p className="w-28 shrink-0 text-end font-display text-xl text-ink tabular-nums">
              {formatPriceCompact(property.price, property.currency, locale)}
            </p>

            <PropertyRowActions
              id={property.id}
              slug={property.slug}
              published={property.published}
              featured={property.featured}
              locale={locale}
              t={t}
            />
          </li>
        ))}
      </ul>

      {properties.length === 0 && (
        <p className="border border-dashed border-hairline p-10 text-center text-sm text-muted">
          {t.admin.noProperties}
        </p>
      )}
    </div>
  );
}
