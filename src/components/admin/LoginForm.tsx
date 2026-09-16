"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signIn, type ActionState } from "@/app/actions/admin";

const INITIAL: ActionState = { status: "idle" };

export function LoginForm({ withEmail }: { withEmail: boolean }) {
  const [state, formAction] = useActionState(signIn, INITIAL);

  return (
    <form action={formAction} className="space-y-6">
      {withEmail && (
        <label className="block">
          <span className="eyebrow block">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            className="field mt-1"
          />
        </label>
      )}

      <label className="block">
        <span className="eyebrow block">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field mt-1"
        />
      </label>

      {state.status === "error" && (
        <p className="text-sm text-plum" role="alert">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-solid w-full disabled:opacity-60"
    >
      {pending ? "Checking…" : "Sign in"}
    </button>
  );
}
