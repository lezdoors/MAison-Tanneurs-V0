import Image from "next/image"
import Link from "next/link"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { archiveProducts } from "@/lib/archive-products"
import { fetchFeaturedProducts, formatPrice, productHero, productNumber } from "@/lib/supabase"

export const revalidate = 300

const PROOF = [
  { label: "Cut", src: "/tanneurs/atelier/craftsmanship-cut.webp", copy: "Panels are cut from selected full-grain hides, then checked by hand before assembly." },
  { label: "Stitch", src: "/tanneurs/atelier/craftsmanship-stitch.webp", copy: "Saddle stitch, waxed linen, two needles. The seam is built for repair, not replacement." },
  { label: "Finish", src: "/tanneurs/materials/solid-brass.webp", copy: "Brass, burnished edges, and a numbered interior mark complete the object record." },
]

export default async function Home() {
  const fetched = await fetchFeaturedProducts(4)
  const featured = fetched.length ? fetched : archiveProducts.slice(0, 4)
  const [hero, ...rest] = featured
  const cards = rest.length ? rest : archiveProducts.slice(1, 4)

  return (
    <main className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <Navigation />

      <section data-nav-theme="dark" className="px-5 sm:px-6 lg:px-10 pt-28 lg:pt-36 pb-16 lg:pb-24">
        <div className="max-w-[1500px] mx-auto archive-rule">
          <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[var(--color-rule)]">
            <div className="lg:col-span-7 py-10 lg:py-16 lg:pr-14">
              <div className="flex items-center justify-between gap-6 mb-10">
                <span className="tech-label">Atelier Archive / Vol. I</span>
                <span className="tech-meta hidden sm:inline">Marrakech / Numbered Objects</span>
              </div>
              <h1 className="font-display text-[clamp(44px,7vw,108px)] leading-[0.94] max-w-5xl">
                Leather objects, registered by hand.
              </h1>
              <div className="grid sm:grid-cols-2 gap-8 lg:gap-12 mt-10 lg:mt-14 max-w-3xl">
                <p className="text-[15px] leading-[1.8] text-[var(--color-ink-soft)]">
                  Maison Tanneurs is a Marrakech atelier making structured leather bags in small numbered runs.
                </p>
                <p className="text-[13px] leading-[1.8] text-[var(--color-ink-muted)]">
                  Full-grain leather, aged brass, waxed linen stitch. Built as archival travel objects, not seasonal accessories.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-10">
                <Link
                  href="/products"
                  className="inline-flex h-12 items-center border border-[var(--color-ink)] px-6 text-[11px] uppercase tracking-[0.24em] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] transition-colors"
                >
                  View the register
                </Link>
                {hero && (
                  <Link href={`/product/${hero.slug}`} className="archive-link text-[12px] uppercase tracking-[0.22em]">
                    Read object dossier
                  </Link>
                )}
              </div>
            </div>

            {hero && (
              <div className="lg:col-span-5 lg:border-l border-[var(--color-rule)] py-8 lg:py-12 lg:pl-10">
                <Link href={`/product/${hero.slug}`} className="group block">
                  <div className="relative aspect-[4/5] bg-white overflow-hidden">
                    <Image
                      src={productHero(hero)}
                      alt={hero.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-contain p-5 lg:p-8 transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                    />
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-6 border-t border-[var(--color-rule)] pt-5 mt-5">
                    <div>
                      <p className="tech-meta mb-2">{productNumber(hero) || "MT-BAG-000"} / Object of the register</p>
                      <h2 className="font-display text-2xl lg:text-3xl leading-tight">{hero.title}</h2>
                    </div>
                    <p className="font-display text-xl">{formatPrice(hero.price)}</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section data-nav-theme="dark" className="px-5 sm:px-6 lg:px-10 pb-20 lg:pb-28">
        <div className="max-w-[1500px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 border-y border-[var(--color-rule)]">
            {cards.map((product) => (
              <Link
                key={product.slug}
                href={`/product/${product.slug}`}
                className="group border-b md:border-b-0 md:border-r last:border-r-0 border-[var(--color-rule)] p-5 lg:p-7"
              >
                <div className="relative aspect-[4/5] bg-white overflow-hidden mb-6">
                  <Image
                    src={productHero(product)}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain p-5 transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <p className="tech-meta">{product.category}</p>
                  <p className="tech-meta">{productNumber(product)}</p>
                </div>
                <h3 className="font-display text-xl lg:text-2xl leading-tight mb-2">{product.title}</h3>
                <p className="text-sm text-[var(--color-ink-muted)]">{formatPrice(product.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-nav-theme="dark" className="bg-white border-y border-[var(--color-rule)]">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-6 lg:px-10 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <span className="tech-label block mb-6">Field Proof</span>
              <h2 className="font-display text-[clamp(32px,4.6vw,64px)] leading-[1] mb-6">
                The evidence sits in the details.
              </h2>
              <p className="text-[14px] leading-[1.85] text-[var(--color-ink-soft)] max-w-md">
                This concept reads the atelier like an archive: material, process, object, repair. No spectacle where proof is stronger.
              </p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {PROOF.map((item) => (
                <article key={item.label} className="border-t border-[var(--color-rule)] pt-5">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-paper)] mb-5">
                    <Image src={item.src} alt="" fill sizes="(max-width: 768px) 100vw, 22vw" className="object-cover" />
                  </div>
                  <p className="tech-meta mb-3">{item.label}</p>
                  <p className="text-[13px] leading-[1.75] text-[var(--color-ink-soft)]">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-nav-theme="dark" className="px-5 sm:px-6 lg:px-10 py-20 lg:py-28">
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-y border-[var(--color-rule)]">
          <div className="lg:col-span-5 p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-[var(--color-rule)]">
            <span className="tech-label block mb-6">Atelier Promise</span>
            <h2 className="font-display text-[clamp(30px,4vw,56px)] leading-[1] mb-8">
              Numbered, repairable, never treated as disposable.
            </h2>
            <Link href="/products" className="archive-link text-[12px] uppercase tracking-[0.22em]">
              Enter the edition
            </Link>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-3">
            {["Fourteen day atelier rhythm", "Lifetime stitch and edge repair", "Tracked worldwide dispatch"].map((line, index) => (
              <div key={line} className="p-6 lg:p-10 border-b sm:border-b-0 sm:border-r last:border-r-0 border-[var(--color-rule)]">
                <p className="font-display text-4xl mb-8 text-[var(--color-ink-muted)]">{String(index + 1).padStart(2, "0")}</p>
                <p className="text-[14px] leading-[1.75] text-[var(--color-ink-soft)]">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
