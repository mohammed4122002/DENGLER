import Link from "next/link";
import { notFound } from "next/navigation";

import { DeletePropertyButton } from "@/components/admin/DeletePropertyButton";
import { ImageManager } from "@/components/admin/ImageManager";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { formatDate } from "@/lib/format";
import { store } from "@/lib/store";
import { getDictionary, isLocale, localePath, type Locale } from "@/lib/i18n";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const t = getDictionary(locale);

  // Raw record, not localised: this form edits both languages.
  const property = await store.getPropertyById(id);
  if (!property) notFound();

  return (
    <div className="max-w-4xl space-y-12">
      <header>
        <Link
          href={localePath(locale, "/admin/properties")}
          className="nav-link text-xs uppercase tracking-[0.16em] text-muted hover:text-gold rtl:tracking-normal rtl:normal-case"
        >
          <span className="rtl-flip inline-block">←</span> {t.admin.properties}
        </Link>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="font-display text-4xl leading-none text-ink">
              {property.title}
            </h1>
            <p className="mt-3 text-xs text-muted">
              {property.published ? t.admin.published : t.admin.draft} ·{" "}
              {t.admin.updated} {formatDate(property.updated_at, locale)}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {property.published && (
              <Link
                href={localePath(locale, `/properties/${property.slug}`)}
                target="_blank"
                className="nav-link text-xs uppercase tracking-[0.16em] text-graphite hover:text-gold rtl:tracking-normal rtl:normal-case"
              >
                {t.admin.viewLive}
              </Link>
            )}
            <DeletePropertyButton
              id={property.id}
              title={property.title}
              locale={locale}
              t={t}
            />
          </div>
        </div>
      </header>

      <ImageManager property={property} t={t} />

      <PropertyForm property={property} locale={locale} t={t} />
    </div>
  );
}
