# Crete Roots Company

Premium real estate and investment platform for villas, hotels and land.

**Bilingual: English and العربية**, each with its own URL tree, its own
typography and its own copy of every property record.

Built on Next.js 16 (App Router) with TypeScript, Tailwind CSS v4 and Framer
Motion. Runs against Supabase/Postgres when configured, and against a bundled
demo catalogue when it isn't — so `npm run dev` gives you a complete, working
platform with no setup at all.

---

## A note on what this repository was before

This repository contained a single `README.md` with the project name in it.
There was no prior application — no framework, no components, no database, no
ZIP — so there was nothing to analyse, preserve or refactor. Everything here
was written from scratch. If you have an existing codebase you wanted merged
into this, it did not reach the repository.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

That's it. The platform boots in **demo mode**: 26 fictional properties across
villas, hotels and land — each written in both languages — a working search, a
working enquiry pipeline and a working admin dashboard, all served from memory.

`/` redirects to `/en` or `/ar` based on a saved preference, then
`Accept-Language`, then English.

To explore the dashboard at `/admin`, either leave `ADMIN_PASSWORD` unset in
development (it unlocks automatically, and is blocked in production builds), or
set one in `.env.local`.

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Next 16 removed `next lint`) |
| `npm run test:e2e` | Browser end-to-end checks against a running server |
| `npm run seed` | Load the demo catalogue into Supabase |
| `npm run verify:images` | Check every image URL in the registry resolves |

Both language trees are prerendered at build time — 26 properties × 2 locales,
plus the legal and marketing pages.

### End-to-end checks

```bash
npm run build
PORT=3100 ADMIN_PASSWORD=secret ADMIN_SESSION_SECRET=$(openssl rand -hex 32) npm start &
BASE_URL=http://127.0.0.1:3100 ADMIN_PASSWORD=secret npm run test:e2e
```

Covers every route **in both languages**, console errors and uncaught
exceptions, search URL round-tripping, form validation, the gallery lightbox,
horizontal overflow at 320/390/768/1440, the sticky investment rail, and the
full admin flow from guard to sign-out.

It also measures **hero contrast off the rendered pixels** — hiding every glyph
in the section, screenshotting the boxes the text actually occupies, and
reading them back through a canvas — twice: as published, and with every hero
image forced to pure white. Both must clear 3:1 (WCAG AA, large text). The
headline once measured 1.2:1, so this is asserted rather than eyeballed.

The bilingual section additionally asserts: unprefixed paths redirect into a
locale, `Accept-Language` picks Arabic for an Arabic speaker, `dir`/`lang`/
`hreflang`/`canonical` are correct on both trees, the switcher preserves path
*and* filters in both directions, Arabic pages are actually Arabic (headings,
navigation, property description and features — not an English fallback), and
Arabic search matches both `دبي` and the unhamzated `الامارات`.

Set `SHOT_DIR` to capture screenshots as it goes.

---

## Architecture

```
src/
  app/
    [locale]/                    Everything public lives under /en or /ar
      layout.tsx                 Root layout — sets lang, dir and the fonts
      page.tsx                   Home
      properties/                Listing + /[slug] detail
      villas/ hotels/ land/      Category pages (one shared implementation)
      investments/               Portfolio comparison
      about/ contact/ legal/[slug]
      not-found.tsx              Localised 404
      admin/
        login/                   Unguarded
        (protected)/             Route group — the auth guard is on its layout
    global-not-found.tsx         For a URL that matched no locale at all
    actions/                     Server actions (inquiries, admin)
    sitemap.ts  robots.ts
  proxy.ts                       Locale routing + Supabase session refresh
  components/
    home/                        Hero, stats, categories, investment, CTA
    property/                    Card, grid, search, gallery, investment panel
    site/                        Navbar, footer, transitions, LanguageSwitcher
    admin/                       Dashboard UI
    ui/                          Icons
  lib/
    i18n/
      config.ts                  Locales, direction, path helpers
      index.ts                   getDictionary, fill
      metadata.ts                canonical + hreflang helper
      dictionaries/en.ts         Every English string — defines the shape
      dictionaries/ar.ts         Every Arabic string — typed against en.ts
    store/                       Data layer — see below
    data/
      seed.ts                    Demo catalogue (English + numbers)
      seed-ar.ts                 The same catalogue in Arabic, keyed by slug
      images.ts                  Image registry
    types.ts format.ts query.ts auth.ts env.ts site.ts
  styles/globals.css             Design system + RTL corrections
supabase/migrations/             Schema, RLS, and the Arabic columns
```

