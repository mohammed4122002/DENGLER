import { isDemoMode } from "@/lib/store";

/**
 * Marks illustrative figures as what they are.
 *
 * The brief is explicit that projected returns must never be presented as
 * verified fact while the catalogue is demo content — so every ROI, revenue
 * and occupancy figure in the UI sits next to one of these.
 */
export function DemoBadge({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  if (!isDemoMode) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-plum/25 bg-plum/[0.06] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-plum rtl:tracking-normal rtl:normal-case ${className}`}
    >
      <span className="h-1 w-1 rounded-full bg-plum" aria-hidden />
      {label}
    </span>
  );
}

/** The long-form version, for the investment panel on the detail page. */
export function DemoDisclaimer({
  lead,
  body,
  className = "",
}: {
  lead: string;
  body: string;
  className?: string;
}) {
  if (!isDemoMode) return null;

  return (
    <p className={`text-xs leading-relaxed text-muted ${className}`}>
      <strong className="font-medium text-plum">{lead}</strong> {body}
    </p>
  );
}
