"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveProperty, type ActionState } from "@/app/actions/admin";
import { slugify } from "@/lib/format";
import type { Dictionary, Locale } from "@/lib/i18n";
import {
  INVESTMENT_TYPES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
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
export function PropertyForm({
  property,
  locale,
  t,
}: {
  property?: Property;
  locale: Locale;
  t: Dictionary;
}) {
  const f = t.admin.form;
  const [state, formAction] = useActionState(saveProperty, INITIAL);
  const [title, setTitle] = useState(property?.title ?? "");
  const [slug, setSlug] = useState(property?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(property));

  const effectiveSlug = slugTouched ? slug : slugify(title);

  return (
    <form action={formAction} className="space-y-12">
      {property && <input type="hidden" name="id" value={property.id} />}
      <input type="hidden" name="locale" value={locale} />

      {/* --- Identity ----------------------------------------------------- */}
      <Fieldset legend={f.identity}>
        <Row>
          <Text
            name="title"
            label={f.title}
            required
            value={title}
            onChange={setTitle}
            dir="ltr"
          />
          <Text
            name="slug"
            label={f.slug}
            value={effectiveSlug}
            onChange={(value) => {
              setSlugTouched(true);
              setSlug(value);
            }}
            hint={`/properties/${effectiveSlug || "…"}`}
            dir="ltr"
          />
        </Row>

        <Text
          name="tagline"
          label={f.tagline}
          defaultValue={property?.tagline}
          hint={f.taglineHint}
          dir="ltr"
        />

        <Textarea
          name="description"
          label={f.description}
          rows={8}
          defaultValue={property?.description}
          dir="ltr"
        />
      </Fieldset>

      {/* --- Arabic ------------------------------------------------------- *
          A separate block rather than fields interleaved with their English
          counterparts: an editor working on the translation stays in one
          place and in one writing direction, and the RTL inputs do not make
          the English form jump about. Every field is optional — see the
          fallback note in `localizeProperty`. */}
      <Fieldset legend={f.arabic} note={f.arabicHint}>
        <Row>
          <Text
            name="title_ar"
            label={f.titleAr}
            defaultValue={property?.title_ar ?? undefined}
            dir="rtl"
            lang="ar"
          />
          <Text
            name="tagline_ar"
            label={f.taglineAr}
            defaultValue={property?.tagline_ar ?? undefined}
            dir="rtl"
            lang="ar"
          />
        </Row>

        <Textarea
          name="description_ar"
          label={f.descriptionAr}
          rows={8}
          defaultValue={property?.description_ar ?? undefined}
          dir="rtl"
          lang="ar"
        />

        <Row cols={3}>
          <Text
            name="location_ar"
            label={f.locationAr}
            defaultValue={property?.location_ar ?? undefined}
            dir="rtl"
            lang="ar"
          />
          <Text
            name="city_ar"
            label={f.cityAr}
            defaultValue={property?.city_ar ?? undefined}
            dir="rtl"
            lang="ar"
          />
          <Text
            name="country_ar"
            label={f.countryAr}
            defaultValue={property?.country_ar ?? undefined}
            dir="rtl"
            lang="ar"
          />
        </Row>
      </Fieldset>

      {/* --- Classification ------------------------------------------------ */}
      <Fieldset legend={f.classification}>
        <Row cols={3}>
          <Select
            name="property_type"
            label={f.type}
            defaultValue={property?.property_type ?? "villa"}
            options={PROPERTY_TYPES.map((value) => ({
              value,
              label: t.enums.propertyType[value],
            }))}
          />
          <Select
            name="status"
            label={f.availability}
            defaultValue={property?.status ?? "available"}
            options={PROPERTY_STATUSES.map((value) => ({
              value,
              label: t.enums.status[value],
            }))}
          />
          <Select
            name="investment_type"
            label={f.investmentStrategy}
            defaultValue={property?.investment_type ?? "buy_to_hold"}
            options={INVESTMENT_TYPES.map((value) => ({
              value,
              label: t.enums.investmentType[value],
            }))}
          />
        </Row>

        <div className="flex flex-wrap gap-8">
          <Checkbox
            name="published"
            label={t.admin.published}
            defaultChecked={property?.published ?? false}
            hint={f.publishedHint}
          />
          <Checkbox
            name="featured"
            label={t.admin.featured}
            defaultChecked={property?.featured ?? false}
            hint={f.featuredHint}
          />
        </div>
      </Fieldset>

      {/* --- Location ------------------------------------------------------ */}
      <Fieldset legend={f.location}>
        <Row>
          <Text
            name="location"
            label={f.displayLocation}
            required
            defaultValue={property?.location}
            dir="ltr"
          />
          <Text name="city" label={f.city} required defaultValue={property?.city} dir="ltr" />
        </Row>
        <Row cols={3}>
          <Text
            name="country"
            label={f.country}
            required
            defaultValue={property?.country}
            dir="ltr"
          />
          <Text
            name="latitude"
            label={f.latitude}
            type="number"
            step="any"
            defaultValue={property?.latitude ?? undefined}
          />
          <Text
            name="longitude"
            label={f.longitude}
            type="number"
            step="any"
            defaultValue={property?.longitude ?? undefined}
          />
        </Row>
      </Fieldset>

      {/* --- Specification -------------------------------------------------- */}
      <Fieldset legend={f.specification}>
        <Row cols={3}>
          <Text
            name="price"
            label={f.price}
            type="number"
            min="0"
            step="any"
            required
            defaultValue={property?.price}
          />
          <Text
            name="currency"
            label={f.currency}
            maxLength={3}
            required
            defaultValue={property?.currency ?? "USD"}
            hint={f.currencyHint}
          />
          <Text
            name="area"
            label={f.area}
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
            label={f.bedrooms}
            type="number"
            min="0"
            defaultValue={property?.bedrooms ?? undefined}
          />
          <Text
            name="bathrooms"
            label={f.bathrooms}
            type="number"
            min="0"
            defaultValue={property?.bathrooms ?? undefined}
          />
          <Text
            name="year_built"
            label={f.yearBuilt}
            type="number"
            min="1500"
            max="2200"
            defaultValue={property?.year_built ?? undefined}
          />
        </Row>
      </Fieldset>

      {/* --- Investment ----------------------------------------------------- */}
      <Fieldset
        legend={f.investmentFigures}
        note={f.investmentNote}
      >
        <Row cols={4}>
          <Text
            name="roi"
            label={f.roi}
            type="number"
            step="any"
            min="0"
            defaultValue={property?.roi ?? undefined}
          />
          <Text
            name="annual_revenue"
            label={f.annualRevenue}
            type="number"
            min="0"
            step="any"
            defaultValue={property?.annual_revenue ?? undefined}
          />
          <Text
            name="occupancy_rate"
            label={f.occupancy}
            type="number"
            step="any"
            min="0"
            max="100"
            defaultValue={property?.occupancy_rate ?? undefined}
          />
          <Text
            name="appreciation"
            label={f.appreciation}
            type="number"
            step="any"
            min="0"
            defaultValue={property?.appreciation ?? undefined}
          />
        </Row>
      </Fieldset>

      {/* --- Media ---------------------------------------------------------- */}
      <Fieldset
        legend={f.media}
        note={f.mediaNote}
      >
        <Text
          name="cover_image"
          label={f.coverImage}
          defaultValue={property?.cover_image}
          dir="ltr"
        />
        <Textarea
          name="gallery"
          label={f.galleryUrls}
          dir="ltr"
          rows={7}
          defaultValue={property?.images.map((image) => image.image_url).join("\n")}
          mono
        />
      </Fieldset>

      <Fieldset legend={f.features} note={f.featuresNote}>
        <Row>
          <Textarea
            name="features"
            label={f.features}
            rows={8}
            defaultValue={property?.features.join("\n")}
            dir="ltr"
          />
          {/* Line N here translates line N on the left. A list of a different
              length is stored as untranslated rather than half-applied. */}
          <Textarea
            name="features_ar"
            label={f.featuresAr}
            rows={8}
            defaultValue={property?.features_ar.join("\n")}
            dir="rtl"
            lang="ar"
          />
        </Row>
      </Fieldset>

      {/* --- Save ----------------------------------------------------------- */}
      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-5 border-t border-hairline bg-paper/95 px-5 py-5 backdrop-blur-lg">
        <SaveButton
          isEdit={Boolean(property)}
          saving={t.admin.saving}
          save={t.admin.saveChanges}
          create={t.admin.createProperty}
        />

        <Link
          href={`/${locale}/admin/properties`}
          className="nav-link text-xs uppercase tracking-[0.16em] text-muted hover:text-gold rtl:tracking-normal rtl:normal-case"
        >
          {t.admin.backToList}
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

function SaveButton({
  isEdit,
  saving,
  save,
  create,
}: {
  isEdit: boolean;
  saving: string;
  save: string;
  create: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-solid !py-3 !px-7 disabled:opacity-60"
    >
      {pending ? saving : isEdit ? save : create}
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
  dir,
  lang,
}: {
  name: string;
  label: string;
  rows?: number;
  defaultValue?: string;
  mono?: boolean;
  dir?: "ltr" | "rtl";
  lang?: string;
}) {
  return (
    <div>
      <Label name={name} label={label} />
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        dir={dir}
        lang={lang}
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
