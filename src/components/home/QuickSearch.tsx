"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ArrowIcon } from "@/components/ui/Icons";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";
import { PROPERTY_TYPES } from "@/lib/types";

/**
 * The entry point to search, sitting directly under the hero. It composes a
 * querystring and hands off to /properties, which owns the real filtering —
 * so there is exactly one search implementation, not two that drift apart.
 */
export function QuickSearch({
  countries,
  locale,
  t,
}: {
  countries: string[];
  locale: Locale;
  t: Dictionary;
}) {
  const router = useRouter();
  const [type, setType] = useState<string>("all");
  const [country, setCountry] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

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
    <section className="relative z-30 -mt-14 md:-mt-16" aria-label={t.quickSearch.ariaLabel}>
      <div className="shell">
        <form
          onSubmit={submit}
          className="grid grid-cols-1 gap-x-8 gap-y-5 border border-hairline bg-paper px-6 py-7 shadow-[0_24px_60px_-40px_rgba(18,16,14,0.5)] sm:grid-cols-2 sm:px-8 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end lg:gap-x-10"
        >
          <Field label={t.quickSearch.lookingFor}>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="field select-luxe"
            >
              <option value="all">{t.quickSearch.anyType}</option>
              {PROPERTY_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t.enums.propertyTypePlural[value]}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t.quickSearch.market}>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="field select-luxe"
            >
              <option value="">{t.quickSearch.anyMarket}</option>
              {countries.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t.quickSearch.budget}>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="field select-luxe"
            >
              <option value="">{t.quickSearch.noMaximum}</option>
              <option value="3000000">$3M</option>
              <option value="5000000">$5M</option>
              <option value="10000000">$10M</option>
              <option value="25000000">$25M</option>
              <option value="50000000">$50M</option>
            </select>
          </Field>

          <button type="submit" className="btn btn-solid group w-full lg:w-auto">
            {t.quickSearch.submit}
            <ArrowIcon
              size={15}
              className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
            />
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow block">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
