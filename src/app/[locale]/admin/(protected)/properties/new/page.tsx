import Link from "next/link";
import { notFound } from "next/navigation";

import { PropertyForm } from "@/components/admin/PropertyForm";
import { getDictionary, isLocale, localePath, type Locale } from "@/lib/i18n";

export default async function NewPropertyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const t = getDictionary(locale);

  return (
    <div className="max-w-4xl space-y-10">
      <header>
        <Link
          href={localePath(locale, "/admin/properties")}
          className="nav-link text-xs uppercase tracking-[0.16em] text-muted hover:text-gold rtl:tracking-normal rtl:normal-case"
        >
          <span className="rtl-flip inline-block">←</span> {t.admin.properties}
        </Link>
        <h1 className="mt-5 font-display text-4xl leading-none text-ink">
          {t.admin.newProperty}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          {t.admin.newPropertyLead}
        </p>
      </header>

      <PropertyForm locale={locale} t={t} />
    </div>
  );
}
