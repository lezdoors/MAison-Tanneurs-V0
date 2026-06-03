import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://maison-tanneurs-rocco.vercel.app"

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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
