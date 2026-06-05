import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Lazy-init so a missing env var (e.g. on first deploy before vars are wired)
// doesn't crash the build at module-load. fetch* helpers degrade to [] / null.
let _client: SupabaseClient | null = null

function getClient(): SupabaseClient | null {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    if (typeof window === "undefined") {
      console.warn("[supabase] missing NEXT_PUBLIC_SUPABASE_URL or service-role key — product reads will return empty")
    }
    return null
  }
  _client = createClient(url, key, { auth: { persistSession: false } })
  return _client
}

export type Product = {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  images: string[]
  category: string
  dimensions: Record<string, string> | null
  materials: string[] | null
  available_quantity: number
  status: "available" | "sold" | "reserved" | "draft"
  featured: boolean
  launch_priority?: string | null
  weight_lbs?: number | null
  craftsman_id?: string | null
  created_at: string
  updated_at: string
}

const HIDDEN_SKUS = new Set<string>([
  "test-e2e",
  // Placeholder/legacy SKUs with no curated Drive Hero — they leak into
  // /products as supplier-flat pdp-white shots and break the editorial
  // consistency. Re-enable per-slug only after they get a Hero in Drive.
  "rolltop-daypack",            // 0 images — totally broken
  "black-stitched-backpack",    // 5 supplier shots only, no editorial
  "marrakech-tote-bordeaux",    // 1 placeholder shot
  "marrakech-tote-noir",        // 1 placeholder shot
  "medina-crossbody-tassel",    // 1 placeholder shot
  "explorer-rolltop-noir",      // 9 shots but no Drive Hero curated
])
const PUBLISHED_STATUSES = new Set(["available", "reserved"])

const FULL_COLS = "id,title,slug,description,price,images,category,status,featured,available_quantity,created_at,updated_at,dimensions,materials"

// Curated hero set — Drive's `usable product pics/<slug>/Hero-*.png`
// re-encoded into /public/tanneurs/products/<slug>.webp via
// scripts/encode-product-heroes.py. Wins over Supabase's flat pdp-white
// shot on grids + PDPs.
const HERO_OVERRIDES: Set<string> = new Set([
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
  // medina-rucksack-flap-chocolate: no Drive Hero yet — falls back to Supabase pdp-white shot
  "medina-saddlebag-tooled-cognac",
  "medina-zigzag-tote-chocolate",
  "oasis-weekender-oxblood",
  "vintage-buckle-backpack",
  "vintage-satchel-light-brown",
  "woven-leather-backpack",
])

export async function fetchAllProducts(): Promise<Product[]> {
  const sb = getClient()
  if (!sb) return []
  const { data } = await sb
    .from("products")
    .select(FULL_COLS)
    .in("status", ["available", "reserved"])
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100)
  if (!data) return []
  return (data as Product[]).filter((p) => !HIDDEN_SKUS.has(p.slug) && PUBLISHED_STATUSES.has(p.status))
}

/* Lightweight card shape — used by listing pages where we don't need the
   full 9-image array per card. Reduces RSC payload meaningfully. */
export type ProductCard = Pick<
  Product,
  "id" | "title" | "slug" | "category" | "price" | "featured" | "status"
> & { image: string }

export async function fetchAllProductCards(): Promise<ProductCard[]> {
  const sb = getClient()
  if (!sb) return []
  const { data } = await sb
    .from("products")
    .select("id,title,slug,category,price,featured,status,images")
    .in("status", ["available", "reserved"])
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100)
  if (!data) return []
  return data
    .filter((p) => !HIDDEN_SKUS.has(p.slug) && PUBLISHED_STATUSES.has(p.status))
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      price: p.price,
      featured: p.featured,
      status: p.status,
      // Cards use the curated Drive Hero when available — same source-of-truth
      // as productHero() — otherwise fall back to Supabase pdp-white.
      image: HERO_OVERRIDES.has(p.slug)
        ? `/tanneurs/products/${p.slug}.webp`
        : (p.images && p.images[0]) || "/placeholder.svg",
    }))
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (HIDDEN_SKUS.has(slug)) return null
  const sb = getClient()
  if (!sb) return null
  const { data } = await sb.from("products").select("*").eq("slug", slug).maybeSingle()
  if (!data) return null
  const p = data as Product
  return PUBLISHED_STATUSES.has(p.status) ? p : null
}

