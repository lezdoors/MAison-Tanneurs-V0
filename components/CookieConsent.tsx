"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { readConsent, writeConsent } from "@/lib/consent"

// Brand-tonal bottom strip. Appears only when consent is unset. Two
// outlined buttons (Accept / Decline) in the warm-charcoal register.
// One-line description, link to Privacy. Hidden after user choice or
// after dismissal — choice persists in localStorage.
export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (readConsent() === "unset") setShow(true)
  }, [])

  if (!show) return null

  const decide = (state: "granted" | "denied") => {
    writeConsent(state)
    setShow(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-50 bg-[var(--color-warm-black)] text-[var(--color-ivory)] border-t border-[var(--color-rule-on-dark)]"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-5 lg:py-6 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
        <p className="text-[13px] leading-relaxed text-[var(--color-ivory-soft)] flex-1 max-w-3xl">
          We use essential cookies to make the site work, and analytics + Meta Pixel cookies (with your
          consent) to understand traffic and improve the edition. See our{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
            privacy policy
          </Link>{" "}
          for the full list.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => decide("denied")}
            className="text-[10px] tracking-[0.28em] uppercase px-5 py-3 border border-[var(--color-rule-on-dark)] text-[var(--color-ivory-soft)] hover:text-[var(--color-ivory)] hover:border-[var(--color-ivory)] transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => decide("granted")}
            className="text-[10px] tracking-[0.28em] uppercase px-5 py-3 bg-[var(--color-ivory)] text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
