import Image from "next/image"
import { Navigation } from "@/components/Navigation"
import { EditorialFilm } from "@/components/EditorialFilm"
import { Footer } from "@/components/Footer"

export const metadata = {
  title: "The Atelier",
  description: "A small workshop in the Marrakech medina — seven artisans, fourteen days per piece.",
}

const SLIDES = [
  {
    title: "Marrakech",
    body: "A small workshop behind a ryad door. Seven artisans, no machines, no apprentices learning on the customer's piece.",
    image: "/tanneurs/lifestyle/teal-ryad.webp",
  },
  {
    title: "The Hides",
    body: "Full-grain bovine sourced from Mediterranean herds. Selected at the tannery for grain consistency and weight.",
    image: "/tanneurs/atelier/leather-table-2.webp",
  },
  {
    title: "The Cut",
    body: "Patterns drawn by hand, cut from the hide. Every panel inspected before it joins another.",
    image: "/tanneurs/atelier/cut-leather-table.webp",
  },
  {
    title: "The Stitch",
    body: "Saddle-stitched with waxed linen thread. Two needles, every stitch by hand. Nothing machine-sewn.",
    image: "/tanneurs/atelier/stitch-hands.webp",
  },
  {
    title: "The Atelier",
    body: "Fourteen days from hide to final stitch. Light falls through the courtyard, the workshop runs on its own quiet rhythm.",
    image: "/tanneurs/atelier/wide-scene.webp",
  },
  {
    title: "The Object",
    body: "Numbered inside the lining. Never restocked. Made to outlive whoever first carries it.",
    image: "/tanneurs/atelier/finish-atelier.webp",
  },
]

export default function AtelierPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      <EditorialFilm
        src="/tanneurs/cinema/hands-at-work.mp4"
        poster="/tanneurs/cinema/hands-at-work.webp"
        alt="Macro of artisan hands saddle-stitching with brass awl"
        pullQuote="Two needles. Every stitch by hand. Nothing machine-sewn."
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
                    alt={s.title}
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