export async function fetchFeaturedProducts(limit = 6): Promise<Product[]> {
  const sb = getClient()
  if (!sb) return []
  const { data } = await sb
    .from("products")
    .select(FULL_COLS)
    .in("status", ["available", "reserved"])
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (!data || data.length === 0) {
    const { data: any2 } = await sb
      .from("products")
      .select(FULL_COLS)
      .in("status", ["available", "reserved"])
      .order("created_at", { ascending: false })
      .limit(limit)
    return (any2 || []).filter((p) => !HIDDEN_SKUS.has(p.slug)) as Product[]
  }
  return (data as Product[]).filter((p) => !HIDDEN_SKUS.has(p.slug))
}

export function productHero(p: Product): string {
  if (HERO_OVERRIDES.has(p.slug)) return `/tanneurs/products/${p.slug}.webp`
  return p.images?.[0] || "/placeholder.svg"
}

export function productSecondary(p: Product): string {
  return p.images?.[1] || p.images?.[0] || "/placeholder.svg"
}

// Display in USD to align with: (a) the Meta catalog feed which is
// USD-denominated, (b) the USD ad account, (c) main maisontanneurs.com
// which is also USD. A mismatched display vs ad-catalog currency drops
// conversion AND can trigger Meta policy flags for misleading pricing.
// Revolut still auto-FX-settles to GBP on the Akal merchant.
export function formatPrice(cents: number): string {
  const usd = cents / 100
  return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// Stable slug → MT-BAG-NNN map (Airtable canonical IDs, not synced to Supabase).
const PRODUCT_NUMBERS: Record<string, string> = {
  "atlas-briefcase-vintage": "MT-BAG-001",
  "atlas-field-briefcase": "MT-BAG-002",
  "atlas-kilim-duffle": "MT-BAG-003",
  "atlas-kilim-rucksack": "MT-BAG-004",
  "atlas-messenger-laptop": "MT-BAG-005",
  "atlas-weekender-cognac": "MT-BAG-006",
  "classic-cognac-satchel": "MT-BAG-007",
  "cognac-brogue-backpack": "MT-BAG-008",
  "expedition-rolltop-cognac": "MT-BAG-009",
  "expedition-rolltop-noir": "MT-BAG-010",
  "explorer-rolltop-cognac": "MT-BAG-011",
  "heritage-rucksack": "MT-BAG-012",
  "marrakech-tote-cognac": "MT-BAG-013",
  "medina-crossbody-cognac": "MT-BAG-014",
  "medina-crossbody-envelope": "MT-BAG-015",
  "medina-crossbody-tooled-walnut": "MT-BAG-016",
  "medina-duffle": "MT-BAG-017",
  "medina-rucksack-drawstring": "MT-BAG-018",
  "medina-rucksack-flap-chocolate": "MT-BAG-019",
  "medina-saddlebag-tooled-cognac": "MT-BAG-020",
  "oasis-weekender-oxblood": "MT-BAG-021",
  "vintage-buckle-backpack": "MT-BAG-022",
  "vintage-satchel-light-brown": "MT-BAG-023",
  "woven-leather-backpack": "MT-BAG-024",
  "medina-cargo-rucksack-cognac": "MT-BAG-025",
  "medina-crossbody-clasp-teal": "MT-BAG-026",
  "medina-market-tote-cognac": "MT-BAG-027",
  "medina-zigzag-tote-chocolate": "MT-BAG-028",
}

export function productNumber(p: Product): string {
  return PRODUCT_NUMBERS[p.slug] || ""
}
