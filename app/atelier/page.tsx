import Image from "next/image"
import { Navigation } from "@/components/Navigation"
import { EditorialFilm } from "@/components/EditorialFilm"
import { LuminaSlider } from "@/components/LuminaSlider"
import { Footer } from "@/components/Footer"

export const metadata = {
  title: "The Atelier",
  description: "A small workshop in the Marrakech medina — seven artisans, fourteen days per piece.",
}

// /atelier tells the PLACE story (city → workshop → object → carrier).
//
// Two presentations of the same six chapters:
//   - Desktop (lg+): cinematic LuminaSlider — WebGL glass-transition explorer
//     with side-nav chapters. Auto-cycles, immersive.
//   - Mobile (<lg): static vertical scroll of full-width images + captions.
//     WebGL on touch + side-nav-hidden is poor UX; static reads better,
//     loads faster, and stays accessible.
const SLIDES = [
  {
    title: "Marrakech",
    description:
      "A small workshop behind a ryad door. Seven artisans, no machines, no apprentices learning on the customer's piece.",
    media: "/tanneurs/lifestyle/teal-ryad.webp",
    alt: "Woman in a teal-tiled Moorish ryad courtyard with a Maison Tanneurs bag",
  },
  {
    title: "The Hides",
    description:
      "Full-grain bovine sourced from Mediterranean herds. Selected at the tannery for grain consistency and weight.",
    media: "/tanneurs/atelier/leather-workbench.webp",
    alt: "Stacked leather hides on the atelier workbench",
  },
  {
    title: "The Workshop",
    description:
      "Light falls through the courtyard, the workshop runs on its own quiet rhythm. Fourteen days, every piece.",
    media: "/tanneurs/atelier/wide-scene.webp",
    alt: "Wide interior of the Marrakech atelier",
  },
  {
    title: "The Boutique",
    description:
      "A single room in the medina, opened to the morning light. Where the piece meets its first carrier.",
    media: "/tanneurs/atelier/boutique-wide.webp",
    alt: "The Maison Tanneurs boutique — wide morning shot",
  },
  {
    title: "The Object",
    description:
      "Numbered inside the lining. Never restocked. Made to outlive whoever first carries it.",
    media: "/tanneurs/atelier/bag-courtyard.webp",
    alt: "Finished Maison Tanneurs bag in a Marrakech courtyard",
  },
  {
    title: "The Carrier",
    description:
      "Across the medina, across the dunes, across decades. The piece takes the imprint of its years.",
    media: "/tanneurs/lifestyle/white-ryad.webp",
    alt: "Model in cream linen walking through a chalk-arched ryad with a cognac leather bag",
  },
]

export default function AtelierPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      <EditorialFilm
        src="/tanneurs/cinema/medina-zigzag-reveal.mp4"
        poster="/tanneurs/cinema/medina-zigzag-reveal.webp"
        alt="Cinematic reveal — Maison Tanneurs Medina Zigzag Tote"
        pullQuote="Fourteen days from hide to final stitch."
        attribution="The Atelier · Marrakech"
        height="tall"
        navTheme="light"
      />

      <section className="px-6 lg:px-10 pt-16 lg:pt-28 pb-12 lg:pb-16 text-center">
        <span className="tech-label block mb-4 lg:mb-5">The Atelier · Vol. I</span>
        <h1 className="font-display text-[clamp(32px,5vw,72px)] leading-[1.05] tracking-[-0.012em] mb-5 lg:mb-6 text-balance">
          A single workshop. Seven artisans.
        </h1>
        <p className="text-[14px] lg:text-[15px] leading-[1.8] text-[var(--color-ink-soft)] max-w-xl mx-auto">
          Behind a ryad door in the Marrakech medina, every Maison Tanneurs piece is cut, sewn, and finished by hand —
          fourteen days from hide to final stitch.
        </p>
      </section>

      {/* Desktop: WebGL cinematic slider. */}
      <div className="hidden lg:block">
        <LuminaSlider slides={SLIDES} />
      </div>

      {/* Mobile: static chapter scroll — six alternating full-bleed images + captions.
          Same content as the slider, served as plain DOM for performance + accessibility. */}
      <section className="lg:hidden pb-16">
        <div className="space-y-12">
          {SLIDES.map((s, i) => (
            <article key={s.title} className="flex flex-col">
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-[var(--color-plate)]">
                <Image
                  src={s.media}
                  alt={s.alt}
                  fill
                  sizes="100vw"
                  loading={i === 0 ? "eager" : "lazy"}
                  className="object-cover"
                />
              </div>
              <div className="px-6 pt-5">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-display text-xl text-[var(--color-ink-muted)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="tech-label">Chapter {i + 1}</span>
                </div>
                <h2 className="font-display text-[clamp(22px,6vw,30px)] leading-[1.1] tracking-[-0.005em] mb-3">
                  {s.title}
                </h2>
                <p className="text-[14px] leading-[1.75] text-[var(--color-ink-soft)] max-w-prose">
                  {s.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
