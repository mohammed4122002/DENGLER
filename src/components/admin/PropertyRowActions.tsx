"use client";

import Link from "next/link";
import { useTransition } from "react";

import { toggleFeatured, togglePublished } from "@/app/actions/admin";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";

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
  locale,
  t,
}: {
  id: string;
  slug: string;
  published: boolean;
  featured: boolean;
  locale: Locale;
  t: Dictionary;
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
        activeLabel={t.admin.published}
        inactiveLabel={t.admin.draft}
        disabled={isPending}
        onToggle={() =>
          startTransition(() => {
            void togglePublished(id, !published);
          })
        }
      />

      <Toggle
        active={featured}
        activeLabel={t.admin.featured}
        inactiveLabel={t.admin.feature}
        disabled={isPending}
        onToggle={() =>
          startTransition(() => {
            void toggleFeatured(id, !featured);
          })
        }
      />

      <Link
        href={localePath(locale, `/admin/properties/${id}`)}
        className="rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-graphite transition-colors hover:border-gold hover:text-gold rtl:tracking-normal rtl:normal-case"
      >
        {t.admin.edit}
      </Link>

      {published && (
        <Link
          href={localePath(locale, `/properties/${slug}`)}
          target="_blank"
          className="rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:border-gold hover:text-gold rtl:tracking-normal rtl:normal-case"
        >
          {t.admin.view}
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
      className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors disabled:cursor-wait rtl:tracking-normal rtl:normal-case ${
        active
          ? "border-gold bg-gold/12 text-gold-deep"
          : "border-hairline text-muted hover:border-gold hover:text-gold"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}
