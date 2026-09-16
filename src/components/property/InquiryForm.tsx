"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { submitInquiry, type InquiryState } from "@/app/actions/inquiries";
import { ArrowIcon } from "@/components/ui/Icons";

const INITIAL: InquiryState = { status: "idle" };

/**
 * Used both on the property detail page (with a propertyId, so the lead lands
 * in the dashboard attached to the asset) and standalone on /contact.
 */
export function InquiryForm({
  propertyId,
  propertyTitle,
  submitLabel = "Request Investment Details",
  tone = "dark",
}: {
  propertyId?: string;
  propertyTitle?: string;
  submitLabel?: string;
  tone?: "dark" | "light";
}) {
  const [state, formAction] = useActionState(submitInquiry, INITIAL);
  const isLight = tone === "light";

  if (state.status === "success") {
    return (
      <div
        className={`border p-8 ${
          isLight ? "border-paper/20 text-paper" : "border-gold/35 bg-cream/40 text-ink"
        }`}
        role="status"
      >
        <p className="font-display text-2xl">Enquiry received.</p>
        <p className={`mt-3 text-sm leading-relaxed ${isLight ? "text-paper/60" : "text-muted"}`}>
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {propertyId && <input type="hidden" name="propertyId" value={propertyId} />}

      {/* Honeypot — visually and programmatically hidden from real users. */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          name="name"
          label="Name"
          autoComplete="name"
          required
          error={state.fieldErrors?.name}
          tone={tone}
        />
        <TextField
          name="phone"
          label="Phone"
          type="tel"
          autoComplete="tel"
          error={state.fieldErrors?.phone}
          tone={tone}
        />
      </div>

      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
        tone={tone}
      />

      <TextField
        name="message"
        label="Message"
        multiline
        required
        defaultValue={
          propertyTitle
            ? `I would like the full investment pack for ${propertyTitle}.`
            : undefined
        }
        error={state.fieldErrors?.message}
        tone={tone}
      />

      {state.status === "error" && state.message && (
        <p className="text-sm text-plum" role="alert">
          {state.message}
        </p>
      )}

      <SubmitButton label={submitLabel} tone={tone} />

      <p className={`text-xs leading-relaxed ${isLight ? "text-paper/40" : "text-muted"}`}>
        We use your details only to answer this enquiry. Nothing is shared with a
        third party.
      </p>
    </form>
  );
}

function SubmitButton({ label, tone }: { label: string; tone: "dark" | "light" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`btn group w-full ${
        tone === "light" ? "btn-ghost-light" : "btn-solid"
      } disabled:cursor-wait disabled:opacity-60`}
    >
      {pending ? "Sending…" : label}
      {!pending && (
        <ArrowIcon
          size={15}
          className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
        />
      )}
    </button>
  );
}

function TextField({
  name,
  label,
  type = "text",
  multiline = false,
  required = false,
  autoComplete,
  defaultValue,
  error,
  tone,
}: {
  name: string;
  label: string;
  type?: string;
  multiline?: boolean;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  tone: "dark" | "light";
}) {
  const isLight = tone === "light";
  const describedBy = error ? `${name}-error` : undefined;

  const className = `field ${
    isLight
      ? "!border-paper/25 !text-paper placeholder:!text-paper/35 focus:!border-gold-soft"
      : ""
  } ${error ? "!border-plum" : ""}`;

  return (
    <div>
      <label
        htmlFor={name}
        className={`eyebrow block ${isLight ? "!text-paper/45" : ""}`}
      >
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>

      {multiline ? (
        <textarea
          id={name}
          name={name}
          rows={4}
          required={required}
          defaultValue={defaultValue}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`${className} mt-1 resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`${className} mt-1`}
        />
      )}

      {error && (
        <p id={describedBy} className="mt-2 text-xs text-plum" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
