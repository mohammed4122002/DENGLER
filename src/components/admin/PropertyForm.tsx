"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveProperty, type ActionState } from "@/app/actions/admin";
import { slugify } from "@/lib/format";
import {
  INVESTMENT_TYPES,
  INVESTMENT_TYPE_LABELS,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  STATUS_LABELS,
  type Property,
} from "@/lib/types";

const INITIAL: ActionState = { status: "idle" };

/**
 * One form for create and edit. On edit it carries a hidden `id`; the action
 * branches on that rather than on two near-identical code paths.
 *
 * Gallery and features are line-per-entry textareas. That is deliberately
 * low-tech: it round-trips cleanly, it is keyboard-native, and it lets an
 * editor paste twenty URLs at once. Reordering and deletion get a richer UI
 * on the edit page once the property exists.
 */
export function PropertyForm({ property }: { property?: Property }) {
  const [state, formAction] = useActionState(saveProperty, INITIAL);
  const [title, setTitle] = useState(property?.title ?? "");
  const [slug, setSlug] = useState(property?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(property));

  const effectiveSlug = slugTouched ? slug : slugify(title);

  return (
    <form action={formAction} className="space-y-12">
      {property && <input type="hidden" name="id" value={property.id} />}

      {/* --- Identity ----------------------------------------------------- */}
      <Fieldset legend="Identity">
        <Row>
          <Text
            name="title"
            label="Title"
            required
            value={title}
            onChange={setTitle}
          />
          <Text
            name="slug"
            label="URL slug"
            value={effectiveSlug}
            onChange={(value) => {
              setSlugTouched(true);
              setSlug(value);
            }}
            hint={`/properties/${effectiveSlug || "…"}`}
          />
        </Row>

        <Text
          name="tagline"
          label="Tagline"
          defaultValue={property?.tagline}
          hint="One editorial line. Used on cards and in the meta description."
        />

        <Textarea
          name="description"
          label="Description"
          rows={8}
          defaultValue={property?.description}
        />
      </Fieldset>

      {/* --- Classification ------------------------------------------------ */}
      <Fieldset legend="Classification">
        <Row cols={3}>
          <Select
            name="property_type"
            label="Type"
            defaultValue={property?.property_type ?? "villa"}
            options={PROPERTY_TYPES.map((value) => ({
              value,
              label: PROPERTY_TYPE_LABELS[value],
            }))}
          />
          <Select
            name="status"
            label="Availability"
            defaultValue={property?.status ?? "available"}
            options={PROPERTY_STATUSES.map((value) => ({
              value,
              label: STATUS_LABELS[value],
            }))}
          />
          <Select
            name="investment_type"
            label="Investment strategy"
            defaultValue={property?.investment_type ?? "buy_to_hold"}
            options={INVESTMENT_TYPES.map((value) => ({
              value,
              label: INVESTMENT_TYPE_LABELS[value],
            }))}
          />
        </Row>

        <div className="flex flex-wrap gap-8">
          <Checkbox
            name="published"
            label="Published"
            defaultChecked={property?.published ?? false}
            hint="Visible on the public site and in the sitemap."
          />
          <Checkbox
            name="featured"
            label="Featured"
            defaultChecked={property?.featured ?? false}
            hint="Appears in the featured row on the home page."
          />
        </div>
      </Fieldset>

      {/* --- Location ------------------------------------------------------ */}
      <Fieldset legend="Location">
        <Row>
          <Text name="location" label="Display location" required defaultValue={property?.location} />
          <Text name="city" label="City" required defaultValue={property?.city} />
        </Row>
        <Row cols={3}>
          <Text name="country" label="Country" required defaultValue={property?.country} />
          <Text
            name="latitude"
            label="Latitude"
            type="number"
            step="any"
            defaultValue={property?.latitude ?? undefined}
          />
          <Text
            name="longitude"
            label="Longitude"
            type="number"
            step="any"
            defaultValue={property?.longitude ?? undefined}
          />
        </Row>
      </Fieldset>

      {/* --- Specification -------------------------------------------------- */}
      <Fieldset legend="Specification">
        <Row cols={3}>
          <Text
            name="price"
            label="Price"
            type="number"
            min="0"
            step="any"
            required
            defaultValue={property?.price}
          />
          <Text
            name="currency"
            label="Currency"
            maxLength={3}
            required
            defaultValue={property?.currency ?? "USD"}
            hint="Three-letter ISO code."
          />
          <Text
            name="area"
            label="Area (m²)"
            type="number"
            min="0"
            step="any"
            required
            defaultValue={property?.area}
          />
        </Row>
        <Row cols={3}>
          <Text
            name="bedrooms"
            label="Bedrooms / keys"
            type="number"
            min="0"
            defaultValue={property?.bedrooms ?? undefined}
          />
          <Text
            name="bathrooms"
            label="Bathrooms"
            type="number"
            min="0"
            defaultValue={property?.bathrooms ?? undefined}
          />
          <Text
            name="year_built"
            label="Year built"
            type="number"
            min="1500"
            max="2200"
            defaultValue={property?.year_built ?? undefined}
          />
        </Row>
      </Fieldset>

      {/* --- Investment ----------------------------------------------------- */}
      <Fieldset
        legend="Investment figures"
        note="Leave a field blank where you do not hold the figure. Blank renders as an em dash on the listing; zero would state that the figure is zero."
      >
        <Row cols={4}>
          <Text
            name="roi"
            label="Projected ROI (%)"
            type="number"
            step="any"
            min="0"
            defaultValue={property?.roi ?? undefined}
          />
          <Text
            name="annual_revenue"
            label="Annual revenue"
            type="number"
            min="0"
            step="any"
            defaultValue={property?.annual_revenue ?? undefined}
          />
          <Text
            name="occupancy_rate"
            label="Occupancy (%)"
            type="number"
            step="any"
            min="0"
            max="100"
            defaultValue={property?.occupancy_rate ?? undefined}
          />
          <Text
            name="appreciation"
            label="Appreciation (%)"
            type="number"
            step="any"
            min="0"
            defaultValue={property?.appreciation ?? undefined}
          />
        </Row>
      </Fieldset>

      {/* --- Media ---------------------------------------------------------- */}
      <Fieldset
        legend="Media"
        note="One image URL per line. The first line becomes the cover unless a cover URL is set explicitly."
      >
        <Text
          name="cover_image"
          label="Cover image URL"
          defaultValue={property?.cover_image}
        />
        <Textarea
          name="gallery"
          label="Gallery URLs"
          rows={7}
          defaultValue={property?.images.map((image) => image.image_url).join("\n")}
          mono
        />
      </Fieldset>

      <Fieldset legend="Features" note="One feature per line.">
        <Textarea
          name="features"
          label="Features"
          rows={8}
          defaultValue={property?.features.join("\n")}
        />
      </Fieldset>

      {/* --- Save ----------------------------------------------------------- */}
      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-5 border-t border-hairline bg-paper/95 px-5 py-5 backdrop-blur-lg">
        <SaveButton isEdit={Boolean(property)} />

        <Link
          href="/admin/properties"
          className="nav-link text-xs uppercase tracking-[0.16em] text-muted hover:text-gold"
        >
          Back to list
        </Link>

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

function SaveButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-solid !py-3 !px-7 disabled:opacity-60"
    >
      {pending ? "Saving…" : isEdit ? "Save changes" : "Create property"}
    </button>
  );
}

