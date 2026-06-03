import Image from "next/image"
import { Navigation } from "@/components/Navigation"
import { EditorialFilm } from "@/components/EditorialFilm"
import { Footer } from "@/components/Footer"

export const metadata = {
  title: "The Atelier",
  description: "A small workshop in the Marrakech medina — seven artisans, fourteen days per piece.",
}

// /atelier tells the PLACE story (city → workshop → object → carrier).
// Homepage Craftsmanship section already shows the PROCESS (Cut/Stitch/Finish),
// so every image here is UNIQUE — none repeats a homepage shot.
const SLIDES = [
  {
    title: "Marrakech",
    body: "A small workshop behind a ryad door. Seven artisans, no machines, no apprentices learning on the customer's piece.",
    image: "/tanneurs/lifestyle/teal-ryad.webp",
    alt: "Woman walking through a teal-tiled Moorish ryad courtyard, carrying a Maison Tanneurs bag",
  },
  {
    title: "The Hides",
    body: "Full-grain bovine sourced from Mediterranean herds. Selected at the tannery for grain consistency and weight.",
    image: "/tanneurs/atelier/leather-workbench.webp",
    alt: "Stacks of leather laid out across the atelier workbench",
  },
  {
    title: "The Workshop",
    body: "Light falls through the courtyard, the workshop runs on its own quiet rhythm. Fourteen days, every piece.",
    image: "/tanneurs/atelier/wide-scene.webp",
    alt: "Wide interior of the Marrakech atelier",
  },
  {
    title: "The Boutique",
    body: "A single room in the medina, opened to the morning light. Where the piece meets its first carrier.",
    image: "/tanneurs/atelier/boutique-wide.webp",
    alt: "The Maison Tanneurs boutique — wide morning shot",
  },
  {
    title: "The Object",
    body: "Numbered inside the lining. Never restocked. Made to outlive whoever first carries it.",
    image: "/tanneurs/atelier/bag-courtyard.webp",
    alt: "Finished Maison Tanneurs bag placed in a Marrakech courtyard",
  },
  {
    title: "The Carrier",
    body: "Across the medina, across the dunes, across decades. The piece takes the imprint of its years.",
    image: "/tanneurs/lifestyle/white-ryad.webp",
    alt: "Model in cream linen walking through a chalk-arched ryad with a cognac leather bag",
  },
]

export default function AtelierPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* /atelier opener — distinct from homepage §4 (hands-at-work).
          Uses the cinematic zigzag-tote reveal — product-becoming-object. */}
      <EditorialFilm
        src="/tanneurs/cinema/medina-zigzag-reveal.mp4"
        poster="/tanneurs/cinema/medina-zigzag-reveal.webp"
        alt="Cinematic reveal — Maison Tanneurs Medina Zigzag Tote"
        pullQuote="Fourteen days from hide to final stitch."
        attribution="The Atelier · Marrakech"
        height="tall"
        navTheme="light"
      />

      <section className="px-6 lg:px-10 pt-20 lg:pt-28 pb-16 text-center">
        <span className="tech-label block mb-5">The Atelier · Vol. I</span>
        <h1 className="font-display text-[clamp(36px,5vw,72px)] leading-[1.05] tracking-[-0.012em] mb-6 text-balance">
          A single workshop. Seven artisans.
        </h1>
        <p className="text-[14px] lg:text-[15px] leading-[1.8] text-[var(--color-ink-soft)] max-w-xl mx-auto">
          Behind a ryad door in the Marrakech medina, every Maison Tanneurs piece is cut, sewn, and finished by hand —
          fourteen days from hide to final stitch.
        </p>
      </section>

      <section className="px-6 lg:px-10 pb-24 lg:pb-32">
        <div className="max-w-[1400px] mx-auto space-y-20 lg:space-y-32">
          {SLIDES.map((s, i) => {
            const reverse = i % 2 === 1
            return (
              <div
                key={s.title}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="lg:col-span-7 relative aspect-[4/3] overflow-hidden bg-[var(--color-plate)]">
                  <Image
                    src={s.image}
                    alt={s.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    loading={i === 0 ? "eager" : "lazy"}
                    className="object-cover"
                  />
                </div>
                <div className="lg:col-span-5">
                  <div className="flex items-baseline gap-3 mb-5">
                    <span className="font-display text-3xl text-[var(--color-ink-muted)]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="tech-label">Chapter {i + 1}</span>
                  </div>
                  <h2 className="font-display text-[clamp(26px,3vw,44px)] leading-[1.1] tracking-[-0.005em] mb-5">
                    {s.title}
                  </h2>
                  <p className="text-[14px] lg:text-[15px] leading-[1.8] text-[var(--color-ink-soft)] max-w-lg">
                    {s.body}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Footer />
    </main>
  )
}
