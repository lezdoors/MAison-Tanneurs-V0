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
    media: "/tanneurs/atelier/wide-scene.webp",
    alt: "Wide interior of the Marrakech atelier",
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

const NUMBERS = [
  { value: "07", label: "Artisans", body: "Seven hands per piece. No more, no fewer." },
  { value: "14", label: "Days", body: "From hide to final stitch. Never less, sometimes more." },
  { value: "01", label: "Workshop", body: "A single ryad in the Marrakech medina. No second location." },
  { value: "00", label: "Machines", body: "On the seam. Two needles, waxed linen, by hand." },
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

      {/* ── The House — origin narrative + signature ─────────────────────
          Cucinelli-style family-heritage editorial. Sets the philosophy
          before the chapter explorer takes the viewer through it. */}
      <section className="px-6 lg:px-10 py-16 lg:py-28 bg-[var(--color-paper-soft)] border-y border-[var(--color-rule)]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8 lg:mb-10">
            <span className="tech-label">§01 · The House</span>
            <span className="h-px flex-1 bg-[var(--color-rule)]" />
          </div>
          <p className="font-display italic text-[clamp(22px,2.4vw,30px)] leading-[1.45] tracking-[-0.005em] text-[var(--color-ink)] mb-8 lg:mb-10 max-w-prose">
            &ldquo;Maison Tanneurs began with a question: what would a piece carry, if we built it to last a generation?&rdquo;
          </p>
          <div className="space-y-6 text-[15px] lg:text-[16px] leading-[1.85] text-[var(--color-ink-soft)] max-w-prose">
            <p>
              The answer is a workshop, seven hands, and the patience of fourteen days. No machines on the
              seam. No shortcuts at the edge. Each piece passes through every artisan in the room before it
              is numbered and entered into the ledger.
            </p>
            <p>
              We chose Marrakech because the craft never left. Leather has been worked in this medina for a
              thousand years, and the lineage runs through the artisans we sit beside. They taught us. We
              built the house around them.
            </p>
            <p>
              The pieces are not produced. They are made. There is a difference, and it shows in the years
              you carry them.
            </p>
          </div>
          <div className="mt-10 lg:mt-12 pt-6 border-t border-[var(--color-rule)] flex items-baseline gap-4">
            <span className="font-display italic text-[18px] text-[var(--color-ink)]">The Atelier</span>
            <span className="h-px w-8 bg-[var(--color-rule)]" />
            <span className="tech-meta">Marrakech &middot; 2026</span>
          </div>
        </div>
      </section>

      {/* ── By the Numbers — ratio strip on warm-black ──────────────────
          Quiet brag block. Each number is what the brand is by design,
          not by accident. */}
      <section
        data-nav-theme="light"
        className="bg-[var(--color-warm-black)] text-[var(--color-ivory)] px-6 lg:px-10 py-16 lg:py-24"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <span className="tech-label tech-label--ondark block mb-4">§02 · The Ratio</span>
            <h2 className="font-display text-[clamp(26px,3.4vw,42px)] leading-[1.15] tracking-[-0.008em] text-balance">
              Four numbers, locked.
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 lg:gap-x-10 text-center">
            {NUMBERS.map((n) => (
              <div key={n.label} className="flex flex-col items-center">
                <span className="font-display text-[clamp(48px,7vw,96px)] leading-none tracking-[-0.02em] text-[var(--color-ivory)] mb-3">
                  {n.value}
                </span>
                <span className="tech-label tech-label--ondark mb-3">{n.label}</span>
                <p className="text-[13px] lg:text-[14px] leading-[1.6] text-[var(--color-ivory-soft)] max-w-[20ch]">
                  {n.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chapter explorer divider ────────────────────────────────── */}
      <section className="px-6 lg:px-10 pt-16 lg:pt-24 pb-8 lg:pb-12 text-center">
        <span className="tech-label block mb-4 lg:mb-5">§03 · Six Chapters</span>
        <h2 className="font-display text-[clamp(26px,3.4vw,44px)] leading-[1.1] tracking-[-0.008em] text-balance max-w-3xl mx-auto">
          From the medina, to the workshop, to your hand.
        </h2>
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
