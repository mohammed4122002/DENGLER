import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Icons";
import { Reveal } from "./Reveal";

/**
 * The editorial header used at the top of every section: a small tracked
 * eyebrow, a large display line, and an optional link pushed to the trailing
 * edge. Consistency here is most of what makes the page read as one system.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  link,
  tone = "dark",
  align = "start",
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  link?: { href: string; label: string };
  tone?: "dark" | "light";
  align?: "start" | "center";
}) {
  const isLight = tone === "light";

  return (
    <header
      className={`flex flex-col gap-8 ${
        align === "center"
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <Reveal className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        <p className={`eyebrow ${isLight ? "!text-paper/45" : ""}`}>{eyebrow}</p>
        <h2
          className={`mt-4 display-md ${isLight ? "text-paper" : "text-ink"}`}
        >
          {title}
        </h2>
        {lead && (
          <p
            className={`mt-5 max-w-xl text-[0.9375rem] leading-relaxed ${
              isLight ? "text-paper/60" : "text-muted"
            } ${align === "center" ? "mx-auto" : ""}`}
          >
            {lead}
          </p>
        )}
      </Reveal>

      {link && (
        <Reveal delay={0.12}>
          <Link
            href={link.href}
            className={`group inline-flex items-center gap-3 text-xs uppercase tracking-[0.16em] ${
              isLight ? "text-paper/75 hover:text-gold-soft" : "text-graphite hover:text-gold"
            } nav-link transition-colors duration-400`}
          >
            {link.label}
            <ArrowIcon
              size={16}
              className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
            />
          </Link>
        </Reveal>
      )}
    </header>
  );
}
