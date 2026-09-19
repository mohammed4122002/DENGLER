import { stripLocale } from "@/lib/i18n";

/**
 * What is painted underneath the navigation bar at the top of a route.
 *
 * The bar has no background of its own until you scroll, so it has to know
 * this: over the home hero it needs navy type, over an interior page's header
 * photograph it needs white. Getting it wrong does not degrade — it makes the
 * navigation invisible.
 *
 * The rule is not a guess about styling, it is a fact about layout. Every
 * interior page opens with `PageHeader`, which is a photograph under a
 * near-black scrim. Two routes do not: the home page opens with the hero, which
 * is light, and a property's own page opens on paper.
 *
 * The default is `dark`, because that is what all but two routes are, and
 * because the failure is asymmetric: white type over a photograph that turned
 * out to be light is dim, while navy type over one that turned out to be dark
 * is gone. `tests/e2e.mjs` measures the links at the top of both kinds of
 * route, so a new page that breaks the rule fails the suite rather than
 * shipping with an unreadable bar.
 */
export type NavSurface = "light" | "dark";

export function navSurface(pathname: string): NavSurface {
  const bare = stripLocale(pathname ?? "/") || "/";

  // The home page: the hero and its wash.
  if (bare === "/") return "light";

  // A single property: breadcrumb and title on paper, no header photograph.
  // `/properties` itself is the listing, which does have one.
  if (bare.startsWith("/properties/")) return "light";

  return "dark";
}
