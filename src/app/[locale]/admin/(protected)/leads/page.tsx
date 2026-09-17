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
    <div className="space-y-6">
      <header>
        <p className="eyebrow">{t.admin.enquiries}</p>
        <h1 className="mt-1.5 font-display text-[1.75rem] font-bold leading-none text-ink">
          {t.admin.leads}
        </h1>

        <dl className="mt-5 grid grid-cols-3 gap-4">
          {counts.map(({ status, count }) => (
            <div key={status} className="card p-4">
              <dt className="eyebrow">{t.enums.inquiryStatus[status]}</dt>
              <dd className="mt-2 font-display text-[1.5rem] font-extrabold leading-none text-ink tabular-nums">
                {count}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {inquiries.length === 0 ? (
        <p className="card p-12 text-center text-sm text-muted">
          {t.admin.noEnquiries}{" "}
          <Link
            href={localePath(locale, "/contact")}
            className="font-semibold text-gold-deep underline underline-offset-2"
          >
            {t.contactPage.sendEnquiry}
          </Link>
        </p>
      ) : (
        <ul className="card divide-y divide-hairline overflow-hidden">
          {inquiries.map((inquiry) => (
            <LeadRow key={inquiry.id} inquiry={inquiry} locale={locale} t={t} />
          ))}
        </ul>
      )}
    </div>
  );
}
