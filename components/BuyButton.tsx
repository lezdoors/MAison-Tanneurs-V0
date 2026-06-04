"use client"

import { useState } from "react"
import { formatPrice } from "@/lib/supabase"

type Props = {
  slug: string
  title: string
  price: number
  number?: string
}

// Client-side checkout trigger. POSTs to /api/checkout, redirects to
// Revolut hosted checkout on success. Falls back gracefully to mailto
// reserve when Revolut env isn't configured (503).
export function BuyButton({ slug, title, price, number }: Props) {
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
      // Checkout not available (e.g. env unset on first deploy) — fall back to mailto
      if (res.status === 503) {
        window.location.href = reserveMailto
        return
      }
      setError(json?.message || json?.reason || "Checkout unavailable. Please email us.")
    } catch (e) {
      setError("Network error. Please try again or email us.")
    } finally {
      setLoading(false)
    }
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
