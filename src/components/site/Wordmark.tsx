import { SITE } from "@/lib/site";
import { isRtl, type Locale } from "@/lib/i18n";

/**
 * The DENGLER REAL ESTATE lockup.
 *
 * Two lines: the mark in the display serif, the descriptor beneath it in small
 * tracked sans. Stacking rather than setting it inline is what keeps it usable
 * in a 76px navigation bar — and at 320px, where the inline form would not fit
 * beside the language switcher and the menu button.
 *
 * The Latin descriptor is spread letter by letter to the width of the mark,
 * which is what makes the two lines read as one object. That technique is
 * *not* applied to Arabic: Arabic is cursive, and putting each letter in its
 * own box severs the joins between them, turning a word into debris. The
 * Arabic descriptor is set as a single run instead.
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

  const mark = {
    nav: "text-[1.15rem] sm:text-[1.4rem]",
    footer: "text-[2.1rem]",
    large: "text-[2.6rem]",
  }[size];

  /*
   * The descriptor is sized per script. Latin can be set tiny because it is
   * read as a shape — capitals, widely tracked, essentially a graphic device.
   * Arabic has no small-capital convention and its letterforms carry meaning
   * in the dots and joins, so the same optical size is simply unreadable; it
   * needs roughly a quarter more.
   */
  const sub = (
    rtl
      ? {
          nav: "text-[0.5625rem] sm:text-[0.625rem]",
          footer: "text-[0.875rem]",
          large: "text-[1rem]",
        }
      : {
          nav: "text-[0.4375rem] sm:text-[0.5rem]",
          footer: "text-[0.6875rem]",
          large: "text-[0.8125rem]",
        }
  )[size];

  return (
    <span className={`inline-flex flex-col items-stretch leading-none ${className}`}>
      {/* Always Latin, and marked as such so an Arabic screen reader announces
          it as an English word rather than spelling it out. */}
      {/* The negative inline-end margin cancels the letter-space the tracking
          adds *after the final letter*. Without it the box is wider than the
          glyphs, and the descriptor below centres against phantom space —
          which reads as a lockup that is slightly out of alignment. */}
      <span
        lang="en"
        dir="ltr"
        className={`font-display -me-[0.2em] tracking-[0.2em] sm:-me-[0.34em] sm:tracking-[0.34em] ${mark} ${
          tone === "light" ? "text-white" : "text-ink"
        }`}
        style={{ fontFamily: "var(--font-display-latin), serif" }}
      >
        {SITE.wordmark}
      </span>

      {rtl ? (
        <span
          lang="ar"
          dir="rtl"
          className={`mt-[0.45em] text-center font-medium ${sub} ${
            tone === "light" ? "text-white/60" : "text-muted"
          }`}
        >
          {descriptor}
        </span>
      ) : (
        <span
          aria-label={descriptor}
          className={`mt-[0.55em] flex justify-between font-medium ${sub} ${
            tone === "light" ? "text-white/60" : "text-muted"
          }`}
        >
          {descriptor.split("").map((character, index) => (
            <span key={`${character}-${index}`} aria-hidden>
              {/* A space still needs to occupy its slot in the spread. */}
              {character === " " ? " " : character}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
