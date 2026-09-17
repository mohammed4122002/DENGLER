"use client";

import { useState, useTransition } from "react";

import { deleteProperty } from "@/app/actions/admin";
import { fill, type Dictionary, type Locale } from "@/lib/i18n";

/**
 * Two-step delete. The first click arms it, the second commits — a listing is
 * not something to lose to a stray click, and there is no undo.
 */
export function DeletePropertyButton({
  id,
  title,
  locale,
  t,
}: {
  id: string;
  title: string;
  locale: Locale;
  t: Dictionary;
}) {
  const [armed, setArmed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="text-xs font-semibold text-muted transition-colors hover:text-plum rtl:tracking-normal rtl:normal-case"
      >
        {t.admin.delete}
      </button>
    );
  }

  return (
    <span className="flex items-center gap-3 text-xs">
      <span className="text-plum">{fill(t.admin.deleteConfirm, { title })}</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() => {
            void deleteProperty(id, locale);
          })
        }
        className="rounded-full border border-plum px-3 py-1.5 uppercase tracking-[0.14em] text-plum transition-colors hover:bg-plum hover:text-paper disabled:opacity-50 rtl:tracking-normal rtl:normal-case"
      >
        {isPending ? t.admin.deleting : t.admin.confirm}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="font-semibold text-muted hover:text-ink rtl:tracking-normal rtl:normal-case"
      >
        {t.admin.cancel}
      </button>
    </span>
  );
}
