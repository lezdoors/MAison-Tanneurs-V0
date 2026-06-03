# Maison Tanneurs — Rocco build

Hand-stitched leather from Marrakech. Numbered, never restocked.

Built by Rocco (2026-06-03) as an independent launch-ready site, separate from Turbo's `Maison-Tanneurs-luxury` repo and the main `maisontanneurs` site.

## Stack

- Next.js 16.0.10 (App Router, Turbopack) · React 19.2 · Tailwind 4
- Supabase project `xbtabpurfavngwmwtawc` (shared product catalog, read-only via service-role on the server)
- pnpm
- Total deps: 9 runtime, 7 dev (kept lean — no shadcn/ui, no framer-motion)

## Routes

| Route | Render | Notes |
|---|---|---|
| `/` | static (5min ISR) | 10-section homepage |
| `/products` | static (5min ISR) | Full edition grid (28 SKUs) |
| `/product/[slug]` | dynamic | PDP with reserve-via-mailto |
| `/atelier` | static | 6-chapter atelier story |
| `/heritage` | static | 5-chapter heritage story |
| `/sitemap.xml` | dynamic | Generated from Supabase products |
| `/robots.txt` | static | Allow all, point at sitemap |

## Homepage section flow

1. `HeroCarousel` — 4-beat cinematic carousel (3 stills + 1 video)
2. `ObjectOfTheEdition` — one hero object on plate, Reserve + Dossier CTAs
3. `FeaturedEdition` — three additional pieces, centered
4. `EditorialFilm` — hands-at-work chapter opener
5. `Craftsmanship` — Cut · Stitch · Finish on warm dark stone
6. `BatchGuarantee` — 07 hands / 14 days · Lifetime Repair
7. `Materials` — Leather · Brass · Thread
8. `HeritageStrip` — single quiet editorial band
9. `Newsletter` — single email field
10. `Footer`

No back-to-back carousels. No stat counters. No `text-white` on dark (Tailwind 4 `@theme` requires explicit `--color-white` declaration — handled).

## Brand palette (in `app/globals.css`)

Polène-tier warm neutrals — never pure white / pure black.

```
--color-paper       #f8f6f1   page bg
--color-paper-alt   #e8e4d9   alt section bg
--color-plate       #f3f0e9   product tile plate
--color-ink         #2c2a28   primary type (warm charcoal)
--color-warm-black  #1f1d1b   dark sections + footer
--color-ivory       #f7f5ee   type on dark
--color-cognac      #7a4a2b   accent only (never a fill)
--color-bronze      #8c7a5a   eyebrow on light
--color-oxblood     #5e1f24   reserved for emphasis
```

## Data layer

`lib/supabase.ts` — server-side reads only (RSC pattern, service-role key, no client JS).

- `fetchAllProducts()` — full Product[] with images[]
- `fetchAllProductCards()` — lightweight cards (images[0] only) — use this for grids
- `fetchFeaturedProducts(limit)` — featured rows or fallback to recent
- `fetchProductBySlug(slug)` — single product
- `productHero(p)` / `productSecondary(p)` / `formatPrice(cents)` / `productNumber(p)` — view helpers
- `productNumber(p)` reads from a slug → MT-BAG-NNN map (Airtable canonical IDs)

Hidden SKUs: `test-e2e` only. All 26 published SKUs ship to grids and PDPs.

## Assets

- 16 stills + 4 videos encoded from Google Drive into `public/tanneurs/`
- Encode script: `scripts/encode-drive-assets.py` (re-runnable, idempotent)
- OG image at `public/og-image.jpg` (1200×630, generated from white-ryad hero)
- Product images served via Supabase Storage CDN (proxied through Next/Image)

## Local dev

```bash
pnpm install
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
pnpm dev                            # http://localhost:3000
```

Service-role key for `xbtabpurfavngwmwtawc` lives at `~/.rocco/maisontanneurs-supabase.json` (Rocco machine).

## Production env (to set at deploy time)

| Var | Required | Source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | `https://xbtabpurfavngwmwtawc.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Rocco vault |
| `NEXT_PUBLIC_SITE_URL` | yes | Actual deployed URL — used for metadata + sitemap |
| `TELEGRAM_BOT_TOKEN` | optional | Same as main site — Sensitive on Vercel |
| `TELEGRAM_CHAT_ID` | optional | Same as main site |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | optional | New Sentry project for this repo |

## Known deferred work (before launch)

- [ ] **Domain decision** — currently `maison-tanneurs.local`. Pick: existing `maisontanneurs.com`, new domain, or stay on preview.
- [ ] **Vercel project name** — `maison-tanneurs` is taken (Turbo's). Suggest `maison-tanneurs-mt` or `mt-launch`.
- [ ] **Stripe pre-orders** — currently mailto-only. Wire `STRIPE_SECRET_KEY` + payment intent for the 4 Hero-Approved SKUs (MT-BAG-025/026/027/028).
- [ ] **Sentry** — install `@sentry/nextjs` + wire DSN at deploy time. Pattern in main site `instrumentation.ts`.
- [ ] **Meta Pixel** — re-use existing pixel id `26891834623830253` or new one.
- [ ] **Real OG image** — current is auto-cropped hero, could commission a dedicated 1200×630 cinematic.
- [ ] **/products filtering** — currently shows all 26. Could add category filter (Crossbody / Tote / Rucksack / Duffle / Briefcase / Weekender).
- [ ] **Search** — nav has no search wired (no need yet at 26 SKUs).

## Audit findings (vs Turbo's backup)

See `Raccordement Ops/ROCCO-AUDIT-2026-06-03-MAISON-TANNEURS-LUXURY.md` in Drive. Key wins of this build over Turbo's:

- No §2 LifestyleCarousel duplicate (Turbo rebuilt that section 3×)
- No §5 CollectionGrid duplicate (Turbo had 2 product grids on the homepage)
- BatchGuarantee component ported from main site (strongest editorial moment)
- HeritageStrip replaces stat counters (Turbo's "2026 / 7 / 14" reads v0)
- Bespoke `@theme` palette (Turbo used generic Tailwind defaults)
- No dead routes (`/account/*`, `/checkout` not in this repo)
- Service-role server reads (Turbo uses anon client-side, larger bundle)
