"use client";

import { useState, useTransition } from "react";

import { deleteInquiry, setInquiryStatus } from "@/app/actions/admin";
import { formatDate } from "@/lib/format";
import {
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  type Inquiry,
} from "@/lib/types";

export function LeadRow({ inquiry }: { inquiry: Inquiry }) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <li className={`py-5 transition-opacity ${isPending ? "opacity-50" : ""}`}>
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
        <div className="min-w-[13rem] flex-1">
          <p className="font-display text-xl text-ink">{inquiry.name}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <a href={`mailto:${inquiry.email}`} className="nav-link hover:text-gold">
              {inquiry.email}
            </a>
            {inquiry.phone && (
              <a
                href={`tel:${inquiry.phone.replace(/\s/g, "")}`}
                className="nav-link hover:text-gold"
              >
                {inquiry.phone}
              </a>
            )}
          </p>
          <p className="mt-1.5 text-xs text-graphite">
            {inquiry.property_title ?? "General enquiry"}
          </p>
        </div>

        <p className="w-24 shrink-0 text-xs text-muted">
          {formatDate(inquiry.created_at)}
        </p>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {INQUIRY_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              disabled={isPending}
              aria-pressed={inquiry.status === status}
              onClick={() =>
                startTransition(() => {
                  void setInquiryStatus(inquiry.id, status);
                })
              }
              className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors disabled:cursor-wait ${
                inquiry.status === status
                  ? "border-gold bg-gold/12 text-gold-deep"
                  : "border-hairline text-muted hover:border-gold hover:text-gold"
              }`}
            >
              {INQUIRY_STATUS_LABELS[status]}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            className="rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-graphite transition-colors hover:border-gold hover:text-gold"
          >
            {expanded ? "Hide" : "Message"}
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (!confirm(`Delete the enquiry from ${inquiry.name}?`)) return;
              startTransition(() => {
                void deleteInquiry(inquiry.id);
              });
            }}
            aria-label={`Delete enquiry from ${inquiry.name}`}
            className="rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:border-plum hover:text-plum"
          >
            Delete
          </button>
        </div>
      </div>

      {expanded && (
        <p className="mt-5 max-w-3xl whitespace-pre-line border-s-2 border-gold/40 bg-cream/40 p-5 text-sm leading-relaxed text-graphite">
          {inquiry.message}
        </p>
      )}
    </li>
  );
}
