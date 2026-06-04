"use client"

import { useState } from "react"
import { formatPrice } from "@/lib/supabase"

type Variant = "inline" | "sticky"

type Props = {
  slug: string
  title: string
  price: number
  number?: string
  variant?: Variant
}

// Client-side checkout trigger. POSTs to /api/checkout, redirects to
// Revolut hosted checkout on success. Falls back to mailto reserve when
// Revolut env isn't configured (503).
//
// Two render modes:
//   - inline: full-width vertical block with description text, used in the
//     desktop PDP sidebar and on mobile inline within the info column.
//   - sticky: thin fixed-bottom bar shown on mobile (lg:hidden) so the buy
//     CTA is always reachable while the customer scrolls a long gallery.
//     Matches Cucinelli / Polène / Loro Piana mobile pattern.
export function BuyButton({ slug, title, price, number, variant = "inline" }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reserveMailto = `mailto:hello@maisontanneurs.com?subject=${encodeURIComponent(
    `Reserve · ${title}`,
  )}&body=${encodeURIComponent(
    `I'd like to reserve the ${title}${number ? ` (${number})` : ""} at ${formatPrice(
      price,
    )}. Please confirm availability and lead time.`,
  )}`

  async function onClick() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
      const json = await res.json()
      if (res.ok && json?.url) {
        window.location.href = json.url
        return
      }
      if (res.status === 503) {
        window.location.href = reserveMailto
        return
      }
      setError(json?.message || json?.reason || "Checkout unavailable. Please email us.")
    } catch {
      setError("Network error. Please try again or email us.")
    } finally {
      setLoading(false)
    }
  }

  if (variant === "sticky") {
    return (
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--color-paper)]/95 backdrop-blur-md border-t border-[var(--color-rule)] px-4 py-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0) + 12px)" }}
      >
        <div className="flex items-center gap-3 max-w-[600px] mx-auto">
          <div className="flex-1 min-w-0">
            <p className="font-display text-[17px] leading-tight">{formatPrice(price)}</p>
            <p className="tech-meta text-[10px] mt-0.5 truncate">{number || "Numbered · Marrakech"}</p>
          </div>
          <button
            onClick={onClick}
            disabled={loading}
            className="flex-shrink-0 bg-[var(--color-ink)] text-[var(--color-ivory)] disabled:opacity-60 disabled:cursor-wait px-6 py-3.5 text-[11px] tracking-[0.32em] uppercase hover:bg-[var(--color-warm-black)] transition-colors"
          >
            {loading ? "…" : "Add to bag"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onClick}
        disabled={loading}
        className="block w-full bg-[var(--color-ink)] text-[var(--color-ivory)] hover:bg-[var(--color-warm-black)] disabled:opacity-60 disabled:cursor-wait text-center px-10 py-5 text-[11px] tracking-[0.32em] uppercase transition-colors"
      >
        {loading ? "Opening checkout…" : `Buy now — ${formatPrice(price)}`}
      </button>
      {error && (
        <p className="text-xs text-[var(--color-oxblood)] leading-relaxed">
          {error} · <a href={reserveMailto} className="underline underline-offset-2">Reserve by email</a>
        </p>
      )}
      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
        Numbered and made in limited quantity. Secure checkout via Revolut. Fourteen-day lead time from
        Marrakech.
      </p>
    </div>
  )
}
