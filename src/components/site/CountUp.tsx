"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Counts a figure up when it scrolls into view.
 *
 * The values it is given are display strings — "120+", "$180M+", "7 yrs" — so
 * it splits each into a prefix, the first run of digits, and a suffix, and
 * animates only the middle. Anything it cannot parse is printed unchanged,
 * which is the important property: an editor can type "Q3 2027" into the
 * dashboard and get "Q3 2027" on the page rather than NaN.
 *
 * `once: true` — a number that re-counts every time it scrolls past is a
 * fidget toy, not an entrance.
 *
 * Two rules keep it from ever showing the wrong figure, which is the only
 * thing that actually matters about a statistic:
 *
 *   · Targets below 10 are not animated. "7 yrs" counting 0 → 7 in a second
 *     and a half is four frames of "0 yrs", which reads as a broken stat
 *     rather than as a flourish.
 *   · A fallback timer snaps to the target if the count has not begun within
 *     two seconds. If the observer never fires — the element mounts already
 *     scrolled past, a margin edge case, anything — the figure lands on the
 *     truth instead of sitting at zero forever.
 */
export function CountUp({
  value,
  className,
  duration = 1400,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reduce = useReducedMotion();

  const match = /^(\D*)(\d[\d,.]*)(.*)$/s.exec(value);
  const target = match ? Number(match[2].replace(/,/g, "")) : NaN;
  const animatable =
    Boolean(match) && Number.isFinite(target) && target >= 10 && !reduce;

  const [shown, setShown] = useState(animatable ? 0 : target);
  const settled = useRef(!animatable);

  useEffect(() => {
    if (!animatable || !inView) return;

    settled.current = true;

    // The eased tail is what makes it read as settling rather than stopping.
    const ease = (p: number) => 1 - (1 - p) ** 3;
    let frame = 0;
    const started = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      setShown(target * ease(progress));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [animatable, inView, target, duration]);

  useEffect(() => {
    if (!animatable) return;
    const bail = setTimeout(() => {
      if (!settled.current) setShown(target);
    }, 2000);
    return () => clearTimeout(bail);
  }, [animatable, target]);

  if (!match) return <span className={className}>{value}</span>;

  const [, prefix, digits, suffix] = match;
  // Match the source's precision, so "7" never counts through "6.4".
  const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;
  const text = animatable
    ? shown.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : digits;

  return (
    <span ref={ref} className={className}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
