import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { BuyButton } from "@/components/BuyButton"
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
  const p = await fetchProductBySlug(slug)
  if (!p) return { title: "Not found" }
  return {
    title: p.title,
    description: p.description ?? `${p.title} — hand-stitched in Marrakech, numbered, never restocked.`,
    openGraph: { images: [productHero(p)] },
  }
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

  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-28 lg:pt-32 pb-6">
        <nav className="tech-meta">
          <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">Home</Link>
          <span className="mx-3">·</span>
          <Link href="/products" className="hover:text-[var(--color-ink)] transition-colors">Edition</Link>
          <span className="mx-3">·</span>
          <span className="text-[var(--color-ink)]">{product.title}</span>
        </nav>
      </div>

      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-20 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7 space-y-6">
            {gallery.map((src, i) => (
              <div key={i} className="relative w-full aspect-[4/5] overflow-hidden bg-[var(--color-plate)]">
                <Image
                  src={src}
                  alt={`${product.title} — view ${i + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority={i === 0}
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-10">
              <div>
                <p className="tech-meta mb-4">{product.category}</p>
                <h1 className="font-display text-[clamp(28px,4vw,52px)] leading-[1.05] tracking-[-0.012em] mb-6 text-balance">
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

              <BuyButton
                slug={product.slug}
                title={product.title}
                price={product.price}
                number={number}
              />

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
      </section>

      {!!related.length && (
        <section className="border-t border-[var(--color-rule)] py-20 lg:py-28 px-6 lg:px-10">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="font-display text-2xl lg:text-3xl text-center mb-12">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
              {related.map((p) => (
                <Link key={p.slug} href={`/product/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-plate)] mb-4">
                    <Image
                      src={productHero(p)}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                  <p className="tech-meta mb-1.5">{p.category}</p>
                  <h3 className="font-display text-lg">{p.title}</h3>
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