### Bilingual

Both locales are peers, not a base language with a translation bolted on.

**Routing.** Every page lives under `/en/…` or `/ar/…`. `src/proxy.ts` redirects
an unprefixed request to the visitor's saved cookie, else their
`Accept-Language`, else English — with a 307, because a permanent redirect
would cache a preference they might change. Slugs and query keys stay
locale-independent, so the switcher rewrites
`/en/properties/x?type=villa` to `/ar/properties/x?type=villa`: same listing,
same filters, other language.

**Copy.** `dictionaries/en.ts` defines the dictionary's shape and `ar.ts` is
typed against it, so a missing Arabic string is a build error rather than an
English word surfacing mid-sentence. The Arabic is written to read as Arabic,
not translated phrase by phrase.

**Property records.** Each row carries nullable `*_ar` columns
(`title_ar`, `tagline_ar`, `description_ar`, `location_ar`, `city_ar`,
`country_ar`, and `feature_ar` on features). `localizeProperty` resolves the
pair and falls back to English per field, so a half-translated catalogue
degrades to a readable page. The catalogue this repo ships is fully translated,
and `seed.ts` throws at build time if a property is missing its Arabic.

The admin form edits both languages, Arabic in its own RTL block.

**Search works in either language against either language.** Both are indexed
in one `search_text` column, folded so the orthographic variants people
actually type all match: harakat and tatweel stripped, أ/إ/آ → ا, ى → ي,
ة → ه. `foldSearchText` (TypeScript) folds the query, `public.fold_arabic`
(SQL) folds the column — **if you change one, change the other**, or the search
silently returns nothing.

**Numbers.** Both locales use Latin digits, which `ar-AE` does by default and
which is the convention in Gulf property material. Everything else goes through
`Intl`, so Arabic gets its own compact notation — `21.50 مليون USD`, not
`$21.50M`.

Arabic quotes the ISO code rather than the symbol, on purpose: `$`, `€` and `£`
are bidi-neutral characters, and next to Latin letters in a right-to-left line
they detach and jump to the wrong end — `US$` renders as `$US`. Three strong
Latin letters have nothing neutral to misplace.

**The wordmark** is a two-line lockup (`components/site/Wordmark.tsx`):
CRETE ROOTS above, the descriptor below. "CRETE ROOTS" stays Latin in both locales — it
is a mark, not a word to translate — while the descriptor is localised,
`COMPANY` / `شركة`, the way bilingual signage is normally set in the Gulf. One
line in `site.ts` switches the Arabic side back to the Latin lockup if you
prefer it.

The mark is `whitespace-nowrap`, and its size and tracking step together at the
`sm` breakpoint. Eleven characters is half again as wide as a one-word mark,
and at 320px the budget is roughly 170px once the language switcher and the
menu button have taken theirs. Letting it break to two lines is not an escape
hatch — the descriptor is aligned to the mark's box, so a wrapped mark takes
the lockup's alignment with it.

The Latin descriptor is spread letter by letter to the exact width of the mark,
which is what makes the two lines read as one object. That is deliberately
*not* done to Arabic: Arabic is cursive, and boxing each letter severs the
joins between them. The Arabic descriptor is set as one run and sized about a
quarter larger, because it has no small-capital convention to fall back on.

In running prose both dictionaries use the short form — a company calls itself
"Crete Roots" in a sentence and "Crete Roots Company" on the door.

**Typography.** Bodoni Moda ↔ Reem Kufi for display, Jost ↔ Tajawal for text.
The pairings are the same idea worked out in two scripts: a Didone beside a
modern Kufi, both high-contrast and geometric; a geometric sans beside an
Arabic one built on the same circle-and-stem logic. All four load always, and
each stack lists the other script's face, so "CRETE ROOTS" inside an Arabic
sentence doesn't drop to a system font.

Bodoni Moda is loaded with its `opsz` axis and with its real italic. CSS
applies `font-optical-sizing: auto` by default, so hairlines thicken in a 1rem
card title and thin out again in an 8rem headline without anything being set
per size — which is the whole reason to pick a Didone that has the axis. The
italic matters for the same reason: a Didone italic is a separate design, and
the sheared roman a browser synthesises in its absence reads as a rendering
fault rather than as emphasis.

Its lightest weight is 400 and `font-synthesis-weight` is off, so the
`font-weight: 300` on headings resolves to it rather than being faked thinner.
Display tracking is much looser than the previous humanist serif took: a Didone
is vertical stems joined by hairlines, and pulled tight the hairlines of one
letter touch the stems of the next.

