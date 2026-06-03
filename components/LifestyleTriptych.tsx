import Image from "next/image"

// Three settings, one piece. Mixes the model+tennis+field shots so the
// editorial reads "this is what you carry across worlds" — Marrakech
// medina, tennis court, olive grove. Quiet, full-bleed-edge tiles.
const FRAMES = [
  {
    src: "/tanneurs/lifestyle/tennis-leather.webp",
    alt: "Maison Tanneurs leather bag on a Marrakech tennis court at dusk",
    place: "The Courts",
    location: "Marrakech · Quartier Hivernage",
  },
  {
    src: "/tanneurs/lifestyle/olive-trees.webp",
    alt: "Woman in cream linen with a Maison Tanneurs tote among Mediterranean olive trees",
    place: "Beneath the Olives",
    location: "Atlas foothills · Spring",
  },
  {
    src: "/tanneurs/lifestyle/bench-desert.webp",
    alt: "Woman seated under a cream canopy in the Saharan dunes with a Maison Tanneurs bag",
    place: "Across the Sand",
    location: "Erg Chebbi · Golden hour",
  },
]

export function LifestyleTriptych() {
  return (
    <section
      data-nav-theme="dark"
      className="bg-[var(--color-paper)] text-[var(--color-ink)] py-20 lg:py-28 px-6 lg:px-10"
      aria-label="Three settings, one piece"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-14 lg:mb-20 max-w-2xl mx-auto">
          <span className="tech-label block mb-5">§03.5 · Carried Across Worlds</span>
          <h2 className="font-display text-[clamp(28px,3.6vw,46px)] leading-[1.1] tracking-[-0.008em] text-balance">
            One piece. Three settings. Same fourteen-day rhythm.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {FRAMES.map((f, i) => (
            <figure key={f.src} className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-plate)]">
                <Image
                  src={f.src}
                  alt={f.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
              <figcaption className="pt-5 flex items-baseline gap-3">
                <span className="font-display text-2xl text-[var(--color-ink-muted)]">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-display text-lg leading-tight">{f.place}</p>
                  <p className="tech-meta mt-1">{f.location}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
