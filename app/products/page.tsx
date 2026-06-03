import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/Navigation"
import { EditorialFilm } from "@/components/EditorialFilm"
import { Footer } from "@/components/Footer"
import { fetchAllProductCards, formatPrice } from "@/lib/supabase"

export const revalidate = 300

export const metadata = {
  title: "The Edition",
  description: "Every Maison Tanneurs piece, numbered and hand-stitched in Marrakech.",
}

export default async function ProductsPage() {
  const products = await fetchAllProductCards()

  return (
    <main className="min-h-screen">
      <Navigation />

      <EditorialFilm
        src="/tanneurs/cinema/berber-dunes.mp4"
        poster="/tanneurs/cinema/berber-dunes-poster.webp"
        alt="Berber figure in the Saharan dunes at golden hour"
        height="tall"
        navTheme="light"
      />

      <section className="px-6 lg:px-10 pt-20 lg:pt-28 pb-12 lg:pb-16 text-center">
        <span className="tech-label block mb-5">L'Édition · 2026</span>
        <h1 className="font-display text-[clamp(36px,5vw,72px)] leading-[1.05] tracking-[-0.012em] mb-6 text-balance">
          The Edition
        </h1>
        <p className="text-[14px] lg:text-[15px] leading-[1.8] text-[var(--color-ink-soft)] max-w-xl mx-auto">
          {products.length} pieces hand-stitched in Marrakech. Full-grain leather, solid brass, numbered.
        </p>
      </section>

      <section className="px-6 lg:px-10 pb-24 lg:pb-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
            {products.map((p) => (
              <Link key={p.slug} href={`/product/${p.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-plate)] mb-4">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>
                <p className="tech-meta mb-1.5">{p.category}</p>
                <h3 className="font-display text-lg mb-1 leading-tight">{p.title}</h3>
                <p className="text-sm text-[var(--color-ink-muted)]">{formatPrice(p.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
