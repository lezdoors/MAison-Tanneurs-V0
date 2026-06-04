import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/Navigation"
import { EditorialFilm } from "@/components/EditorialFilm"
import { Footer } from "@/components/Footer"
import { JsonLd } from "@/components/JsonLd"
import { fetchAllProductCards, formatPrice } from "@/lib/supabase"

export const revalidate = 300

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.maisontanneurs.com"

export const metadata = {
  title: "The Edition",
  description: "Every Maison Tanneurs piece, numbered and hand-stitched in Marrakech.",
  alternates: { canonical: `${SITE_URL}/products` },
}

export default async function ProductsPage() {
  const products = await fetchAllProductCards()

  // ItemList JSON-LD — surfaces the catalogue to AI search as a structured
  // collection. Each item links to its PDP which has Product schema.
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/product/${p.slug}`,
      name: p.title,
    })),
    numberOfItems: products.length,
  }

  return (
    <main className="min-h-screen">
      <Navigation />

      <JsonLd data={itemListSchema} />

      <EditorialFilm
        src="/tanneurs/cinema/model-desert.mp4"
        poster="/tanneurs/cinema/night-desert.webp"
        alt="Model in cream linen across the Moroccan desert at night"
        height="tall"
        navTheme="light"
      />

      <section className="px-6 lg:px-10 pt-16 lg:pt-28 pb-10 lg:pb-16 text-center">
        <span className="tech-label block mb-4 lg:mb-5">L&apos;Édition · 2026</span>
        <h1 className="font-display text-[clamp(34px,5vw,72px)] leading-[1.05] tracking-[-0.012em] mb-5 lg:mb-6 text-balance">
          The Edition
        </h1>
        <p className="text-[14px] lg:text-[15px] leading-[1.8] text-[var(--color-ink-soft)] max-w-xl mx-auto">
          {products.length} pieces hand-stitched in Marrakech. Full-grain leather, solid brass, numbered.
        </p>
      </section>

      {/* Mobile: 2-up grid for density (Cucinelli/Polène do 2-col, not 1).
          Desktop: 3-up to 4-up scaling. Closer gutters on mobile keep the
          edge tension consistent with PDP edge-to-edge gallery. */}
      <section className="px-3 sm:px-6 lg:px-10 pb-20 lg:pb-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-8 sm:gap-6 lg:gap-12">
            {products.map((p) => (
              <Link key={p.slug} href={`/product/${p.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-plate)] mb-3 lg:mb-4">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 33vw, 25vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>
                <p className="tech-meta mb-1 text-[10px] lg:text-[11px]">{p.category}</p>
                <h3 className="font-display text-[14px] sm:text-base lg:text-lg mb-1 leading-tight">{p.title}</h3>
                <p className="text-[12px] sm:text-sm text-[var(--color-ink-muted)]">{formatPrice(p.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
