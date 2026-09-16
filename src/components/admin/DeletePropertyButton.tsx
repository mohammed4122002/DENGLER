"use client";

import { useState, useTransition } from "react";

import { deleteProperty } from "@/app/actions/admin";

/**
 * Two-step delete. The first click arms it, the second commits — a listing is
 * not something to lose to a stray click, and there is no undo.
 */
export function DeletePropertyButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [armed, setArmed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="nav-link text-xs uppercase tracking-[0.16em] text-muted transition-colors hover:text-plum"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="flex items-center gap-3 text-xs">
      <span className="text-plum">Delete “{title}” permanently?</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() => {
            void deleteProperty(id);
          })
        }
        className="rounded-full border border-plum px-3 py-1.5 uppercase tracking-[0.14em] text-plum transition-colors hover:bg-plum hover:text-paper disabled:opacity-50"
      >
        {isPending ? "Deleting…" : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="nav-link uppercase tracking-[0.14em] text-muted hover:text-ink"
      >
        Cancel
      </button>
    </span>
  );
}
