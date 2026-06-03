import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/supabase"
import { productHero, formatPrice, productNumber } from "@/lib/supabase"

// Single hero object — Polène-tier moment. One photo, one paragraph, two
// actions (mailto reserve + read dossier on PDP). Takes the user's first
// featured product or accepts a passed-in slug-pick.
type Props = { product: Product | null }

export function ObjectOfTheEdition({ product }: Props) {
  if (!product) return null
  const number = productNumber(product)

  return (
    <section
      data-nav-theme="dark"
      className="bg-[var(--color-paper)] text-[var(--color-ink)] py-20 lg:py-32 px-6 lg:px-10"
      aria-label="Object of the Edition"
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        <div className="lg:col-span-7">
          <div className="relative aspect-[5/4] bg-[var(--color-plate)] overflow-hidden">
            <Image
              src={productHero(product)}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-5 lg:pl-4">
          <div className="flex items-center gap-3 mb-8">
            <span className="tech-label">§01 · Object of the Edition</span>
            <span className="h-px w-8 bg-[var(--color-rule)]" />
          </div>

          <p className="tech-meta mb-4">{product.category}</p>
          <h2 className="font-display text-[clamp(34px,4vw,56px)] leading-[1.05] tracking-[-0.012em] mb-6">
            {product.title}
          </h2>

          {product.description && (
            <p className="text-[15px] leading-[1.75] text-[var(--color-ink-soft)] max-w-[46ch] mb-10">
              {product.description}
            </p>
          )}

          <div className="flex items-center gap-5 mb-8">
            <span className="font-display text-2xl text-[var(--color-ink)]">{formatPrice(product.price)}</span>
            {number && (
              <>
                <span className="h-4 w-px bg-[var(--color-rule)]" />
                <span className="tech-meta">{number}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`mailto:hello@maisontanneurs.com?subject=${encodeURIComponent(
                `Reserve · ${product.title}`
              )}&body=${encodeURIComponent(
                `I'd like to reserve the ${product.title}${number ? ` (${number})` : ""} at ${formatPrice(product.price)}. Please let me know when the next edition is available and any details I should know.`
              )}`}
              className="inline-flex items-center text-[11px] tracking-[0.32em] uppercase bg-[var(--color-ink)] text-[var(--color-ivory)] px-7 py-4 hover:bg-[var(--color-warm-black)] transition-colors"
            >
              Reserve →
            </a>
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex items-center text-[11px] tracking-[0.32em] uppercase border border-[var(--color-rule)] text-[var(--color-ink)] px-7 py-4 hover:border-[var(--color-ink)] transition-colors"
            >
              Read the Dossier
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
