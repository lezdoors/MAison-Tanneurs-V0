import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ConsentedAnalytics } from "@/components/ConsentedAnalytics"
import { CookieConsent } from "@/components/CookieConsent"
import { MetaPixel } from "@/components/MetaPixel"
import { JsonLd } from "@/components/JsonLd"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://maison-tanneurs-v0.vercel.app"

// Viewport — mobile-first. interactiveWidget keeps the sticky bottom CTA
// pinned above the iOS Safari URL bar collapse.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8f6f1",
}

// Organization schema — primary entity. AI search citation engines
// (Perplexity, ChatGPT browse) anchor brand answers on this.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Maison Tanneurs",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    "Hand-stitched full-grain leather goods from a small atelier in Marrakech. Numbered, never restocked.",
  sameAs: [
    "https://www.instagram.com/maisontanneurs",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Marrakech",
    addressCountry: "MA",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "hello@maisontanneurs.com",
    telephone: "+44 7828 726017",
    areaServed: "Worldwide",
    availableLanguage: ["English", "French"],
  },
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Maison Tanneurs",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/products?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Maison Tanneurs — Hand-stitched leather from Marrakech",
    template: "%s · Maison Tanneurs",
  },
  description:
    "Hand-stitched full-grain leather from a small atelier in Marrakech. Numbered, never restocked. Fourteen days from hide to final stitch.",
  applicationName: "Maison Tanneurs",
  openGraph: {
    type: "website",
    siteName: "Maison Tanneurs",
    title: "Maison Tanneurs — Hand-stitched leather from Marrakech",
    description:
      "Hand-stitched full-grain leather from a small atelier in Marrakech. Numbered, never restocked.",
    url: SITE_URL,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Maison Tanneurs" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maison Tanneurs — Hand-stitched leather from Marrakech",
    description: "Hand-stitched full-grain leather from a small atelier in Marrakech.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preload the variable font so the first paint uses Fraunces, not the system serif. */}
        <link
          rel="preload"
          href="/fonts/fraunces/Fraunces-VariableFont.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased font-body">
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        {children}
        <CookieConsent />
        <MetaPixel />
        <ConsentedAnalytics />
      </body>
    </html>
  )
}
