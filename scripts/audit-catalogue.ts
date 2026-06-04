// Launch-readiness gate — runs as `prebuild` so a broken catalogue can't ship.
//
// Rules:
//   1. At least 1 published SKU (status in 'available' or 'reserved')
//   2. Every published SKU has: title, slug, price > 0, images[] non-empty
//   3. Slug matches lowercase-kebab-case
//   4. If slug is in HERO_OVERRIDES, the local /public/tanneurs/products/<slug>.webp
//      exists on disk (curated Drive Hero override)
//
// Local dev (no Supabase env): skip with warning, exit 0 so `pnpm dev`/`build`
// still work without secrets. On Vercel/CI the env vars are set and the gate
// runs for real.
//
// Run directly: pnpm tsx scripts/audit-catalogue.ts

import { createClient } from "@supabase/supabase-js"
import { access, constants } from "node:fs/promises"
import { join } from "node:path"

// Load .env.local manually — tsx doesn't load it automatically the way Next
// does at runtime. Built into Node 20.12+ as process.loadEnvFile().
try {
  process.loadEnvFile(".env.local")
} catch {
  // No .env.local — fine for CI where env vars come from the platform.
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""

// Mirrors HERO_OVERRIDES in lib/supabase.ts. Kept in sync manually — when
// you add a slug there, add it here too.
const HERO_OVERRIDES = new Set<string>([
  "atlas-briefcase-vintage",
  "atlas-field-briefcase",
  "atlas-kilim-duffle",
  "atlas-kilim-rucksack",
  "atlas-messenger-laptop",
  "atlas-weekender-cognac",
  "classic-cognac-satchel",
  "cognac-brogue-backpack",
  "expedition-rolltop-cognac",
  "expedition-rolltop-noir",
  "explorer-rolltop-cognac",
  "heritage-rucksack",
  "marrakech-tote-cognac",
  "medina-cargo-rucksack-cognac",
  "medina-crossbody-clasp-teal",
  "medina-crossbody-cognac",
  "medina-crossbody-envelope",
  "medina-crossbody-tooled-walnut",
  "medina-duffle",
  "medina-market-tote-cognac",
  "medina-rucksack-drawstring",
  "medina-rucksack-flap-chocolate",
  "medina-saddlebag-tooled-cognac",
  "medina-zigzag-tote-chocolate",
  "oasis-weekender-oxblood",
  "vintage-buckle-backpack",
  "vintage-satchel-light-brown",
  "woven-leather-backpack",
])

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Mirrors HIDDEN_SKUS in lib/supabase.ts. These are status='available' rows
// in Supabase that are gated from the storefront (no curated Hero yet, or
// known-bad placeholder) — the audit must skip them too, else the gate
// flags rows the site already correctly hides.
const HIDDEN_SKUS = new Set<string>([
  "test-e2e",
  "rolltop-daypack",
  "black-stitched-backpack",
  "marrakech-tote-bordeaux",
  "marrakech-tote-noir",
  "medina-crossbody-tassel",
  "explorer-rolltop-noir",
])

interface Product {
  id: string
  title: string
  slug: string
  price: number
  images: string[] | null
  status: string
}

async function main(): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[audit] NEXT_PUBLIC_SUPABASE_URL or key unset — skipping live audit (local dev mode)")
    return
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_KEY)
  const { data, error } = await sb
    .from("products")
    .select("id,title,slug,price,images,status")
    .in("status", ["available", "reserved"])
    .limit(200)

  if (error) {
    console.error(`[audit] Supabase query failed:`, error.message)
    process.exit(1)
  }

  const products = (data || []) as Product[]
  if (products.length === 0) {
    console.error(`[audit] No published SKUs found in Supabase`)
    process.exit(1)
  }

  const publicRoot = join(process.cwd(), "public")
  const failures: string[] = []
  let overrideFilesMissing = 0

  const visible = products.filter((p) => !HIDDEN_SKUS.has(p.slug || ""))
  console.log(`[audit] ${products.length} published, ${visible.length} visible after HIDDEN_SKUS filter`)

  for (const p of visible) {
    if (!p.title) failures.push(`${p.slug || p.id}: missing title`)
    if (!p.slug) failures.push(`${p.id}: missing slug`)
    else if (!SLUG_RE.test(p.slug)) failures.push(`${p.slug}: slug not lowercase-kebab-case`)
    if (typeof p.price !== "number" || p.price <= 0) failures.push(`${p.slug}: invalid price (${p.price})`)
    if (!p.images || p.images.length === 0) failures.push(`${p.slug}: images[] empty`)

    if (p.slug && HERO_OVERRIDES.has(p.slug)) {
      const filePath = join(publicRoot, "tanneurs", "products", `${p.slug}.webp`)
      try {
        await access(filePath, constants.R_OK)
      } catch {
        overrideFilesMissing++
        failures.push(`${p.slug}: HERO_OVERRIDES file missing at /tanneurs/products/${p.slug}.webp`)
      }
    }
  }

  console.log(`[audit] HERO_OVERRIDES files OK: ${HERO_OVERRIDES.size - overrideFilesMissing}/${HERO_OVERRIDES.size}`)

  if (failures.length > 0) {
    console.error(`\n[audit] ${failures.length} failures:`)
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }

  console.log(`[audit] All gates passed`)
}

main().catch((err) => {
  console.error(`[audit] crashed:`, err)
  process.exit(1)
})
