"use client"

import Script from "next/script"
import { useEffect, useState } from "react"
import { onConsentChange, readConsent } from "@/lib/consent"

// Meta Pixel — only loads after the user grants consent. No fbq() calls
// fire before consent is given (no "load-but-don't-fire" half-measure).
const META_PIXEL_ID = "26891834623830253"

const PIXEL_SCRIPT = `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');
fbq('track','PageView');
`

export function MetaPixel() {
  const [granted, setGranted] = useState(false)
  useEffect(() => {
    setGranted(readConsent() === "granted")
    return onConsentChange((s) => setGranted(s === "granted"))
  }, [])
  if (!granted) return null
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {PIXEL_SCRIPT}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
