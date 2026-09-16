# DENGLER

Premium real estate and investment platform for villas, hotels and land.

Built on Next.js 16 (App Router) with TypeScript, Tailwind CSS v4 and Framer
Motion. Runs against Supabase/Postgres when configured, and against a bundled
demo catalogue when it isn't — so `npm run dev` gives you a complete, working
platform with no setup at all.

---

## A note on what this repository was before

This repository contained a single `README.md` with the word "DENGLER" in it.
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
villas, hotels and land, a working search, a working enquiry pipeline and a
working admin dashboard, all served from memory.

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

### End-to-end checks

```bash
npm run build
PORT=3100 ADMIN_PASSWORD=secret ADMIN_SESSION_SECRET=$(openssl rand -hex 32) npm start &
BASE_URL=http://127.0.0.1:3100 ADMIN_PASSWORD=secret npm run test:e2e
```

Covers every route, console errors and uncaught exceptions, search URL
round-tripping, form validation, the gallery lightbox, horizontal overflow at
320/390/768/1440, the sticky investment rail, and the full admin flow from
guard to sign-out. Set `SHOT_DIR` to capture screenshots as it goes.

---

## Architecture

```
src/
  app/
    page.tsx                     Home
    properties/                  Listing + /[slug] detail
    villas/ hotels/ land/        Category pages (one shared implementation)
    investments/                 Portfolio comparison
    about/ contact/ legal/[slug]
    admin/
      login/                     Unguarded
      (protected)/               Route group — the auth guard lives on its layout
    actions/                     Server actions (inquiries, admin)
    sitemap.ts  robots.ts
  components/
    home/                        Hero, stats, categories, investment, CTA
    property/                    Card, grid, search, gallery, investment panel
    site/                        Navbar, footer, transitions, reveals, images
    admin/                       Dashboard UI
    ui/                          Icons
  lib/
    store/                       Data layer — see below
    data/                        Seed catalogue + image registry
    types.ts format.ts query.ts auth.ts env.ts i18n.ts site.ts
  styles/globals.css             Design system
supabase/migrations/             Schema + RLS
```

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
  `text-start` — never `left`/`right`. Flipping `dir="rtl"` on `<html>` mirrors
  the entire layout with no second stylesheet. See `src/lib/i18n.ts` for the
  three steps to add Arabic.
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
and re-encoded to AVIF/WebP by Next. `SmartImage` adds a warm blur-up, a fade
on decode, and a branded fallback plate so a dead URL reads as intentional
rather than broken.

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
`GeoCoordinates` and `QuantitativeValue`; a generated `sitemap.xml` covering
every published slug; and a `robots.txt` that keeps `/admin` out of the index.
Property pages are prerendered at build time via `generateStaticParams` and
revalidated hourly.

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
- **Legal pages are honest stubs.** They say what the page is for and that it
  needs replacing, rather than inventing enforceable-looking terms. Have
  counsel write the real text.
- **Arabic is scaffolded, not shipped.** The layout is RTL-ready and the seam
  is a single function; the dictionary and an Arabic display face are not.
- **The map is an OpenStreetMap embed**, lazy-loaded, so no mapping SDK or API
  key is on the critical path. Swap the `src` in `LocationMap` for a keyed
  provider if you need custom styling.