The RTL corrections at the bottom of `globals.css` are **deliberately
unlayered**. Tailwind's cascade runs base → components → utilities and layer
order beats specificity, so `[dir="rtl"] .italic` inside `@layer base` loses to
`.italic` in the utilities layer — which is exactly how an earlier revision
silently shipped synthetically-slanted Arabic. Each correction undoes a Latin
convention that damages Arabic:

- **no synthetic italic** — Arabic has no italic form, so browsers shear the
  glyphs; the accent lines use colour alone
- **no letter-spacing** — Arabic is cursive, and tracking severs the joins
- **no full stop on display headings** — at that size it reads as a smudge, and
  Arabic headline convention omits it; body copy keeps its punctuation
- **more leading** — Arabic reaches further above and below the baseline, though
  a Kufi face needs much less of it than a Naskh one; the hero's line masks are
  sized from measured ink extents, not guessed

**Adding a third language** means: add it to `LOCALES`, add a dictionary, add a
font pair. At that point the `*_ar` columns should become a
`property_translations` table — two locales are worth the flat columns for the
single-join reads and the one shared search index; three are not.

### The data layer

Everything reads and writes through `src/lib/store`, which resolves to one of
two implementations at import time:

- **`supabaseStore`** when `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
- **`demoStore`** otherwise — the bundled catalogue held in memory.

Both satisfy the same `DataStore` interface, so no page or action branches on
which is active. The only place the distinction surfaces in the UI is the
"Demo data" badge and the dashboard banner.

Demo-mode writes are real: the dashboard genuinely creates, edits, reorders,
publishes and deletes. They live in the server process, so they reset on
restart and are not shared between serverless instances. The UI says so.

### Connecting Supabase

1. Create a project and run `supabase/migrations/0001_init.sql`
   (`supabase db push`, or `psql "$DATABASE_URL" -f …`).
2. Copy `.env.example` to `.env.local` and fill in the URL, anon key and
   service role key.
3. `npm run seed` to load the demo catalogue.
4. Create a user, then set that row's `profiles.role` to `admin`.

Row Level Security is enabled on every table:

| Table | Public | Admin |
| --- | --- | --- |
| `properties`, `property_images`, `property_features` | read where `published` | full |
| `inquiries` | insert only | full |
| `site_stats` | read | full |
| `profiles` | own row | full |

Admins are identified by `public.is_admin()`, a `security definer` function —
reading `profiles` directly inside a policy on `profiles` would recurse.

---

## Design system

`src/styles/globals.css` holds the whole system: a narrow palette (paper,
cream, ink, one gold accent, one deep purple used sparingly), a display serif
against a grotesk, two easing curves, and a small set of component classes
(`.btn`, `.field`, `.eyebrow`, `.shell`, `.nav-link`).

Two conventions worth knowing before editing:

- **Logical properties everywhere.** `padding-inline`, `inset-inline-start`,
  `text-start` — never `left`/`right`. That is what lets `dir="rtl"` mirror the
  entire layout with no second stylesheet.
- **No `overflow-x` on `<body>`.** Both `hidden` and `clip` there stop every
  `position: sticky` descendant from sticking. Sections that could bleed
  horizontally clip themselves instead. `tests/e2e.mjs` guards this.

### Motion

The hero is staged as a short film: a 20-second plate push-in, drifting cloud
banks, a gold light sweep across the façade, masked headline reveals, and four
depth layers that drift against the pointer at different rates (sky → building
→ light → foreground planting, which also sways on its own timers).

Every effect degrades to a static composition under `prefers-reduced-motion`,
which is honoured in CSS and re-checked in JavaScript via `useReducedMotion`.
Page transitions are a 340ms fade with 8px of drift — long enough to read as
craft, short enough not to read as latency.

Framer Motion is the only animation dependency. There is no Three.js: nothing
on these pages needs a 3D renderer, and the bundle cost would be real.

---

## Images

Every demo image resolves through `src/lib/data/images.ts` — one registry of
semantic keys to URLs. Repoint the whole catalogue by editing that file alone.

The defaults are Unsplash CDN URLs, transformed server-side (`w`, `q`, `fm`)
and re-encoded to AVIF/WebP by Next. `SmartImage` adds a blur-up, a fade on decode, and a fallback plate so a dead
URL reads as intentional rather than broken.

Both the blur and the plate are graded **dark-to-warm, not cream**. That is not
decoration: the hero sets white type over the image, so a pale placeholder made
every heading unreadable for as long as the photograph was missing — which,
if a URL is wrong, is forever. The plate is a dusk composition that the same
type sits on correctly.

> **Please run `npm run verify:images` once.** The sandbox this project was
> scaffolded in blocks outbound requests to image CDNs, so the registry could
> not be checked there. The script reports any id that needs replacing.

Admin-uploaded photography goes to the `property-images` Supabase Storage
bucket, which the migration creates with public read and admin-only write.

---

## Demo data and disclosure

Every property in `src/lib/data/seed.ts` is **fictional**. Valuations, yields,
occupancy, revenue and coordinates are illustrative. No real owner, developer,
operator or transaction is represented.

Because the platform's whole proposition is publishing investment figures, this
is handled explicitly rather than in a footer:

- A "Demo data" badge sits beside every ROI, revenue and occupancy figure while
  the demo store is active.
- The investment panel carries a full disclaimer stating the figures are not a
  forecast and not investment advice.
- `/legal/disclosures` states it again at length.
- The `RealEstateListing` structured data deliberately omits yield and ROI.
  Publishing invented performance figures as machine-readable claims is not
  something to automate.

All three disappear automatically once Supabase is connected — so replace the
seed data with verified inventory before you turn it on.

---

## SEO

Per-property dynamic titles, descriptions, canonicals, Open Graph and Twitter
cards; `RealEstateListing` JSON-LD with `Offer`, `PostalAddress`,
`GeoCoordinates`, `QuantitativeValue` and `inLanguage`; and a `robots.txt` that
keeps `/admin` out of the index in both trees. Property pages are prerendered
at build time via `generateStaticParams` and revalidated hourly.

Every page declares `hreflang` alternates for both locales plus `x-default`,
and every URL in `sitemap.xml` carries the same set — a one-way declaration is
ignored, so both trees list each other. Without it the two languages would look
like duplicate content rather than translations.

Canonical, hreflang and `og:url` are returned together by one helper
(`lib/i18n/metadata.ts`) rather than set separately. Next merges `openGraph` as
a whole, so a page that sets `alternates` but not `openGraph` silently inherits
the *layout's* `og:url` — which is the locale root. Every interior page was
advertising the home page as its Open Graph URL until `tests/e2e.mjs` started
asserting it.

### The site URL

`publicEnv.siteUrl` resolves in order: `NEXT_PUBLIC_SITE_URL`, then Vercel's
`VERCEL_PROJECT_PRODUCTION_URL` (stable across deploys) or `VERCEL_URL` (the
per-deployment preview host), then `http://localhost:3000`. A bare host gains
`https://`; an explicitly configured value that cannot parse throws with the
offending string rather than failing obscurely later.

