import Image from "next/image"
import Link from "next/link"

// Quiet heritage band — one image, one pull quote, link to /heritage.
// No stat counters (that's the v0 template smell).
export function HeritageStrip() {
  return (
    <section
      data-nav-theme="light"
      className="relative w-full h-[80vh] min-h-[520px] overflow-hidden"
      aria-label="Heritage"
    >
      <Image
        src="/tanneurs/atelier/boutique-wide.webp"
        alt="Maison Tanneurs atelier in Marrakech — light beams through arched windows, artisans at work"
        fill
        sizes="100vw"
        loading="lazy"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[var(--color-warm-black)]/55" />

      <div className="relative z-10 h-full flex items-center justify-center px-6 lg:px-10 text-center">
        <div className="max-w-2xl text-[var(--color-ivory)]">
          <span className="tech-label tech-label--ondark block mb-6">§08 · Heritage</span>
          <h2 className="font-display text-[clamp(28px,4vw,52px)] leading-[1.15] tracking-[-0.005em] text-balance mb-6">
            Hand-stitched in Marrakech. Carried everywhere.
          </h2>
          <p className="text-[14px] lg:text-[15px] leading-[1.8] text-[var(--color-ivory-soft)] max-w-prose mx-auto mb-10">
            A single workshop, seven artisans, fourteen days from hide to final stitch. Numbered, never restocked.
            Built to outlive whoever first carries it.
          </p>
          <Link
            href="/heritage"
            className="inline-flex items-center text-[11px] tracking-[0.32em] uppercase border-b border-[var(--color-ivory)] pb-1 hover:border-transparent transition-colors"
          >
            Read the Heritage
          </Link>
        </div>
      </div>
    </section>
  )
}
