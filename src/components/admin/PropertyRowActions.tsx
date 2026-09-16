"use client";

import Link from "next/link";
import { useTransition } from "react";

import { toggleFeatured, togglePublished } from "@/app/actions/admin";

/**
 * Inline publish / feature toggles. Each one is an optimistic-free transition:
 * the row stays interactive but dims while the server action runs, which is
 * honest about the fact that the change isn't applied until it returns.
 */
export function PropertyRowActions({
  id,
  slug,
  published,
  featured,
}: {
  id: string;
  slug: string;
  published: boolean;
  featured: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={`flex shrink-0 items-center gap-2 transition-opacity ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <Toggle
        active={published}
        activeLabel="Published"
        inactiveLabel="Draft"
        disabled={isPending}
        onToggle={() =>
          startTransition(() => {
            void togglePublished(id, !published);
          })
        }
      />

      <Toggle
        active={featured}
        activeLabel="Featured"
        inactiveLabel="Feature"
        disabled={isPending}
        onToggle={() =>
          startTransition(() => {
            void toggleFeatured(id, !featured);
          })
        }
      />

      <Link
        href={`/admin/properties/${id}`}
        className="rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-graphite transition-colors hover:border-gold hover:text-gold"
      >
        Edit
      </Link>

      {published && (
        <Link
          href={`/properties/${slug}`}
          target="_blank"
          className="rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:border-gold hover:text-gold"
        >
          View
        </Link>
      )}
    </div>
  );
}

function Toggle({
  active,
  activeLabel,
  inactiveLabel,
  disabled,
  onToggle,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors disabled:cursor-wait ${
        active
          ? "border-gold bg-gold/12 text-gold-deep"
          : "border-hairline text-muted hover:border-gold hover:text-gold"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}
