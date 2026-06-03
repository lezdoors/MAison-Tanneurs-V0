import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
// Server-only key. All product reads happen in RSCs (no client fetching in reserve-mode),
// so we use the service role and never ship a client-side anon key.
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})

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

const HIDDEN_SKUS = new Set<string>(["test-e2e"])
const PUBLISHED_STATUSES = new Set(["available", "reserved"])

export async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,title,slug,description,price,images,category,status,featured,available_quantity,created_at,updated_at,dimensions,materials")
    .in("status", ["available", "reserved"])
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100)
  if (error || !data) return []
  return (data as Product[]).filter((p) => !HIDDEN_SKUS.has(p.slug) && PUBLISHED_STATUSES.has(p.status))
}

/* Lightweight card shape — used by listing pages where we don't need the
   full 9-image array per card. Reduces RSC payload meaningfully. */
export type ProductCard = Pick<
  Product,
  "id" | "title" | "slug" | "category" | "price" | "featured" | "status"
> & { image: string }

export async function fetchAllProductCards(): Promise<ProductCard[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,title,slug,category,price,featured,status,images")
    .in("status", ["available", "reserved"])
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100)
  if (error || !data) return []
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
      image: (p.images && p.images[0]) || "/placeholder.svg",
    }))
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (HIDDEN_SKUS.has(slug)) return null
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle()
  if (error || !data) return null
  const p = data as Product
  return PUBLISHED_STATUSES.has(p.status) ? p : null
}

export async function fetchFeaturedProducts(limit = 6): Promise<Product[]> {
  // Direct query — featured rows only, narrow column list so the RSC payload
  // doesn't ship every product's 9-image array down to the client.
  const { data } = await supabase
    .from("products")
    .select("id,title,slug,description,price,images,category,status,featured,available_quantity,created_at,updated_at,dimensions,materials")
    .in("status", ["available", "reserved"])
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (!data || data.length === 0) {
    // Fallback when no rows are flagged featured — first N published.
    const { data: any2 } = await supabase
      .from("products")
      .select("id,title,slug,description,price,images,category,status,featured,available_quantity,created_at,updated_at,dimensions,materials")
      .in("status", ["available", "reserved"])
      .order("created_at", { ascending: false })
      .limit(limit)
    return (any2 || []).filter((p) => !HIDDEN_SKUS.has(p.slug)) as Product[]
  }
  return (data as Product[]).filter((p) => !HIDDEN_SKUS.has(p.slug))
}

// Every SKU has `<slug>-pdp-white.webp` as images[0] (canonical plate shot).
// Editorial heroes (lifestyle/atelier framing) ship later as a per-slug manifest.
export function productHero(p: Product): string {
  return p.images?.[0] || "/placeholder.svg"
}

export function productSecondary(p: Product): string {
  return p.images?.[1] || p.images?.[0] || "/placeholder.svg"
}

// Supabase stores prices in cents.
export function formatPrice(cents: number): string {
  const usd = cents / 100
  return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// Stable slug → MT-BAG-NNN map (canonical from Airtable, not synced to Supabase yet).
// Used on PDP to show "Numbered MT-BAG-019" line. Slugs missing here just hide the badge.
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
