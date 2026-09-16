import Link from "next/link";

import { PropertyRowActions } from "@/components/admin/PropertyRowActions";
import { SmartImage } from "@/components/site/SmartImage";
import { formatDate, formatPriceCompact } from "@/lib/format";
import { store } from "@/lib/store";
import { PROPERTY_TYPE_LABELS, STATUS_LABELS } from "@/lib/types";

export default async function AdminPropertiesPage() {
  const properties = await store.listProperties({ status: "all", sort: "newest" });

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1 className="mt-3 font-display text-4xl leading-none text-ink">
            Properties
          </h1>
          <p className="mt-3 text-sm text-muted">
            {properties.length} total ·{" "}
            {properties.filter((p) => p.published).length} published
          </p>
        </div>
        <Link href="/admin/properties/new" className="btn btn-solid !py-3 !px-6">
          Add property
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
                href={`/admin/properties/${property.id}`}
                className="nav-link font-display text-xl text-ink hover:text-gold-deep"
              >
                {property.title}
              </Link>
              <p className="mt-1 text-xs text-muted">
                {PROPERTY_TYPE_LABELS[property.property_type]} ·{" "}
                {property.location} · {STATUS_LABELS[property.status]}
              </p>
              <p className="mt-1 text-[11px] text-muted/70">
                /properties/{property.slug} · updated{" "}
                {formatDate(property.updated_at)}
              </p>
            </div>

            <p className="w-28 shrink-0 text-end font-display text-xl text-ink">
              {formatPriceCompact(property.price, property.currency)}
            </p>

            <PropertyRowActions
              id={property.id}
              slug={property.slug}
              published={property.published}
              featured={property.featured}
            />
          </li>
        ))}
      </ul>

      {properties.length === 0 && (
        <p className="border border-dashed border-hairline p-10 text-center text-sm text-muted">
          No properties yet. Add the first one to get started.
        </p>
      )}
    </div>
  );
}
