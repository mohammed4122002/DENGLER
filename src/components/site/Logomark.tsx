/**
 * The Crete Roots mark: a gable standing on a root system.
 *
 * The name is the brief. "Roots" is what the company sells — permanence, an
 * asset that holds — and a roof is the shortest way to say real estate, so the
 * mark is the two stacked: the property above ground, what holds it up below.
 *
 * Drawn on a 32-unit grid and tested down to 16px, which is the size that
 * decides a mark. Earlier drafts used an open chevron rather than a solid
 * gable and read as an arrow at every size; the roots had five branches and
 * turned to mush below 24px. Three branches and a filled roof survive the
 * favicon.
 *
 * The roots are painted *before* the roof so the roof covers the trunk's round
 * cap. Drawn the other way the cap pokes into the roof as a gold nub — which
 * is invisible while both are the same colour and appears the moment they are
 * not.
 *
 * The roof takes `currentColor`, so it inverts with whatever it is set on; the
 * roots take their own colour, because the accent has to darken on light
 * surfaces to stay legible and lighten on dark ones.
 */
export function Logomark({
  size = 32,
  root = "#d4af52",
  className,
  title,
}: {
  size?: number;
  root?: string;
  className?: string;
  /** Supply only when the mark stands alone as a link or image. Inside a
   *  lockup the name beside it is already the accessible label. */
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <g
        stroke={root}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M16 18.4v9.2" />
        <path d="M16 22.2c-3.6.2-5.6 2-6 5.4" />
        <path d="M16 22.2c3.6.2 5.6 2 6 5.4" />
      </g>
      <path
        d="M16 4.4 26.6 12.5a1.5 1.5 0 0 1 .6 1.2v3.1a1.6 1.6 0 0 1-1.6 1.6H6.4a1.6 1.6 0 0 1-1.6-1.6v-3.1c0-.47.22-.92.6-1.2L16 4.4Z"
        fill="currentColor"
      />
    </svg>
  );
}
