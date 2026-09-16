"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { saveStats, type ActionState } from "@/app/actions/admin";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { SiteStat } from "@/lib/types";

const INITIAL: ActionState = { status: "idle" };

export function StatsForm({
  stats,
  locale,
  t,
}: {
  stats: SiteStat[];
  locale: Locale;
  t: Dictionary;
}) {
  const [state, formAction] = useActionState(saveStats, INITIAL);

  return (
    <form action={formAction} className="space-y-7">
      <input type="hidden" name="locale" value={locale} />
      {stats.map((stat) => (
        <div key={stat.id} className="grid gap-x-8 gap-y-5 sm:grid-cols-[10rem_1fr]">
          <label className="block">
            <span className="eyebrow block">{t.admin.value}</span>
            <input
              name={`value_${stat.id}`}
              defaultValue={stat.value}
              maxLength={40}
              className="field mt-1 font-display text-xl"
            />
          </label>
          <label className="block">
            <span className="eyebrow block">{t.admin.label}</span>
            <input
              name={`label_${stat.id}`}
              defaultValue={stat.label}
              maxLength={80}
              className="field mt-1"
            />
          </label>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-5 border-t border-hairline pt-6">
        <SubmitButton label={t.admin.saveFigures} saving={t.admin.saving} />
        {state.status !== "idle" && state.message && (
          <p
            role="status"
            className={`text-sm ${
              state.status === "error" ? "text-plum" : "text-gold-deep"
            }`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function SubmitButton({ label, saving }: { label: string; saving: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-solid !py-3 !px-7 disabled:opacity-60"
    >
      {pending ? saving : label}
    </button>
  );
}
