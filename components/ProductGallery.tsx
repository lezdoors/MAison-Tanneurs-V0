"use client"

import Image from "next/image"
import { useRef, useState } from "react"

// PDP gallery with hover-zoom on desktop + click-to-zoom on touch.
// Tracks cursor inside the image area and shifts background-position.
// Each row maintains 4:5 aspect and falls back to plain <Image> at small
// widths where hover-zoom isn't useful.
type Props = { images: string[]; title: string }

function Frame({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    setPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos(null)}
      className="relative w-full aspect-[4/5] overflow-hidden bg-[var(--color-plate)] group cursor-zoom-in"
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 58vw"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className={`object-cover transition-opacity duration-300 ${pos ? "opacity-0 lg:opacity-0" : "opacity-100"}`}
      />
      {/* Hover-zoom layer — only renders when cursor is in-frame on desktop */}
      {pos && (
        <div
          className="absolute inset-0 hidden lg:block pointer-events-none transition-opacity duration-150"
          style={{
            backgroundImage: `url("${src}")`,
            backgroundSize: "180%",
            backgroundPosition: `${pos.x}% ${pos.y}%`,
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </div>
  )
}

export function ProductGallery({ images, title }: Props) {
  return (
    <div className="space-y-6">
      {images.map((src, i) => (
        <Frame key={src + i} src={src} alt={`${title} — view ${i + 1}`} priority={i === 0} />
      ))}
    </div>
  )
}
