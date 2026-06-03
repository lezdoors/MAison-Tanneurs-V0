import { Navigation } from "@/components/Navigation"
import { HeroCarousel } from "@/components/HeroCarousel"
import { ObjectOfTheEdition } from "@/components/ObjectOfTheEdition"
import { FeaturedEdition } from "@/components/FeaturedEdition"
import { EditorialFilm } from "@/components/EditorialFilm"
import { Craftsmanship } from "@/components/Craftsmanship"
import { BatchGuarantee } from "@/components/BatchGuarantee"
import { Materials } from "@/components/Materials"
import { HeritageStrip } from "@/components/HeritageStrip"
import { Newsletter } from "@/components/Newsletter"
import { Footer } from "@/components/Footer"
import { fetchFeaturedProducts } from "@/lib/supabase"

export const revalidate = 300

export default async function Home() {
  const featured = await fetchFeaturedProducts(4)
  const [hero, ...rest] = featured
  const three = rest.slice(0, 3)

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* §1 — Cinematic 4-beat hero */}
      <HeroCarousel />

      {/* §2 — One hero object */}
      <ObjectOfTheEdition product={hero || null} />

      {/* §3 — Three from the Edition */}
      <FeaturedEdition products={three} />

      {/* §4 — Editorial film opens the process chapter */}
      <EditorialFilm
        src="/tanneurs/cinema/hands-at-work.mp4"
        poster="/tanneurs/cinema/hands-at-work.webp"
        alt="Macro of artisan hands saddle-stitching cognac leather"
        pullQuote="Two needles. Every stitch by hand."
        attribution="The Atelier · Marrakech"
        height="medium"
        navTheme="light"
      />

      {/* §5 — Cut · Stitch · Finish */}
      <Craftsmanship />

      {/* §6 — The Batch & The Guarantee */}
      <BatchGuarantee />

      {/* §7 — Materials */}
      <Materials />

      {/* §8 — Heritage strip */}
      <HeritageStrip />

      {/* §9 — Newsletter */}
      <Newsletter />

      {/* §10 — Footer */}
      <Footer />
    </main>
  )
}
