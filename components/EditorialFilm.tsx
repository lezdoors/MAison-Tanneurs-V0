"use client"

import { useEffect, useRef, useState } from "react"

// Full-bleed cinematic film band. Auto-plays muted+looped on mount, with a
// poster fallback for slow networks / reduced-motion. Used as a chapter opener.
type Props = {
  src: string
  poster: string
  alt?: string
  pullQuote?: string
  attribution?: string
  height?: "short" | "medium" | "tall"
  navTheme?: "light" | "dark"
  /** object-position for desktop (≥768px). Defaults to "center center". */
  focal?: string
  /** object-position on mobile portrait. */
  mobileFocal?: string
}

const HEIGHTS = {
  short: "h-[40vh] min-h-[300px] lg:h-[50vh] lg:min-h-[420px]",
  medium: "h-[50vh] min-h-[360px] lg:h-[65vh] lg:min-h-[540px]",
  tall: "h-[60vh] min-h-[420px] lg:h-[80vh] lg:min-h-[640px]",
}

export function EditorialFilm({
  src,
  poster,
  alt = "",
  pullQuote,
  attribution,
  height = "medium",
  navTheme = "light",
  focal = "center center",
  mobileFocal,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [reduced, setReduced] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const objectPos = (isMobile ? mobileFocal : focal) || focal

  return (
    <section
      data-nav-theme={navTheme}
      className={`relative w-full ${HEIGHTS[height]} overflow-hidden bg-[var(--color-warm-black)]`}
      aria-label={alt}
    >
      <img
        src={poster}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: objectPos }}
      />
      {!reduced && (
        <video
          ref={ref}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: objectPos }}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      {/* Top scrim — keeps the nav legible when this section is under it */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 via-black/20 to-transparent pointer-events-none z-[2]" />

      {pullQuote && (
        <>
          <div
            className="absolute inset-0 pointer-events-none z-[2]"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 35%, transparent 65%)",
            }}
          />
          <div
            className="absolute bottom-10 left-6 lg:bottom-16 lg:left-10 right-6 lg:right-1/3 z-10 text-[var(--color-ivory)]"
            style={{ textShadow: "0 2px 18px rgba(0,0,0,0.5)" }}
          >
            <blockquote className="font-display text-2xl lg:text-4xl leading-[1.15] tracking-[-0.005em] text-balance">
              “{pullQuote}”
            </blockquote>
            {attribution && (
              <p className="mt-4 tech-label tech-label--ondark">{attribution}</p>
            )}
          </div>
        </>
      )}
    </section>
  )
}
