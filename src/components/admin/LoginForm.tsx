"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signIn, type ActionState } from "@/app/actions/admin";
import type { Dictionary, Locale } from "@/lib/i18n";

const INITIAL: ActionState = { status: "idle" };

export function LoginForm({
  withEmail,
  locale,
  t,
}: {
  withEmail: boolean;
  locale: Locale;
  t: Dictionary;
}) {
  const [state, formAction] = useActionState(signIn, INITIAL);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      {withEmail && (
        <label className="block">
          <span className="eyebrow block">{t.admin.email}</span>
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            dir="ltr"
            className="field mt-1"
          />
        </label>
      )}

      <label className="block">
        <span className="eyebrow block">{t.admin.password}</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          className="field mt-1"
        />
      </label>

      {state.status === "error" && (
        <p className="text-sm text-plum" role="alert">
          {state.message}
        </p>
      )}

      <SubmitButton label={t.admin.signIn} checking={t.admin.checking} />
    </form>
  );
}

function SubmitButton({ label, checking }: { label: string; checking: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-solid w-full disabled:opacity-60"
    >
      {pending ? checking : label}
    </button>
  );
}
