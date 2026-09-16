import Link from "next/link";

import { LeadRow } from "@/components/admin/LeadRow";
import { store } from "@/lib/store";
import { INQUIRY_STATUSES, INQUIRY_STATUS_LABELS } from "@/lib/types";

export default async function AdminLeadsPage() {
  const inquiries = await store.listInquiries();

  const counts = INQUIRY_STATUSES.map((status) => ({
    status,
    count: inquiries.filter((inquiry) => inquiry.status === status).length,
  }));

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow">Enquiries</p>
        <h1 className="mt-3 font-display text-4xl leading-none text-ink">Leads</h1>

        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
          {counts.map(({ status, count }) => (
            <div key={status} className="flex items-baseline gap-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">
                {INQUIRY_STATUS_LABELS[status]}
              </dt>
              <dd className="font-display text-2xl text-ink">{count}</dd>
            </div>
          ))}
        </dl>
      </header>

      {inquiries.length === 0 ? (
        <p className="border border-dashed border-hairline p-12 text-center text-sm text-muted">
          No enquiries yet. They will appear here the moment a form is
          submitted —{" "}
          <Link href="/contact" className="nav-link text-gold-deep">
            try the contact form
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-hairline border-y border-hairline">
          {inquiries.map((inquiry) => (
            <LeadRow key={inquiry.id} inquiry={inquiry} />
          ))}
        </ul>
      )}
    </div>
  );
}
