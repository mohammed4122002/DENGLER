import Link from "next/link";
import { notFound } from "next/navigation";

import { LeadRow } from "@/components/admin/LeadRow";
import { store } from "@/lib/store";
import { getDictionary, isLocale, localePath, type Locale } from "@/lib/i18n";
import { INQUIRY_STATUSES } from "@/lib/types";

export default async function AdminLeadsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const t = getDictionary(locale);
  const inquiries = await store.listInquiries();

  const counts = INQUIRY_STATUSES.map((status) => ({
    status,
    count: inquiries.filter((inquiry) => inquiry.status === status).length,
  }));

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow">{t.admin.enquiries}</p>
        <h1 className="mt-3 font-display text-4xl leading-none text-ink">
          {t.admin.leads}
        </h1>

        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
          {counts.map(({ status, count }) => (
            <div key={status} className="flex items-baseline gap-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-muted rtl:tracking-normal rtl:normal-case">
                {t.enums.inquiryStatus[status]}
              </dt>
              <dd className="font-display text-2xl text-ink tabular-nums">{count}</dd>
            </div>
          ))}
        </dl>
      </header>

      {inquiries.length === 0 ? (
        <p className="border border-dashed border-hairline p-12 text-center text-sm text-muted">
          {t.admin.noEnquiries}{" "}
          <Link
            href={localePath(locale, "/contact")}
            className="nav-link text-gold-deep"
          >
            {t.contactPage.sendEnquiry}
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-hairline border-y border-hairline">
          {inquiries.map((inquiry) => (
            <LeadRow key={inquiry.id} inquiry={inquiry} locale={locale} t={t} />
          ))}
        </ul>
      )}
    </div>
  );
}
