"use client"

import { useEffect, useRef, useState } from "react"

type Slide = {
  kind: "still" | "video"
  src: string
  poster?: string
  alt: string
  numeral: string
  chapter: string
  caption: string
  duration: number
}

// Three-beat editorial hero (assets chosen by Ryan, 2026-06-03).
// Two stills + one video — desert, generated-loop, Berber.
const SLIDES: Slide[] = [
  {
    kind: "still",
    src: "/tanneurs/hero/dune-white-bag.webp",
    alt: "Woman in cream linen on a Saharan dune ridge, carrying a Maison Tanneurs leather bag",
    numeral: "I",
    chapter: "Across the Sand",
    caption: "Cream linen, cognac leather — the contrast our register is built on.",
    duration: 7400,
  },
  {
    kind: "video",
    src: "/tanneurs/hero/dune-video.mp4",
    poster: "/tanneurs/hero/dune-video.webp",
    alt: "Cinematic loop — Maison Tanneurs object in the Moroccan desert",
    numeral: "II",
    chapter: "The Object, Carried",
    caption: "Filmed on location — the piece, the place, the same fourteen-day rhythm.",
    duration: 9200,
  },
  {
    kind: "still",
    src: "/tanneurs/hero/berber-dunes-bag.webp",
    alt: "Berber figure walking the Saharan dunes carrying a Maison Tanneurs bag",
    numeral: "III",
    chapter: "Of the Land",
    caption: "Hand-stitched in Marrakech. Hands that know the leather they cross.",
    duration: 7400,
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
          {active.chapter} — {active.caption}
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
