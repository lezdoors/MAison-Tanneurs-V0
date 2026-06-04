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
  /** object-position on desktop (≥768px). Defaults to "center center". */
  focal?: string
  /** object-position on mobile portrait. Defaults to focal or "center center". */
  mobileFocal?: string
}

// Three-beat editorial hero (assets chosen by Ryan, 2026-06-03).
// Focal points keep the SUBJECT — model + leather bag, Berber figure +
// bag — in frame from 360px portrait to ultra-wide cinema 21:9.
//
// Source images are 1.78:1; on hero boxes wider than that (any normal
// desktop), object-cover scales to fill width and crops top+bottom.
// Per-slide focal moves the crop window so the bag (the product, the
// point) never disappears off the bottom edge.
const SLIDES: Slide[] = [
  {
    kind: "still",
    src: "/tanneurs/hero/dune-white-bag.webp",
    alt: "Woman in cream linen on a Saharan dune ridge, carrying a Maison Tanneurs leather bag",
    numeral: "I",
    chapter: "Across the Sand",
    caption: "Cream linen, cognac leather — the contrast our register is built on.",
    duration: 7400,
    focal: "center 68%",       // pull crop DOWN so the bag at hip-level stays visible
    mobileFocal: "55% 62%",
  },
  {
    kind: "video",
    src: "/tanneurs/hero/hero-loop.mp4",
    poster: "/tanneurs/hero/hero-loop.webp",
    alt: "Cinematic loop — Maison Tanneurs leather bag at the edge of the sea",
    numeral: "II",
    chapter: "At the Edge",
    caption: "Filmed on location — the piece, the place, the same fourteen-day rhythm.",
    duration: 6000,            // source is 5s; loop with 1s fade overlap
    focal: "center 55%",
    mobileFocal: "center 50%",
  },
  {
    kind: "still",
    src: "/tanneurs/hero/berber-dunes-bag.webp",
    alt: "Berber figure walking the Saharan dunes carrying a Maison Tanneurs bag",
    numeral: "III",
    chapter: "Of the Land",
    caption: "Hand-stitched in Marrakech. Hands that know the leather they cross.",
    duration: 7400,
    focal: "65% 55%",          // Berber sits right-of-centre; nudge crop right
    mobileFocal: "60% 50%",
  },
]

const FADE_MS = 900

export function HeroCarousel() {
  const [i, setI] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

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
      // Full viewport height — no max-h cap. On 4K displays this means a true
      // 100svh cinema; on laptops it still fills. min-h-[680] guarantees a
      // strong above-the-fold presence on shorter portrait windows.
      className="relative w-full h-[100svh] min-h-[680px] overflow-hidden bg-[var(--color-warm-black)]"
      aria-label="Maison Tanneurs — opening film"
    >
      {SLIDES.map((s, idx) => {
        const isActive = idx === i
        const isStill = s.kind === "still"
        const objectPos = (isMobile ? s.mobileFocal : s.focal) || s.focal || "center center"
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
                style={{ animationPlayState: isActive ? "running" : "paused", objectPosition: objectPos }}
              />
            ) : (
              <>
                <img
                  src={s.poster!}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: objectPos }}
                />
                <video
                  ref={(el) => { videoRefs.current[idx] = el }}
                  autoPlay={idx === 0}
                  muted
                  loop
                  playsInline
                  poster={s.poster}
                  preload={idx === 0 ? "auto" : "metadata"}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: objectPos }}
                >
                  <source src={s.src} type="video/mp4" />
                </video>
              </>
            )}
          </div>
        )
      })}

      {/* ─── Top scrim — guarantees nav contrast on any image ─── */}
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none z-[3]" />

      {/* ─── Bottom scrim — left-weighted so headline always reads,
              regardless of which side of the image the subject is on ─── */}
      <div className="absolute inset-0 pointer-events-none z-[3]"
           style={{
             background:
               "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 28%, rgba(0,0,0,0.05) 55%, transparent 70%)",
           }} />
      <div className="absolute inset-y-0 left-0 w-full md:w-2/3 lg:w-1/2 pointer-events-none z-[3]"
           style={{
             background:
               "linear-gradient(to right, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.10) 60%, transparent 100%)",
           }} />

      {/* ─── Bottom-left chapter title (text-shadow as belt-and-suspenders) ─── */}
      <div
        className="absolute bottom-10 lg:bottom-20 left-6 lg:left-10 right-6 z-[5] text-[var(--color-ivory)] max-w-3xl"
        style={{ textShadow: "0 2px 24px rgba(0,0,0,0.45)" }}
      >
        <div className="flex items-baseline gap-4 mb-4">
          <span className="font-display text-2xl text-[var(--color-ivory-soft)]">{active.numeral}</span>
          <span className="tech-label tech-label--ondark">Vol. I · Marrakech</span>
        </div>
        <h1 className="font-display text-[clamp(32px,5.6vw,80px)] leading-[1.05] tracking-[-0.01em] text-balance">
          Hand-stitched in Marrakech.
          <br />
          Numbered, never restocked.
        </h1>
        <p className="mt-5 max-w-xl text-[13px] lg:text-base text-[var(--color-ivory-soft)] leading-relaxed">
          {active.chapter} — {active.caption}
        </p>
      </div>

      {/* ─── Bottom-right progress chips ─── */}
      <div className="absolute bottom-10 lg:bottom-20 right-6 lg:right-10 z-[5] hidden md:flex items-center gap-3 text-[var(--color-ivory)]"
           style={{ textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}>
        <span className="text-xs tracking-[0.22em] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
        <span className="w-12 h-px bg-[var(--color-rule-on-dark)]" />
        <span className="text-xs tracking-[0.22em] tabular-nums text-[var(--color-ivory-soft)]">{String(SLIDES.length).padStart(2, "0")}</span>
      </div>
    </section>
  )
}
