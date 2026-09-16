import Link from "next/link";
import { notFound } from "next/navigation";

import { DeletePropertyButton } from "@/components/admin/DeletePropertyButton";
import { ImageManager } from "@/components/admin/ImageManager";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { formatDate } from "@/lib/format";
import { store } from "@/lib/store";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await store.getPropertyById(id);

  if (!property) notFound();

  return (
    <div className="max-w-4xl space-y-12">
      <header>
        <Link
          href="/admin/properties"
          className="nav-link text-xs uppercase tracking-[0.16em] text-muted hover:text-gold"
        >
          ← Properties
        </Link>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="font-display text-4xl leading-none text-ink">
              {property.title}
            </h1>
            <p className="mt-3 text-xs text-muted">
              {property.published ? "Published" : "Draft"} · updated{" "}
              {formatDate(property.updated_at)}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {property.published && (
              <Link
                href={`/properties/${property.slug}`}
                target="_blank"
                className="nav-link text-xs uppercase tracking-[0.16em] text-graphite hover:text-gold"
              >
                View live
              </Link>
            )}
            <DeletePropertyButton id={property.id} title={property.title} />
          </div>
        </div>
      </header>

      <ImageManager property={property} />

      <PropertyForm property={property} />
    </div>
  );
}
