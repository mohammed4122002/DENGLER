import { SmartImage } from "@/components/site/SmartImage";
import { Reveal } from "@/components/site/Reveal";

/**
 * The compact cinematic band that opens every interior page. Uses the same
 * grade and grain as the hero so the pages feel like one publication, at a
 * height that doesn't delay the content.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  image,
  align = "start",
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  image: string;
  align?: "start" | "center";
}) {
  return (
    <section className="relative flex min-h-[54svh] items-end overflow-hidden bg-ink pt-[var(--nav-h)]">
      <SmartImage
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        quality={72}
        className="object-cover opacity-70"
      />
      {/* Same reasoning as the hero: the heading is white over an editable
          photograph, so the scrim has to carry the contrast on its own. */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,9,8,0.94)_5%,rgba(10,9,8,0.68)_45%,rgba(10,9,8,0.6)_100%)]"
        aria-hidden
      />
      <div className="absolute inset-0 grain" aria-hidden />

      <div
        className={`shell relative z-10 py-14 md:py-20 ${
          align === "center" ? "flex flex-col items-center text-center" : ""
        }`}
      >
        <Reveal y={18}>
          <p className="eyebrow !text-gold-soft">{eyebrow}</p>
          <h1 className="mt-5 max-w-4xl display-lg text-paper">{title}</h1>
          {lead && (
            <p
              className={`mt-6 max-w-xl text-[0.9375rem] leading-relaxed text-paper/65 ${
                align === "center" ? "mx-auto" : ""
              }`}
            >
              {lead}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
