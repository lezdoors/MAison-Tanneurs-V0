"use client"

import { Analytics } from "@vercel/analytics/next"
import { useEffect, useState } from "react"
import { onConsentChange, readConsent } from "@/lib/consent"

// Vercel Analytics — gated behind consent so it doesn't drop tracking
// cookies before the user has chosen. Vercel's library actually doesn't
// drop persistent cookies, but mounting it conditionally is the cleanest
// "we mean it" stance for the cookie banner.
export function ConsentedAnalytics() {
  const [granted, setGranted] = useState(false)
  useEffect(() => {
    setGranted(readConsent() === "granted")
    return onConsentChange((s) => setGranted(s === "granted"))
  }, [])
  if (!granted) return null
  return <Analytics />
}
