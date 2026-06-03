import Image from "next/image"

// Cut · Stitch · Finish — three numbered steps on warm dark stone.
// The visual unpacking of the editorial film that precedes it.
const STEPS = [
  {
    numeral: "I",
    label: "Cut",
    body: "Patterns drawn by hand. Every panel inspected before it joins another.",
    image: "/tanneurs/atelier/cut-leather-table.webp",
    alt: "Leather cut by hand on the atelier workbench",
  },
  {
    numeral: "II",
    label: "Stitch",
    body: "Saddle-stitched in waxed linen. Two needles, every seam by hand.",
    image: "/tanneurs/atelier/stitch-hands.webp",
    alt: "Artisan hands saddle-stitching with brass awl",
  },
  {
    numeral: "III",
    label: "Finish",
    body: "Edges burnished, hardware set, lining laid. The piece is numbered.",
    image: "/tanneurs/atelier/finish-atelier.webp",
    alt: "Finished cognac leather bag in the Marrakech atelier",
  },
]

export function Craftsmanship() {
  return (
    <section
      data-nav-theme="light"
      className="bg-[var(--color-warm-black)] text-[var(--color-ivory)] py-20 lg:py-32 px-6 lg:px-10"
      aria-label="The process"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-14 lg:mb-20">
          <span className="tech-label tech-label--ondark block mb-5">§04 · The Process</span>
          <h2 className="font-display text-[clamp(30px,4vw,56px)] leading-[1.1] tracking-[-0.01em] text-balance">
            Cut. Stitch. Finish.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          {STEPS.map((s) => (
            <figure key={s.numeral}>
              <div className="relative aspect-square overflow-hidden mb-6 bg-[var(--color-warm-black)]/40">
                <Image
                  src={s.image}
                  alt={s.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                  className="object-cover"
                />
              </div>
              <figcaption>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-display text-2xl text-[var(--color-ivory-soft)]">{s.numeral}</span>
                  <span className="tech-label tech-label--ondark">{s.label}</span>
                </div>
                <p className="text-[14px] leading-[1.75] text-[var(--color-ivory-soft)] max-w-sm">{s.body}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
