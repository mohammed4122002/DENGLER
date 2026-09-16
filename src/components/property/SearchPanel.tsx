"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { CloseIcon } from "@/components/ui/Icons";
import type { Facets } from "@/lib/store";
import type { Dictionary } from "@/lib/i18n";
import {
  INVESTMENT_TYPES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
} from "@/lib/types";

/**
 * Search is URL-first: every filter lives in the querystring, so a result set
 * is shareable, bookmarkable and survives a back button. The panel writes to
 * the URL and the server component re-queries — there is no client-side copy
 * of the catalogue to fall out of sync.
 *
 * The free-text box is debounced by 350ms; the selects commit immediately.
 */

const ADVANCED_KEYS = [
  "minPrice",
  "maxPrice",
  "minArea",
  "bedrooms",
  "investmentType",
  "minRoi",
  "status",
] as const;

export function SearchPanel({
  facets,
  /** Locks the type filter on the category pages (/villas, /hotels, /land). */
  lockedType,
  resultCount,
  t,
}: {
  facets: Facets;
  lockedType?: string;
  resultCount: number;
  t: Dictionary;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [text, setText] = useState(params.get("q") ?? "");
  const [advancedOpen, setAdvancedOpen] = useState(() =>
    ADVANCED_KEYS.some((key) => params.get(key)),
  );

  const current = useMemo(() => new URLSearchParams(params.toString()), [params]);

  const push = (next: URLSearchParams) => {
    next.delete("page");
    startTransition(() => {
      router.replace(next.size ? `?${next}` : "?", { scroll: false });
    });
  };

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(current.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    push(next);
  };

  // Debounce the text field so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const existing = params.get("q") ?? "";
    if (text === existing) return;

    const timer = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (text.trim()) next.set("q", text.trim());
      else next.delete("q");
      next.delete("page");
      startTransition(() => router.replace(next.size ? `?${next}` : "?", { scroll: false }));
    }, 350);

    return () => clearTimeout(timer);
  }, [text, params, router]);

  const activeFilters = [...current.entries()].filter(
    ([key, value]) => value && key !== "sort" && key !== "q",
  );

  const clearAll = () => {
    setText("");
    push(new URLSearchParams());
  };

  return (
    <div className="border-y border-hairline bg-cream/40">
      <div className="shell py-7">
        {/* --- Primary row ------------------------------------------------- */}
        <div className="grid gap-x-8 gap-y-5 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] lg:items-end">
          <Field label={t.search.search}>
            <input
              type="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.search.searchPlaceholder}
              className="field"
              aria-label={t.search.searchAriaLabel}
            />
          </Field>

          {!lockedType && (
            <Field label={t.search.assetType}>
              <select
                id="filter-type"
                name="type"
                value={current.get("type") ?? "all"}
                onChange={(e) => set("type", e.target.value === "all" ? "" : e.target.value)}
                className="field select-luxe"
              >
                <option value="all">{t.search.allTypes}</option>
                {PROPERTY_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {t.enums.propertyTypePlural[value]} ({facets.counts[value]})
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label={t.search.market}>
            <select
              id="filter-country"
              name="country"
              value={current.get("country") ?? ""}
              onChange={(e) => set("country", e.target.value)}
              className="field select-luxe"
            >
              <option value="">{t.search.allMarkets}</option>
              {facets.countries.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t.search.sortBy}>
            <select
              id="filter-sort"
              name="sort"
              value={current.get("sort") ?? "newest"}
              onChange={(e) => set("sort", e.target.value === "newest" ? "" : e.target.value)}
              className="field select-luxe"
            >
              <option value="newest">{t.search.sort.newest}</option>
              <option value="price_asc">{t.search.sort.priceAsc}</option>
              <option value="price_desc">{t.search.sort.priceDesc}</option>
              <option value="roi_desc">{t.search.sort.roiDesc}</option>
              <option value="area_desc">{t.search.sort.areaDesc}</option>
            </select>
          </Field>
        </div>

        {/* --- Advanced ---------------------------------------------------- */}
        <AnimatePresence initial={false}>
          {advancedOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-8 grid gap-x-8 gap-y-5 border-t border-hairline pt-7 sm:grid-cols-2 lg:grid-cols-4">
                <Field label={t.search.minPrice}>
                  <NumberSelect
                    name="minPrice"
                    value={current.get("minPrice") ?? ""}
                    onChange={(v) => set("minPrice", v)}
                    options={[1_000_000, 2_500_000, 5_000_000, 10_000_000, 20_000_000]}
                    placeholder={t.search.noMinimum}
                    format={(n) => `$${n / 1_000_000}M`}
                  />
                </Field>

                <Field label={t.search.maxPrice}>
                  <NumberSelect
                    name="maxPrice"
                    value={current.get("maxPrice") ?? ""}
                    onChange={(v) => set("maxPrice", v)}
                    options={[3_000_000, 5_000_000, 10_000_000, 25_000_000, 50_000_000]}
                    placeholder={t.search.noMaximum}
                    format={(n) => `$${n / 1_000_000}M`}
                  />
                </Field>

                <Field label={t.search.minArea}>
                  <NumberSelect
                    name="minArea"
                    value={current.get("minArea") ?? ""}
                    onChange={(v) => set("minArea", v)}
                    options={[400, 600, 1000, 10_000, 100_000]}
                    placeholder={t.search.anyArea}
                    format={(n) => (n >= 10_000 ? `${n / 10_000} ha` : `${n} m²`)}
                  />
                </Field>

                <Field label={t.search.bedroomsOrKeys}>
                  <NumberSelect
                    name="bedrooms"
                    value={current.get("bedrooms") ?? ""}
                    onChange={(v) => set("bedrooms", v)}
                    options={[2, 3, 4, 5, 6, 10, 20]}
                    placeholder={t.search.any}
                    format={(n) => `${n}+`}
                  />
                </Field>

                <Field label={t.search.investmentType}>
                  <select
                    id="filter-investmentType"
                    name="investmentType"
                    value={current.get("investmentType") ?? ""}
                    onChange={(e) => set("investmentType", e.target.value)}
                    className="field select-luxe"
                  >
                    <option value="">{t.search.anyStrategy}</option>
                    {INVESTMENT_TYPES.map((value) => (
                      <option key={value} value={value}>
                        {t.enums.investmentType[value]}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={t.search.minRoi}>
                  <NumberSelect
                    name="minRoi"
                    value={current.get("minRoi") ?? ""}
                    onChange={(v) => set("minRoi", v)}
                    options={[5, 8, 10, 12, 15]}
                    placeholder={t.search.anyReturn}
                    format={(n) => `${n}%+`}
                  />
                </Field>

                <Field label={t.search.availability}>
                  <select
                    id="filter-status"
                    name="status"
                    value={current.get("status") ?? ""}
                    onChange={(e) => set("status", e.target.value)}
                    className="field select-luxe"
                  >
                    <option value="">{t.search.anyStatus}</option>
                    {PROPERTY_STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {t.enums.status[value]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Footer row -------------------------------------------------- */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setAdvancedOpen((open) => !open)}
              aria-expanded={advancedOpen}
              className="nav-link text-xs uppercase tracking-[0.16em] text-graphite transition-colors hover:text-gold rtl:tracking-normal rtl:normal-case"
            >
              {advancedOpen ? t.search.hideAdvanced : t.search.advancedFilters}
            </button>

            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:border-gold hover:text-gold rtl:tracking-normal rtl:normal-case"
              >
                {t.search.clearAll}
                <CloseIcon size={11} />
              </button>
            )}
          </div>

          <p
            className="text-xs uppercase tracking-[0.16em] text-muted rtl:tracking-normal rtl:normal-case"
            aria-live="polite"
          >
            {isPending
              ? t.search.searching
              : `${resultCount} ${resultCount === 1 ? t.common.property : t.common.properties}`}
          </p>
        </div>
      </div>
    </div>
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

function NumberSelect({
  name,
  value,
  onChange,
  options,
  placeholder,
  format,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: number[];
  placeholder: string;
  format: (value: number) => string;
}) {
  return (
    <select
      id={`filter-${name}`}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="field select-luxe"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {format(option)}
        </option>
      ))}
    </select>
  );
}
