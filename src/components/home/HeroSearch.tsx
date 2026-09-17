"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { HomeIcon, PinIcon, SearchIcon, TagIcon } from "@/components/ui/Icons";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";
import { PROPERTY_TYPES } from "@/lib/types";

/**
 * The search bar that sits inside the hero: three segments and a button on one
 * rail, stacking to a column below `md`.
 *
 * It composes a querystring and hands off to `/properties`, which owns the real
 * filtering — so there is exactly one search implementation on the site, not
 * two that drift apart. This replaced a full-width section that sat under the
 * hero and overlapped it by a negative margin; folding it into the hero's own
 * grid means the overlap is layout rather than arithmetic, and it survives the
 * hero changing height in Arabic.
 */
export function HeroSearch({
  countries,
  locale,
  t,
}: {
  countries: string[];
  locale: Locale;
  t: Dictionary;
}) {
  const router = useRouter();
  const [type, setType] = useState("all");
  const [country, setCountry] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (country) params.set("country", country);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(
      `${localePath(locale, "/properties")}${params.size ? `?${params}` : ""}`,
    );
  };

  return (
    <form
      onSubmit={submit}
      aria-label={t.quickSearch.ariaLabel}
      className="card flex flex-col gap-1 p-2 shadow-[var(--shadow-float)] md:flex-row md:items-stretch"
    >
      {/* The dividers are borders on the segments rather than separate rules,
          so they disappear with the row when the bar stacks on mobile. */}
      <Segment icon={<PinIcon size={15} />} label={t.quickSearch.market}>
        <select
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          className="segment-select"
        >
          <option value="">{t.quickSearch.anyMarket}</option>
          {countries.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </Segment>

      <Segment icon={<HomeIcon size={15} />} label={t.quickSearch.lookingFor} divided>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="segment-select"
        >
          <option value="all">{t.quickSearch.anyType}</option>
          {PROPERTY_TYPES.map((value) => (
            <option key={value} value={value}>
              {t.enums.propertyTypePlural[value]}
            </option>
          ))}
        </select>
      </Segment>

      <Segment icon={<TagIcon size={15} />} label={t.quickSearch.budget} divided>
        <select
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          className="segment-select"
        >
          <option value="">{t.quickSearch.noMaximum}</option>
          <option value="3000000">$3M</option>
          <option value="5000000">$5M</option>
          <option value="10000000">$10M</option>
          <option value="25000000">$25M</option>
          <option value="50000000">$50M</option>
        </select>
      </Segment>

      <button type="submit" className="btn btn-solid shrink-0 md:!px-7">
        <SearchIcon size={15} />
        {t.quickSearch.submit}
      </button>
    </form>
  );
}

function Segment({
  icon,
  label,
  children,
  divided = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  divided?: boolean;
}) {
  return (
    <label
      className={`flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 ${
        divided ? "md:border-s md:border-hairline" : ""
      }`}
    >
      <span className="shrink-0 text-muted" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.6875rem] font-semibold text-muted">
          {label}
        </span>
        {children}
      </span>
    </label>
  );
}
