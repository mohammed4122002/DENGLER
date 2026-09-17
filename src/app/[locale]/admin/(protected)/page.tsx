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
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">{t.admin.overview}</p>
          <h1 className="mt-1.5 font-display text-[1.75rem] font-bold leading-none text-ink">
            {t.admin.today}
          </h1>
        </div>
        <Link
          href={localePath(locale, "/admin/properties/new")}
          className="btn btn-gold"
        >
          {t.admin.addProperty}
        </Link>
      </header>

      {/* Separate cards rather than one bordered block split by `gap-px`.
          The old grid drew its dividers with the container's background
          showing through a one-pixel gap, which meant the tiles could not
          take a radius or a shadow without the seams reappearing. */}
      <section aria-label={t.admin.overview}>
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {tiles.map((tile) => (
            <Link key={tile.label} href={tile.href} className="card card-hover group p-5">
              <dt className="eyebrow">{tile.label}</dt>
              <dd className="mt-2.5 font-display text-[1.75rem] font-extrabold leading-none text-ink tabular-nums transition-colors group-hover:text-gold-deep">
                {tile.value}
              </dd>
            </Link>
          ))}
        </dl>
      </section>

      <Panel
        id="recent-leads"
        title={t.admin.recentLeads}
        link={{ href: localePath(locale, "/admin/leads"), label: t.admin.allLeads }}
      >
        {inquiries.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">{t.admin.noEnquiries}</p>
        ) : (
          <ul className="divide-y divide-hairline">
            {inquiries.slice(0, 5).map((inquiry) => (
              <li
                key={inquiry.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors duration-200 hover:bg-cream/60"
              >
                <span className="font-semibold text-ink">{inquiry.name}</span>
                <span className="text-[0.8125rem] text-muted">{inquiry.email}</span>
                <span className="text-xs text-muted">
                  {inquiry.property_title ?? t.admin.generalEnquiry}
                </span>
                <span className="ms-auto flex items-center gap-3 text-xs text-muted">
                  <StatusPill status={inquiry.status} t={t} />
                  {formatDate(inquiry.created_at, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        id="recent-properties"
        title={t.admin.recentlyAdded}
        link={{
          href: localePath(locale, "/admin/properties"),
          label: t.admin.allProperties,
        }}
      >
        <ul className="divide-y divide-hairline">
          {properties.slice(0, 5).map((property) => (
            <li
              key={property.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors duration-200 hover:bg-cream/60"
            >
              <Link
                href={localePath(locale, `/admin/properties/${property.id}`)}
                className="font-semibold text-ink transition-colors hover:text-gold-deep"
              >
                {property.title}
              </Link>
              <span className="text-xs uppercase tracking-[0.14em] text-muted rtl:tracking-normal rtl:normal-case">
                {t.enums.propertyType[property.property_type]}
              </span>
              <span className="ms-auto flex items-center gap-3 text-xs text-muted">
                {!property.published && (
                  <span className="badge bg-cream-deep text-graphite">
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
      </Panel>
    </div>
  );
}

/** A titled white card with a trailing link — the dashboard's only container. */
function Panel({
  id,
  title,
  link,
  children,
}: {
  id: string;
  title: string;
  link: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-4">
        <h2 id={id} className="font-display text-[1.0625rem] font-bold text-ink">
          {title}
        </h2>
        <Link
          href={link.href}
          className="group inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-gold-deep transition-colors hover:text-ink"
        >
          {link.label}
          <ArrowIcon
            size={14}
            className="rtl-flip transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
          />
        </Link>
      </div>
      {children}
    </section>
  );
}

function StatusPill({ status, t }: { status: InquiryStatus; t: Dictionary }) {
  const tone =
    status === "new"
      ? "bg-gold/18 text-gold-deep"
      : status === "contacted"
        ? "bg-ink/10 text-ink"
        : "bg-cream-deep text-graphite";

  return (
    <span className={`badge ${tone}`}>{t.enums.inquiryStatus[status]}</span>
  );
}
