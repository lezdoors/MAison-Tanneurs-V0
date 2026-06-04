"use client"

import Script from "next/script"
import { useEffect, useState } from "react"
import { onConsentChange, readConsent } from "@/lib/consent"

// GA4 — only loads after consent='granted', same gate as Meta Pixel.
// No env? No script. No consent? No script.
const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID

export function GoogleAnalytics() {
  const [granted, setGranted] = useState(false)
  useEffect(() => {
    setGranted(readConsent() === "granted")
    return onConsentChange((s) => setGranted(s === "granted"))
  }, [])

  if (!GA4_ID || !granted) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA4_ID}', { send_page_view: true });
      `}</Script>
    </>
  )
}
