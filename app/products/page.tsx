import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { archiveProductCards } from "@/lib/archive-products"
import { fetchAllProductCards, formatPrice } from "@/lib/supabase"

export const revalidate = 300

export const metadata = {
  title: "Object Register",
  description: "Every Maison Tanneurs piece, numbered and hand-stitched in Marrakech.",
}

const LEDGER = [
  ["Origin", "Marrakech atelier"],
  ["Edition", "Numbered small run"],
  ["Materials", "Full-grain leather / brass / waxed linen"],
  ["Service", "Lifetime repair promise"],
]

export default async function ProductsPage() {
  const fetched = await fetchAllProductCards()
  const products = fetched.length ? fetched : archiveProductCards
  const categories = Array.from(new Set(products.map((product) => product.category))).slice(0, 6)

  return (
    <main className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <Navigation />

      <section data-nav-theme="dark" className="px-5 sm:px-6 lg:px-10 pt-28 lg:pt-36 pb-10">
        <div className="max-w-[1500px] mx-auto border-y border-[var(--color-rule)]">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 py-10 lg:py-14 lg:pr-12">
              <span className="tech-label block mb-8">Object Register / 2026</span>
              <h1 className="font-display text-[clamp(42px,7vw,104px)] leading-[0.94] max-w-4xl">
                The edition, indexed.
              </h1>
            </div>
            <div className="lg:col-span-5 lg:border-l border-[var(--color-rule)] py-8 lg:py-14 lg:pl-10">
              <p className="text-[14px] leading-[1.85] text-[var(--color-ink-soft)] max-w-md mb-8">
                {products.length} registered leather objects. Each piece is cut, stitched, finished, and numbered in Marrakech.
              </p>
              <div className="grid grid-cols-2 gap-px bg-[var(--color-rule)] border border-[var(--color-rule)]">
                {LEDGER.map(([key, value]) => (
                  <div key={key} className="bg-[var(--color-paper)] p-4">
                    <p className="tech-meta mb-2">{key}</p>
                    <p className="text-[13px] leading-snug">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-nav-theme="dark" className="px-5 sm:px-6 lg:px-10 pb-12">
        <div className="max-w-[1500px] mx-auto flex flex-wrap gap-2 border-b border-[var(--color-rule)] pb-5">
          <span className="tech-meta mr-3 py-2">Index</span>
          <span className="border border-[var(--color-ink)] px-4 py-2 text-[10px] uppercase tracking-[0.2em]">All</span>
          {categories.map((category) => (
            <span key={category} className="border border-[var(--color-rule)] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
              {category}
            </span>
          ))}
        </div>
      </section>

      <section data-nav-theme="dark" className="px-5 sm:px-6 lg:px-10 pb-24 lg:pb-32">
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-[var(--color-rule)]">
          {products.map((product, index) => (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className="group border-r border-b border-[var(--color-rule)] bg-[var(--color-paper)] p-5 lg:p-6"
            >
              <div className="flex items-center justify-between gap-4 mb-5">
                <span className="tech-meta">MT / {String(index + 1).padStart(3, "0")}</span>
                <span className="tech-meta">{product.category}</span>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden bg-white mb-5">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  loading={index < 4 ? "eager" : "lazy"}
                  className="object-contain p-5 transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-5">
                <div>
                  <h2 className="font-display text-xl leading-tight mb-2">{product.title}</h2>
                  <p className="archive-link text-[11px] uppercase tracking-[0.2em]">View dossier</p>
                </div>
                <p className="font-display text-lg">{formatPrice(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
