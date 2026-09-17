import { SITE } from "@/lib/site";
import { isRtl, type Locale } from "@/lib/i18n";

/**
 * The Crete Roots Company lockup: a navy monogram tile, the name beside it in
 * two tones, and the descriptor beneath in small tracked capitals.
 *
 * The two tones are what make a two-word name read as one mark — "CRETE" in
 * the type colour, "ROOTS" in the accent — which is also why the name is split
 * on a space here rather than stored pre-split: `SITE.wordmark` stays a single
 * readable string, and nothing downstream has to know about the device.
 *
 * The descriptor is localised (`COMPANY` / `شركة`) while the name stays Latin
 * in both locales — it is a mark, not a word to translate — which is how
 * bilingual signage is normally set in the Gulf.
 *
 * The Latin descriptor is spread letter by letter to the width of the name,
 * which is what makes the two lines read as one object. That is deliberately
 * *not* done to Arabic: Arabic is cursive, and putting each letter in its own
 * box severs the joins between them. The Arabic descriptor is one run instead,
 * sized about a quarter larger because it has no small-capital convention.
 */
export function Wordmark({
  locale,
  size = "nav",
  tone = "dark",
  className = "",
}: {
  locale: Locale;
  size?: "nav" | "footer" | "large";
  tone?: "dark" | "light";
  className?: string;
}) {
  const descriptor = SITE.descriptor[locale];
  const rtl = isRtl(locale);
  const light = tone === "light";

  const [first, ...rest] = SITE.wordmark.split(" ");
  const second = rest.join(" ");

  const scale = {
    nav: { tile: "h-9 w-9 text-[0.9rem] rounded-[10px]", name: "text-[1.0625rem] sm:text-[1.1875rem]", gap: "gap-2.5" },
    footer: { tile: "h-11 w-11 text-[1.05rem] rounded-[12px]", name: "text-[1.375rem]", gap: "gap-3" },
    large: { tile: "h-14 w-14 text-[1.35rem] rounded-[14px]", name: "text-[1.75rem]", gap: "gap-3.5" },
  }[size];

  /* Latin can be set tiny because it is read as a shape — capitals, widely
     tracked, essentially a graphic device. Arabic letterforms carry meaning in
     their dots and joins, so the same optical size is simply unreadable. */
  const sub = (
    rtl
      ? { nav: "text-[0.5rem]", footer: "text-[0.6875rem]", large: "text-[0.8125rem]" }
      : { nav: "text-[0.4375rem]", footer: "text-[0.5625rem]", large: "text-[0.6875rem]" }
  )[size];

  return (
    <span className={`inline-flex items-center ${scale.gap} ${className}`}>
      {/* The monogram. Always the brand navy on light chrome; on a photograph
          it inverts to glass so it does not punch a dark hole in the image. */}
      <span
        aria-hidden
        className={`grid shrink-0 place-items-center font-display font-extrabold leading-none tracking-tight ${
          scale.tile
        } ${
          light
            ? "bg-white/15 text-white ring-1 ring-inset ring-white/35 backdrop-blur-sm"
            : "bg-ink text-white"
        }`}
      >
        <span className="translate-y-[0.02em]">
          {first.charAt(0)}
          <span className={light ? "text-gold-soft" : "text-gold"}>
            {(second || first).charAt(second ? 0 : 1)}
          </span>
        </span>
      </span>

      <span className="inline-flex flex-col items-stretch leading-none">
        {/* Marked as English so an Arabic screen reader announces it as a name
            rather than spelling it out. `whitespace-nowrap` because the
            descriptor is aligned to this box: a wrapped name would take the
            lockup's alignment with it. */}
        <span
          lang="en"
          dir="ltr"
          className={`font-display whitespace-nowrap font-extrabold tracking-[0.02em] ${scale.name} ${
            light ? "text-white" : "text-ink"
          }`}
        >
          {first}
          {second && (
            <span className={light ? "text-gold-soft" : "text-gold"}>{second}</span>
          )}
        </span>

        {rtl ? (
          <span
            lang="ar"
            dir="rtl"
            className={`mt-[0.5em] text-center font-semibold ${sub} ${
              light ? "text-white/65" : "text-muted"
            }`}
          >
            {descriptor}
          </span>
        ) : (
          <span
            aria-label={descriptor}
            className={`mt-[0.6em] flex justify-between font-semibold ${sub} ${
              light ? "text-white/65" : "text-muted"
            }`}
          >
            {descriptor.split("").map((character, index) => (
              <span key={`${character}-${index}`} aria-hidden>
                {/* A space still needs to occupy its slot in the spread. */}
                {character === " " ? " " : character}
              </span>
            ))}
          </span>
        )}
      </span>
    </span>
  );
}
