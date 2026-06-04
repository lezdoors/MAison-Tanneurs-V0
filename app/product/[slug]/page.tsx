import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { BuyButton } from "@/components/BuyButton"
import { JsonLd } from "@/components/JsonLd"
import {
  fetchProductBySlug,
  fetchAllProducts,
  formatPrice,
  productHero,
  productNumber,
} from "@/lib/supabase"

export const revalidate = 300

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.maisontanneurs.com"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await fetchProductBySlug(slug)
  if (!p) return { title: "Not found" }
  const hero = productHero(p)
  const heroAbs = hero.startsWith("http") ? hero : `${SITE_URL}${hero}`
  return {
    title: p.title,
    description: p.description ?? `${p.title} — hand-stitched in Marrakech, numbered, never restocked.`,
    alternates: { canonical: `${SITE_URL}/product/${p.slug}` },
    openGraph: {
      title: `${p.title} · Maison Tanneurs`,
      description: p.description ?? undefined,
      url: `${SITE_URL}/product/${p.slug}`,
      siteName: "Maison Tanneurs",
      images: [heroAbs],
      type: "website",
    },
    twitter: { card: "summary_large_image", images: [heroAbs] },
  }
}

// Per-image alt context — generic numbered alts are the bare minimum.
// When the gallery has the canonical 6 ordering (front 3/4, side, macro,
// interior, hardware, scale) the labels read better. Fallback stays
// "view N of M" if we ever ship a SKU with a different gallery sequence.
const ALT_LABELS = [
  "front three-quarter",
  "side profile",
  "macro stitching detail",
  "interior",
  "hardware detail",
  "scale with figure",
]

