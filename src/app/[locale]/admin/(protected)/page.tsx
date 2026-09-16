import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowIcon } from "@/components/ui/Icons";
import { formatDate, formatPriceCompact } from "@/lib/format";
import { store } from "@/lib/store";
import {
  getDictionary,
  isLocale,
  localePath,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";
import type { InquiryStatus } from "@/lib/types";

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const t = getDictionary(locale);

  const [properties, inquiries] = await Promise.all([
    // `status: "all"` is the signal to include unpublished rows.
    store.listProperties({ status: "all", sort: "newest" }, locale),
    store.listInquiries(),
  ]);

  const published = properties.filter((p) => p.published);
  const drafts = properties.length - published.length;
  const newLeads = inquiries.filter((i) => i.status === "new").length;
  const portfolioValue = published.reduce((total, p) => total + p.price, 0);

  const tiles = [
    {
      label: t.admin.published,
      value: String(published.length),
      href: localePath(locale, "/admin/properties"),
    },
    {
      label: t.admin.drafts,
      value: String(drafts),
      href: localePath(locale, "/admin/properties"),
    },
    {
      label: t.admin.newLeads,
      value: String(newLeads),
      href: localePath(locale, "/admin/leads"),
    },
    {
      label: t.admin.publishedValue,
      value: formatPriceCompact(portfolioValue, "USD", locale),
      href: localePath(locale, "/admin/properties"),
    },
  ];

  return (
    <div className="space-y-14">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">{t.admin.overview}</p>
          <h1 className="mt-3 font-display text-4xl leading-none text-ink">
            {t.admin.today}
          </h1>
        </div>
        <Link
          href={localePath(locale, "/admin/properties/new")}
          className="btn btn-solid !py-3 !px-6"
        >
          {t.admin.addProperty}
        </Link>
      </header>

      <section aria-label={t.admin.overview}>
        <dl className="grid grid-cols-2 gap-px overflow-hidden border border-hairline bg-hairline lg:grid-cols-4">
          {tiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="group bg-paper p-6 transition-colors duration-300 hover:bg-cream/50"
            >
              <dt className="eyebrow">{tile.label}</dt>
              <dd className="mt-3 font-display text-4xl leading-none text-ink tabular-nums transition-colors group-hover:text-gold-deep">
                {tile.value}
              </dd>
            </Link>
          ))}
        </dl>
      </section>

      <section aria-labelledby="recent-leads">
        <div className="flex items-end justify-between gap-4">
          <h2 id="recent-leads" className="font-display text-2xl text-ink">
            {t.admin.recentLeads}
          </h2>
          <Link
            href={localePath(locale, "/admin/leads")}
            className="nav-link inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-graphite hover:text-gold rtl:tracking-normal rtl:normal-case"
          >
            {t.admin.allLeads} <ArrowIcon size={14} />
          </Link>
        </div>

        {inquiries.length === 0 ? (
          <p className="mt-6 border border-dashed border-hairline p-8 text-sm text-muted">
            {t.admin.noEnquiries}
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
            {inquiries.slice(0, 5).map((inquiry) => (
              <li key={inquiry.id} className="flex flex-wrap items-baseline gap-x-5 gap-y-1 py-4">
                <span className="font-display text-lg text-ink">{inquiry.name}</span>
                <span className="text-sm text-muted">{inquiry.email}</span>
                <span className="text-xs text-muted">
                  {inquiry.property_title ?? t.admin.generalEnquiry}
                </span>
                <span className="ms-auto flex items-center gap-4 text-xs text-muted">
                  <StatusPill status={inquiry.status} t={t} />
                  {formatDate(inquiry.created_at, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="recent-properties">
        <div className="flex items-end justify-between gap-4">
          <h2 id="recent-properties" className="font-display text-2xl text-ink">
            {t.admin.recentlyAdded}
          </h2>
          <Link
            href={localePath(locale, "/admin/properties")}
            className="nav-link inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-graphite hover:text-gold rtl:tracking-normal rtl:normal-case"
          >
            {t.admin.allProperties} <ArrowIcon size={14} />
          </Link>
        </div>

        <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
          {properties.slice(0, 5).map((property) => (
            <li key={property.id} className="flex flex-wrap items-baseline gap-x-5 gap-y-1 py-4">
              <Link
                href={localePath(locale, `/admin/properties/${property.id}`)}
                className="nav-link font-display text-lg text-ink hover:text-gold-deep"
              >
                {property.title}
              </Link>
              <span className="text-xs uppercase tracking-[0.14em] text-muted rtl:tracking-normal rtl:normal-case">
                {t.enums.propertyType[property.property_type]}
              </span>
              <span className="ms-auto flex items-center gap-4 text-xs text-muted">
                {!property.published && (
                  <span className="rounded-full bg-ink/8 px-2.5 py-0.5 text-graphite">
                    {t.admin.draft}
                  </span>
                )}
                <span className="tabular-nums">
                  {formatPriceCompact(property.price, property.currency, locale)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatusPill({ status, t }: { status: InquiryStatus; t: Dictionary }) {
  const tone =
    status === "new"
      ? "bg-gold/15 text-gold-deep"
      : status === "contacted"
        ? "bg-plum/10 text-plum"
        : "bg-ink/8 text-graphite";

  return (
    <span className={`rounded-full px-2.5 py-0.5 ${tone}`}>
      {t.enums.inquiryStatus[status]}
    </span>
  );
}
