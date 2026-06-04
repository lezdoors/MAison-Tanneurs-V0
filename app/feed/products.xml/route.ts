import { fetchAllProducts, productHero } from "@/lib/supabase"

// Google Shopping XML feed — consumed by the Meta catalog
// (id 2049254192386658) on its daily 04:00 Europe/Paris replace.
// Same schema as main maisontanneurs.com/feed/products.xml so the
// catalog reads the same shape regardless of which site the domain
// points at.
//
// Per-product output:
//   <g:id>          — Supabase slug (retailer_id in Meta catalog)
//   <g:title>       — product title
//   <g:description> — escaped Supabase description (full-grain… 14-day…)
//   <g:link>        — /products/<slug> on the canonical site
//   <g:image_link>  — first Supabase Storage URL (pdp-white plate)
//   <g:additional_image_link> — 2..9, all remaining shots
//   <g:availability>, <g:condition>, <g:price>, <g:brand>, <g:product_type>
//
// 1-hour cache because Meta replaces daily; intra-day price/stock
// edits propagate within an hour without manual purge.

export const runtime = "nodejs"
export const revalidate = 3600
export const dynamic = "force-static"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://maisontanneurs.com"

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function cdata(s: string): string {
  // Wrap descriptions in CDATA so dashes / quotes / em-dashes pass cleanly.
  return `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`
}

export async function GET() {
  const products = await fetchAllProducts()
  const base = SITE_URL.replace(/\/$/, "")

  const items = products
    .map((p) => {
      const slug = p.slug
      const heroUrl = productHero(p).startsWith("http")
        ? productHero(p)
        : `${base}${productHero(p)}`
      const rest = (p.images || []).slice(1, 9)
      const additionalImages = rest
        .map((u) => `      <g:additional_image_link>${esc(u)}</g:additional_image_link>`)
        .join("\n")
      const price = (p.price / 100).toFixed(2)
      return `    <item>
      <g:id>${esc(slug)}</g:id>
      <title>${esc(p.title)}</title>
      <description>${cdata(p.description || `${p.title} — hand-stitched in Marrakech, numbered, never restocked.`)}</description>
      <link>${esc(`${base}/products/${slug}`)}</link>
      <g:image_link>${esc(heroUrl)}</g:image_link>
${additionalImages}
      <g:availability>${p.available_quantity > 0 ? "in stock" : "out of stock"}</g:availability>
      <g:condition>new</g:condition>
      <g:price>${price} USD</g:price>
      <g:brand>Maison Tanneurs</g:brand>
      <g:product_type>${esc(p.category || "Leather Goods")}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping_weight>${(p.weight_lbs || 5).toFixed(2)} lb</g:shipping_weight>
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Maison Tanneurs — Product Catalog</title>
    <link>${base}</link>
    <description>Hand-stitched full-grain leather goods, made in Marrakech.</description>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