function altFor(title: string, i: number, total: number): string {
  const label = i < ALT_LABELS.length ? ALT_LABELS[i] : `view ${i + 1}`
  return `${title} — ${label} (${i + 1} of ${total})`
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await fetchProductBySlug(slug)
  if (!product) notFound()

  const all = await fetchAllProducts()
  const related = all.filter((p) => p.slug !== slug && p.category === product.category).slice(0, 3)
  const gallery = (product.images?.length ? product.images : [productHero(product)]).slice(0, 6)
  const dimensions = Object.entries(product.dimensions || {})
  const materials = product.materials?.length ? product.materials : ["Full-grain bovine leather", "Solid brass hardware"]
  const number = productNumber(product)
  const heroForSchema = productHero(product)
  const heroForSchemaAbs = heroForSchema.startsWith("http") ? heroForSchema : `${SITE_URL}${heroForSchema}`

  // JSON-LD: Product schema + BreadcrumbList. Surfaces to Google rich
  // results and is heavily relied on by AI search (Perplexity, ChatGPT
  // browse) for citation-quality answers about products.
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || `${product.title} — hand-stitched in Marrakech, numbered, never restocked.`,
    image: heroForSchemaAbs,
    sku: number || product.slug,
    mpn: number || product.slug,
    brand: { "@type": "Brand", name: "Maison Tanneurs" },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "EUR",
      price: (product.price / 100).toFixed(2),
      availability: product.status === "available"
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Maison Tanneurs" },
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Edition", item: `${SITE_URL}/products` },
      { "@type": "ListItem", position: 3, name: product.title, item: `${SITE_URL}/product/${product.slug}` },
    ],
  }

  return (
    <main className="min-h-screen pb-20 lg:pb-0">
      <Navigation />

      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Breadcrumb — desktop visible; on mobile compressed */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-24 lg:pt-32 pb-3 lg:pb-6">
        <nav className="tech-meta">
          <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">Home</Link>
          <span className="mx-2 lg:mx-3">·</span>
          <Link href="/products" className="hover:text-[var(--color-ink)] transition-colors">Edition</Link>
          <span className="mx-2 lg:mx-3 hidden sm:inline">·</span>
          <span className="text-[var(--color-ink)] hidden sm:inline">{product.title}</span>
        </nav>
      </div>

      <section className="lg:max-w-[1400px] lg:mx-auto lg:px-10 pb-16 lg:pb-32">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          {/* ── Gallery: horizontal scroll-snap on mobile, vertical stack on desktop ── */}
          <div className="lg:col-span-7 lg:space-y-6">
            <div
              className="
                flex lg:block
                overflow-x-auto lg:overflow-visible
                snap-x snap-mandatory lg:snap-none
                gap-3 lg:gap-0
                px-6 lg:px-0
                pb-3 lg:pb-0
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {gallery.map((src, i) => (
                <div
                  key={i}
                  className="
                    relative shrink-0 lg:shrink
                    w-[88vw] lg:w-full
                    aspect-[4/5]
                    snap-center lg:snap-none
                    overflow-hidden
                    bg-[var(--color-plate)]
                    lg:mb-0
                  "
                >
                  <Image
                    src={src}
                    alt={altFor(product.title, i, gallery.length)}
                    fill
                    sizes="(max-width: 1024px) 88vw, 58vw"
                    priority={i === 0}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="lg:hidden tech-meta text-center pt-2 pb-1">
              {gallery.length} {gallery.length === 1 ? "view" : "views"} · swipe to browse
            </p>
          </div>

          {/* ── Info column ── */}
          <div className="lg:col-span-5 px-6 lg:px-0 mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-28 space-y-8 lg:space-y-10">
              <div>
                <p className="tech-meta mb-3 lg:mb-4">{product.category}</p>
                <h1 className="font-display text-[clamp(26px,4vw,52px)] leading-[1.05] tracking-[-0.012em] mb-5 lg:mb-6 text-balance">
                  {product.title}
                </h1>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="font-display text-2xl">{formatPrice(product.price)}</span>
                  {number && (
                    <>
                      <span className="h-4 w-px bg-[var(--color-rule)]" />
                      <span className="tech-meta">{number}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">Numbered. Made in Marrakech.</p>
              </div>

              {product.description && (
                <p className="text-[15px] leading-[1.8] text-[var(--color-ink-soft)] max-w-[46ch]">
                  {product.description}
                </p>
              )}

              {/* Desktop-only inline buy block — mobile uses sticky bar at bottom */}
              <div className="hidden lg:block">
                <BuyButton
                  slug={product.slug}
                  title={product.title}
                  price={product.price}
                  number={number}
                />
              </div>

              {/* Mobile accordions — compress vertical space */}
              <div className="lg:hidden divide-y divide-[var(--color-rule)]">
                <details className="group py-4" open>
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="tech-label">Materials</span>
                    <span className="text-[var(--color-ink-muted)] text-lg group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <ul className="mt-3 space-y-2 text-sm">
                    {materials.map((m) => (
                      <li key={m} className="text-[var(--color-ink-soft)]">{m}</li>
                    ))}
                  </ul>
                </details>

                {!!dimensions.length && (
                  <details className="group py-4">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <span className="tech-label">Dimensions</span>
                      <span className="text-[var(--color-ink-muted)] text-lg group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      {dimensions.map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-[var(--color-rule)] py-1.5">
                          <dt className="tech-meta">{k}</dt>
                          <dd className="text-[var(--color-ink)]">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                )}

                <details className="group py-4">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="tech-label">Shipping &amp; Repair</span>
                    <span className="text-[var(--color-ink-muted)] text-lg group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="mt-3 space-y-3 text-sm text-[var(--color-ink-soft)] leading-relaxed">
                    <p>
                      Hand-prepared in Marrakech. Free worldwide shipping by tracked express courier.
                      Most orders arrive in 3–5 business days.
                    </p>
                    <p>
                      <Link href="/terms#lifetime-repair" className="underline underline-offset-4">
                        Lifetime repair guarantee
                      </Link>{" "}
                      — re-stitch, re-line, re-edge for the original owner.
                    </p>
                  </div>
                </details>
              </div>

              {/* Desktop materials + dimensions */}
              <div className="hidden lg:block space-y-8">
                <div>
                  <h2 className="tech-label mb-3">Materials</h2>
                  <ul className="space-y-2 text-sm">
                    {materials.map((m) => (
                      <li key={m} className="text-[var(--color-ink-soft)]">{m}</li>
                    ))}
                  </ul>
                </div>

                {!!dimensions.length && (
                  <div>
                    <h2 className="tech-label mb-3">Dimensions</h2>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      {dimensions.map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-[var(--color-rule)] py-1.5">
                          <dt className="tech-meta">{k}</dt>
                          <dd className="text-[var(--color-ink)]">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── You may also like — horizontal scroll on mobile, 3-up grid on desktop ── */}
      {!!related.length && (
        <section className="border-t border-[var(--color-rule)] py-16 lg:py-28 lg:px-10">
          <div className="lg:max-w-[1400px] lg:mx-auto">
            <h2 className="font-display text-2xl lg:text-3xl text-center mb-8 lg:mb-12">You may also like</h2>
            <div
              className="
                flex lg:grid lg:grid-cols-3
                gap-4 lg:gap-12
                overflow-x-auto lg:overflow-visible
                snap-x snap-mandatory lg:snap-none
                px-6 lg:px-0
                pb-2 lg:pb-0
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/product/${p.slug}`}
                  className="group block flex-shrink-0 w-[72vw] sm:w-[44vw] lg:w-auto snap-center lg:snap-none"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-plate)] mb-3 lg:mb-4">
                    <Image
                      src={productHero(p)}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 72vw, (max-width: 1024px) 44vw, 33vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                  <p className="tech-meta mb-1">{p.category}</p>
                  <h3 className="font-display text-base lg:text-lg leading-tight">{p.title}</h3>
                  <p className="text-sm text-[var(--color-ink-muted)] mt-1">{formatPrice(p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />

      {/* Mobile sticky CTA — always reachable */}
      <BuyButton
        slug={product.slug}
        title={product.title}
        price={product.price}
        number={number}
        variant="sticky"
      />
    </main>
  )
}
