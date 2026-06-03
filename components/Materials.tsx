import Image from "next/image"

// Three materials, three macros. Sand-paper bg keeps it warm.
const MATERIALS = [
  {
    label: "Full-grain leather",
    body: "Bovine hides sourced from Mediterranean herds. Selected at the tannery for grain consistency and weight. Patinas with use, never peels.",
    image: "/tanneurs/materials/full-grain.webp",
    alt: "Full-grain bovine leather hide",
  },
  {
    label: "Solid brass",
    body: "Buckles, rivets and feet — all solid brass, no plating. Tarnish softens into character. Hardware that outlives the bag it sits on.",
    image: "/tanneurs/materials/solid-brass.webp",
    alt: "Solid brass hardware on a finished bag",
  },
  {
    label: "Waxed linen thread",
    body: "Hand-laid two-needle saddle stitch. Slower than machine. Each seam crosses the next, locking the panel. The stitch outlives the bag.",
    // Macro of a tooled crossbody — shows the saddle-stitch in product context,
    // distinct from the brass-awl scene used in Craftsmanship/Stitch.
    image: "/tanneurs/materials/waxed-linen.webp",
    alt: "Saddle-stitched detail on a tooled walnut crossbody",
  },
]

export function Materials() {
  return (
    <section
      data-nav-theme="dark"
      className="bg-[var(--color-paper-alt)] text-[var(--color-ink)] py-20 lg:py-32 px-6 lg:px-10"
      aria-label="Materials"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-14 lg:mb-20">
          <span className="tech-label block mb-5">§07 · Materials</span>
          <h2 className="font-display text-[clamp(30px,4vw,56px)] leading-[1.1] tracking-[-0.01em] text-balance">
            Built from things that age well.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          {MATERIALS.map((m) => (
            <div key={m.label}>
              <div className="relative aspect-[4/3] overflow-hidden mb-6 bg-[var(--color-plate)]">
                <Image
                  src={m.image}
                  alt={m.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                  className="object-cover"
                />
              </div>
              <p className="tech-label mb-3">{m.label}</p>
              <p className="text-[14px] leading-[1.75] text-[var(--color-ink-soft)] max-w-sm">{m.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
