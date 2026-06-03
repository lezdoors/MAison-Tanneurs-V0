import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/supabase"
import { productHero, formatPrice } from "@/lib/supabase"

// Three additional pieces from the edition, presented as quiet product tiles.
// Center-headed. Single CTA: "View the Edition" → /products.
type Props = { products: Product[] }

export function FeaturedEdition({ products }: Props) {
  const items = products.slice(0, 3)
  if (items.length === 0) return null

  return (
    <section
      data-nav-theme="dark"
      className="bg-[var(--color-paper-soft)] py-20 lg:py-32 px-6 lg:px-10"
      aria-label="Three from the Edition"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-14 lg:mb-20">
          <span className="tech-label block mb-5">§02 · L'Édition · Vol. I</span>
          <h2 className="font-display text-[clamp(30px,4vw,52px)] leading-[1.1] tracking-[-0.01em] text-balance">
            Three from the first edition.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          {items.map((p) => (
            <Link key={p.slug} href={`/product/${p.slug}`} className="group block">
              <div className="relative aspect-[4/5] bg-[var(--color-plate)] overflow-hidden mb-6">
                <Image
                  src={productHero(p)}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
              <p className="tech-meta mb-2">{p.category}</p>
              <h3 className="font-display text-xl lg:text-2xl mb-1 leading-tight">{p.title}</h3>
              <p className="text-sm text-[var(--color-ink-muted)] tracking-wide">{formatPrice(p.price)}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-14 lg:mt-20">
          <Link
            href="/products"
            className="inline-flex items-center text-[11px] tracking-[0.32em] uppercase border-b border-[var(--color-ink)] pb-1 hover:border-transparent transition-colors"
          >
            View the Full Edition
          </Link>
        </div>
      </div>
    </section>
  )
}
