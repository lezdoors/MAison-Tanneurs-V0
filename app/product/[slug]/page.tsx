import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { BuyButton } from "@/components/BuyButton"
import { ProductDetails } from "@/components/ProductDetails"
import { ProductGallery } from "@/components/ProductGallery"
import { archiveProductBySlug, archiveProducts } from "@/lib/archive-products"
import {
  fetchProductBySlug,
  fetchAllProducts,
  formatPrice,
  productHero,
  productNumber,
} from "@/lib/supabase"

export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = (await fetchProductBySlug(slug)) || archiveProductBySlug(slug)
  if (!p) return { title: "Not found" }
  return {
    title: `${p.title} Dossier`,
    description: p.description ?? `${p.title} - hand-stitched in Marrakech, numbered, never restocked.`,
    openGraph: { images: [productHero(p)] },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = (await fetchProductBySlug(slug)) || archiveProductBySlug(slug)
  if (!product) notFound()

  const fetchedAll = await fetchAllProducts()
  const all = fetchedAll.length ? fetchedAll : archiveProducts
  const related = all.filter((p) => p.slug !== slug && p.category === product.category).slice(0, 3)
  const hero = productHero(product)
  const gallery = Array.from(new Set([hero, ...(product.images || [])])).slice(0, 6)
  const dimensions = Object.entries(product.dimensions || {})
  const materials = product.materials?.length ? product.materials : ["Full-grain bovine leather", "Solid brass hardware"]
  const number = productNumber(product) || "MT-BAG-000"

  return (
    <main className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <Navigation />

      <div className="max-w-[1500px] mx-auto px-5 sm:px-6 lg:px-10 pt-28 lg:pt-32 pb-6">
        <nav className="tech-meta border-y border-[var(--color-rule)] py-4">
          <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">Archive</Link>
          <span className="mx-3">/</span>
          <Link href="/products" className="hover:text-[var(--color-ink)] transition-colors">Object Register</Link>
          <span className="mx-3">/</span>
          <span className="text-[var(--color-ink)]">{number}</span>
        </nav>
      </div>

      <section data-nav-theme="dark" className="max-w-[1500px] mx-auto px-5 sm:px-6 lg:px-10 pb-20 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-t border-l border-[var(--color-rule)]">
          <div className="lg:col-span-7 border-r border-b border-[var(--color-rule)] bg-white p-4 lg:p-8">
            <ProductGallery images={gallery} title={product.title} />
          </div>

          <div className="lg:col-span-5 border-r border-b border-[var(--color-rule)]">
            <div className="lg:sticky lg:top-24">
              <div className="p-6 lg:p-10 border-b border-[var(--color-rule)]">
                <div className="flex items-center justify-between gap-5 mb-8">
                  <p className="tech-meta">{product.category}</p>
                  <p className="tech-meta">{number}</p>
                </div>
                <h1 className="font-display text-[clamp(34px,5vw,68px)] leading-[0.96] mb-8">
                  {product.title}
                </h1>
                <div className="grid grid-cols-2 gap-px bg-[var(--color-rule)] border border-[var(--color-rule)]">
                  {[
                    ["Price", formatPrice(product.price)],
                    ["Origin", "Marrakech"],
                    ["Edition", "Numbered"],
                    ["Service", "Lifetime repair"],
                  ].map(([key, value]) => (
                    <div key={key} className="bg-[var(--color-paper)] p-4">
                      <p className="tech-meta mb-2">{key}</p>
                      <p className="text-[13px] leading-snug">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 lg:p-10 border-b border-[var(--color-rule)]">
                <p className="tech-label mb-5">Object Dossier</p>
                {product.description && (
                  <p className="text-[15px] leading-[1.85] text-[var(--color-ink-soft)] max-w-[48ch]">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="p-6 lg:p-10 border-b border-[var(--color-rule)]">
                <BuyButton slug={product.slug} title={product.title} price={product.price} number={number} />
              </div>

              <div className="p-6 lg:p-10">
                <ProductDetails
                  items={[
                    { title: "Materials", content: materials },
                    ...(dimensions.length
                      ? [{ title: "Dimensions", content: dimensions.map(([k, v]) => `${k}: ${v}`) }]
                      : []),
                    {
                      title: "Care",
                      content: [
                        "Wipe with a soft cloth; avoid solvents and direct heat.",
                        "Treat once a year with a neutral leather conditioner.",
                        "Patina is intentional; full-grain leather darkens with use.",
                      ],
                    },
                    {
                      title: "Shipping & repair",
                      content: [
                        "Tracked worldwide express from Marrakech, typically 3-5 business days.",
                        "Numbered, made in limited quantity. 14-day return for unused pieces.",
                        "Lifetime repair: re-stitch, re-line, re-edge for the original owner.",
                      ],
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {!!related.length && (
        <section data-nav-theme="dark" className="border-t border-[var(--color-rule)] py-20 lg:py-28 px-5 sm:px-6 lg:px-10">
          <div className="max-w-[1500px] mx-auto">
            <div className="flex items-end justify-between gap-6 mb-10">
              <div>
                <span className="tech-label block mb-4">Adjacent Objects</span>
                <h2 className="font-display text-3xl lg:text-5xl leading-none">Same register.</h2>
              </div>
              <Link href="/products" className="archive-link hidden sm:inline text-[12px] uppercase tracking-[0.22em]">
                Full edition
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-l border-[var(--color-rule)]">
              {related.map((p) => (
                <Link key={p.slug} href={`/product/${p.slug}`} className="group border-r border-b border-[var(--color-rule)] p-5 lg:p-6">
                  <div className="relative aspect-[4/5] overflow-hidden bg-white mb-5">
                    <Image
                      src={productHero(p)}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      loading="lazy"
                      className="object-contain p-5 transition-transform duration-700 group-hover:scale-[1.015]"
                    />
                  </div>
                  <p className="tech-meta mb-2">{productNumber(p)}</p>
                  <h3 className="font-display text-xl leading-tight mb-2">{p.title}</h3>
                  <p className="text-sm text-[var(--color-ink-muted)]">{formatPrice(p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