/* ---------------------------- field primitives --------------------------- */

function Fieldset({
  legend,
  note,
  children,
}: {
  legend: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-t border-hairline pt-8">
      <legend className="sr-only">{legend}</legend>
      <p className="eyebrow">{legend}</p>
      {note && <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted">{note}</p>}
      <div className="mt-7 space-y-7">{children}</div>
    </fieldset>
  );
}

function Row({
  children,
  cols = 2,
}: {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
}) {
  const grid =
    cols === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : cols === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2";
  return <div className={`grid gap-x-8 gap-y-7 ${grid}`}>{children}</div>;
}

function Label({
  name,
  label,
  required,
  hint,
}: {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <>
      <label htmlFor={name} className="eyebrow block">
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </>
  );
}

function Text({
  name,
  label,
  type = "text",
  required,
  hint,
  value,
  onChange,
  ...rest
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  hint?: string;
  value?: string;
  onChange?: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "name" | "type">) {
  return (
    <div>
      <Label name={name} label={label} required={required} hint={hint} />
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="field mt-1"
        {...(onChange
          ? { value: value ?? "", onChange: (e) => onChange(e.target.value) }
          : {})}
        {...rest}
      />
    </div>
  );
}

function Textarea({
  name,
  label,
  rows = 5,
  defaultValue,
  mono = false,
}: {
  name: string;
  label: string;
  rows?: number;
  defaultValue?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <Label name={name} label={label} />
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className={`field mt-1 resize-y ${mono ? "font-mono text-xs" : ""}`}
      />
    </div>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <Label name={name} label={label} />
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="field select-luxe mt-1"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
  hint?: string;
}) {
  return (
    <label className="flex max-w-xs cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 accent-[var(--color-gold)]"
      />
      <span>
        <span className="block text-sm text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] leading-snug text-muted">{hint}</span>}
      </span>
    </label>
  );
}
