import { en } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";
import type { Dictionary } from "./dictionaries/en";
import { DEFAULT_LOCALE, type Locale } from "./config";

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar };

/**
 * Both dictionaries are plain modules, so this is synchronous and adds nothing
 * to the request path. With more locales — or much larger ones — this is the
 * seam to switch to dynamic `import()` per locale.
 */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/**
 * Fills `{name}` placeholders.
 *
 *   fill(t.detail.mapAlt, { title: "DENGLER Palm Residence" })
 *
 * Kept this simple deliberately: no plural rules, no gendered forms. Arabic
 * has six plural categories, and a naive pluraliser would produce worse copy
 * than writing both forms out in the dictionary — which is what the counts in
 * `common` do.
 */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export type { Dictionary };
export * from "./config";
