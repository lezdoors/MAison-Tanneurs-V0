import { Navigation } from "@/components/Navigation"
import { EditorialFilm } from "@/components/EditorialFilm"
import { LuminaSlider } from "@/components/LuminaSlider"
import { Footer } from "@/components/Footer"

export const metadata = {
  title: "The Atelier",
  description: "A small workshop in the Marrakech medina — seven artisans, fourteen days per piece.",
}

// /atelier tells the PLACE story (city → workshop → object → carrier).
// Homepage Craftsmanship section shows the PROCESS (Cut/Stitch/Finish), so
// every image here is unique to the atelier register. After the opener film
// and the typeset intro, the LuminaSlider becomes the cinematic chapter
// explorer — WebGL glass transitions between six atelier stills.
const SLIDES = [
  {
    title: "Marrakech",
    description: "A small workshop behind a ryad door. Seven artisans, no machines, no apprentices learning on the customer's piece.",
    media: "/tanneurs/lifestyle/teal-ryad.webp",
  },
  {
    title: "The Hides",
    description: "Full-grain bovine sourced from Mediterranean herds. Selected at the tannery for grain consistency and weight.",
    media: "/tanneurs/atelier/leather-workbench.webp",
  },
  {
    title: "The Workshop",
    description: "Light falls through the courtyard, the workshop runs on its own quiet rhythm. Fourteen days, every piece.",
    media: "/tanneurs/atelier/wide-scene.webp",
  },
  {
    title: "The Boutique",
    description: "A single room in the medina, opened to the morning light. Where the piece meets its first carrier.",
    media: "/tanneurs/atelier/boutique-wide.webp",
  },
  {
    title: "The Object",
    description: "Numbered inside the lining. Never restocked. Made to outlive whoever first carries it.",
    media: "/tanneurs/atelier/bag-courtyard.webp",
  },
  {
    title: "The Carrier",
    description: "Across the medina, across the dunes, across decades. The piece takes the imprint of its years.",
    media: "/tanneurs/lifestyle/white-ryad.webp",
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

      {/* WebGL fragment-shader chapter explorer — glass transitions, auto-cycle. */}
      <LuminaSlider slides={SLIDES} />

      {/* SEO + accessibility shadow — same six chapters rendered as plain text
          so search engines and screen readers see the full atelier story
          regardless of WebGL support. Visually hidden on screens that support
          the slider; rendered as a fallback grid when JS / WebGL fails. */}
      <section className="sr-only" aria-label="Atelier chapters">
        {SLIDES.map((s) => (
          <article key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.description}</p>
          </article>
        ))}
      </section>

      <Footer />
    </main>
  )
}
