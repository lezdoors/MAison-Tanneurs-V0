import { permanentRedirect } from "next/navigation"

// Catalog product URLs (Meta + main maisontanneurs feed) use the
// PLURAL form /products/<slug>. V0's canonical PDP lives at the
// singular /product/<slug>. 301-permanent here so the ad click,
// the catalog crawler, and any pasted link all land on the same
// canonical URL with no SEO leak.
export default async function ProductsSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  permanentRedirect(`/product/${slug}`)
}
