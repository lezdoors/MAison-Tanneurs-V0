import { Navigation } from "@/components/Navigation"
import { EditorialFilm } from "@/components/EditorialFilm"
import { Footer } from "@/components/Footer"

export const metadata = {
  title: "Heritage",
  description: "Hand-stitched in Marrakech. Carried everywhere.",
}

const CHAPTERS = [
  {
    numeral: "I",
    title: "The Hides",
    body: "Full-grain bovine sourced from Mediterranean herds, selected at the tannery for grain consistency and weight. We turn away more than we accept.",
  },
  {
    numeral: "II",
    title: "The Cut",
    body: "Patterns drawn by hand, cut from the hide. Every panel inspected before it joins another. A bag begins as ten distinct pieces — every one of them deliberate.",
  },
  {
    numeral: "III",
    title: "The Stitch",
    body: "Saddle-stitched with waxed linen thread. Two needles, every stitch by hand. Nothing machine-sewn. The seam will outlive the bag.",
  },
  {
    numeral: "IV",
    title: "The Finish",
    body: "Edges burnished, hardware set, lining laid. The bag is numbered inside the lining — a small mark of when, by whom, and from which hide.",
  },
  {
    numeral: "V",
    title: "The Journey",
    body: "Fourteen days from hide to final stitch. Then it leaves Marrakech and begins its real life — in your hand, across years, against weather and time.",
  },
]

export default function HeritagePage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      <EditorialFilm
        src="/tanneurs/cinema/berber-dunes.mp4"
        poster="/tanneurs/cinema/berber-dunes-poster.webp"
        alt="Berber figure on Saharan dune ridge at sunrise"
        pullQuote="Hand-stitched in Marrakech. Carried everywhere."
        attribution="Heritage · Vol. I"
        height="tall"
        navTheme="light"
      />

      <section className="py-20 lg:py-28 px-6 lg:px-10">
        <div className="max-w-2xl mx-auto text-center">
          <span className="tech-label block mb-5">Heritage · Vol. I</span>
          <h1 className="font-display text-[clamp(34px,4.5vw,64px)] leading-[1.08] tracking-[-0.012em] mb-6 text-balance">
            Five chapters from a single workshop.
          </h1>
          <p className="text-[14px] lg:text-[15px] leading-[1.8] text-[var(--color-ink-soft)]">
            Maison Tanneurs began as a single workbench in the Marrakech medina. Today, seven artisans, fourteen days per
            piece, no shortcuts. This is the work, told in five chapters.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-20 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto space-y-16 lg:space-y-24">
          {CHAPTERS.map((c) => (
            <article key={c.numeral} className="grid grid-cols-12 gap-6">
              <div className="col-span-2 text-right">
                <span className="font-display text-3xl lg:text-5xl text-[var(--color-ink-muted)]">{c.numeral}</span>
              </div>
              <div className="col-span-10">
                <h2 className="font-display text-[clamp(22px,2.4vw,32px)] leading-[1.15] tracking-[-0.005em] mb-4">
                  {c.title}
                </h2>
                <p className="text-[14px] lg:text-[15px] leading-[1.85] text-[var(--color-ink-soft)] max-w-prose">
                  {c.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <EditorialFilm
        src="/tanneurs/cinema/model-dune-walk.mp4"
        poster="/tanneurs/cinema/model-dune-walk.webp"
        alt="Model in cream linen walking across Saharan dunes"
        height="medium"
        navTheme="light"
      />

      <Footer />
    </main>
  )
}