Note the empty-string trap this exists to avoid: **Next inlines an unset
`NEXT_PUBLIC_*` as `""`, not `undefined`**, so `process.env.X ?? fallback`
never reaches its fallback. That is what made `new URL("")` throw during
prerender and took down every deployment. Use the `read()` helper in
`lib/env.ts` — never `??` — for any public variable with a default.

---

## Security

- The service role key is server-only and never reaches a client component;
  `src/lib/env.ts` throws if it is read in the browser.
- Every admin server action calls `requireAdmin()` before touching the store.
- The demo-mode session cookie is `httpOnly`, `sameSite=lax`, `secure` in
  production, and HMAC-signed with an expiry; password comparison is
  constant-time and an unset `ADMIN_PASSWORD` never means "everything matches".
- With no `ADMIN_PASSWORD` set, the dashboard opens in development only and is
  refused outright in production builds.
- Public form input is validated server-side with Zod regardless of what the
  browser did, plus a honeypot field that accepts silently rather than telling
  a bot why it failed.
- Query parameters are parsed through an allow-list before reaching the
  database.
- Sign-in failures never reveal whether an address exists.

---

## Known gaps

- **Image URLs are unverified.** See the note above — one command fixes it.
- **Legal pages are honest stubs, in both languages.** They say what the page
  is for and that it needs replacing, rather than inventing enforceable-looking
  terms. Have counsel write the real text — and have the Arabic reviewed by
  counsel in the jurisdictions where you actually operate, not translated from
  the English.
- **The Arabic has not been reviewed by a native-speaking editor.** It reads
  naturally and the terminology is consistent, but before launch it deserves
  the same pass any published copy gets.
- **The map is an OpenStreetMap embed**, lazy-loaded, so no mapping SDK or API
  key is on the critical path. Swap the `src` in `LocationMap` for a keyed
  provider if you need custom styling.
