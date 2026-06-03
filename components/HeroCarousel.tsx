"use client"

import { useEffect, useRef, useState } from "react"

type Slide = {
  kind: "still" | "video"
  src: string
  poster?: string
  alt: string
  numeral: string
  chapter: string
  duration: number
}

// Four-beat editorial hero — three stills + one video. Numerals as chapter
// markers (I–IV). Duration is per slide; video starts/restarts on becoming active.
const SLIDES: Slide[] = [
  {
    kind: "still",
    src: "/tanneurs/hero/hero-bag-rocks.webp",
    alt: "Cognac leather bag on hewn stone in a chalk-rose ryad with carved Moorish arches",
    numeral: "I",
    chapter: "Quietly Built",
    duration: 7000,
  },
  {
    kind: "video",
    src: "/tanneurs/cinema/model-dune-walk.mp4",
    poster: "/tanneurs/cinema/model-dune-walk.webp",
    alt: "Woman in cream linen walking across Saharan dunes, cognac bag in hand",
    numeral: "II",
    chapter: "Across the Sand",
    duration: 8400,
  },
  {
    kind: "still",
    src: "/tanneurs/hero/hero-white-ryad.webp",
    alt: "Woman walking through a chalk-arched Moorish ryad",
    numeral: "III",
    chapter: "A Ryad in the Medina",
    duration: 7000,
  },
  {
    kind: "still",
    src: "/tanneurs/hero/hero-blonde-sunset.webp",
    alt: "Cognac leather duffle on a Moroccan rooftop at golden hour",
    numeral: "IV",
    chapter: "Golden Hour",
    duration: 7000,
  },
]

const FADE_MS = 900

export function HeroCarousel() {
  const [i, setI] = useState(0)
  const [mounted, setMounted] = useState(false)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    const t = setTimeout(() => setI((x) => (x + 1) % SLIDES.length), SLIDES[i].duration)
    return () => clearTimeout(t)
  }, [i, mounted])

  useEffect(() => {
    videoRefs.current.forEach((v, idx) => {
      if (!v) return
      if (idx === i) {
        v.currentTime = 0
        v.play().catch(() => {})
      } else {
        v.pause()
      }
    })
  }, [i])

  const active = SLIDES[i]

  return (
    <section
      data-nav-theme="light"
      className="relative w-full h-screen min-h-[640px] max-h-[920px] overflow-hidden bg-[var(--color-warm-black)]"
      aria-label="Maison Tanneurs — opening film"
    >
      {SLIDES.map((s, idx) => {
        const isActive = idx === i
        const isStill = s.kind === "still"
        return (
          <div
            key={idx}
            aria-hidden={!isActive}
            className="absolute inset-0 transition-opacity ease-out"
            style={{ opacity: isActive ? 1 : 0, transitionDuration: `${FADE_MS}ms`, zIndex: isActive ? 2 : 1 }}
          >
            {isStill ? (
              <img
                src={s.src}
                alt={s.alt}
                loading={idx === 0 ? "eager" : "lazy"}
                className={`absolute inset-0 w-full h-full object-cover ${isActive ? "hero-kenburns" : ""}`}
                style={{ animationPlayState: isActive ? "running" : "paused" }}
              />
            ) : (
              <>
                <img src={s.poster!} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
                <video
                  ref={(el) => { videoRefs.current[idx] = el }}
                  autoPlay={idx === 0}
                  muted
                  loop
                  playsInline
                  poster={s.poster}
                  preload={idx === 0 ? "auto" : "metadata"}
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src={s.src} type="video/mp4" />
                </video>
              </>
            )}
          </div>
        )
      })}

      {/* Scrim — softens copy at the bottom edge */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 via-black/15 to-transparent pointer-events-none z-[3]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-[3]" />

      {/* Bottom-left chapter title */}
      <div className="absolute bottom-12 lg:bottom-20 left-6 lg:left-10 right-6 z-[5] text-[var(--color-ivory)] max-w-3xl">
        <div className="flex items-baseline gap-4 mb-4">
          <span className="font-display text-2xl text-[var(--color-ivory-soft)]">{active.numeral}</span>
          <span className="tech-label tech-label--ondark">Vol. I · Marrakech</span>
        </div>
        <h1 className="font-display text-[clamp(36px,6vw,84px)] leading-[1.05] tracking-[-0.01em] text-balance">
          Hand-stitched in Marrakech.
          <br />
          Numbered, never restocked.
        </h1>
        <p className="mt-6 max-w-xl text-sm lg:text-base text-[var(--color-ivory-soft)] leading-relaxed">
          {active.chapter} — full-grain leather, solid brass, waxed linen thread. Fourteen days from hide to final stitch.
        </p>
      </div>

      {/* Bottom-right progress chips */}
      <div className="absolute bottom-12 lg:bottom-20 right-6 lg:right-10 z-[5] hidden md:flex items-center gap-3 text-[var(--color-ivory)]">
        <span className="text-xs tracking-[0.22em] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
        <span className="w-12 h-px bg-[var(--color-rule-on-dark)]" />
        <span className="text-xs tracking-[0.22em] tabular-nums text-[var(--color-ivory-soft)]">{String(SLIDES.length).padStart(2, "0")}</span>
      </div>
    </section>
  )
}
