import Link from "next/link"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"

export const metadata = {
  title: "Thank you",
  description: "Your Maison Tanneurs order has been received.",
  robots: { index: false, follow: false },
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const params = await searchParams
  const orderId = params?.order ?? ""

  return (
    <main className="min-h-screen">
      <Navigation />

      <section
        data-nav-theme="dark"
        className="bg-[var(--color-paper)] text-[var(--color-ink)] pt-32 lg:pt-40 pb-24 lg:pb-32 px-6 lg:px-10"
      >
        <div className="max-w-2xl mx-auto text-center">
          <span className="tech-label block mb-6">Order received</span>
          <h1 className="font-display text-[clamp(36px,5vw,68px)] leading-[1.05] tracking-[-0.012em] mb-6 text-balance">
            Thank you.
          </h1>
          <p className="text-[15px] lg:text-[17px] leading-[1.85] text-[var(--color-ink-soft)] max-w-prose mx-auto mb-10">
            Your piece is numbered and entering the queue at our Marrakech atelier. You&apos;ll receive a
            confirmation email shortly, and a second email with tracking once the piece leaves the workshop —
            fourteen days, typically.
          </p>

          {orderId && (
            <p className="tech-meta mb-12">
              Order reference · <span className="text-[var(--color-ink)] tracking-[0.18em]">{orderId}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center text-[11px] tracking-[0.32em] uppercase bg-[var(--color-ink)] text-[var(--color-ivory)] px-7 py-4 hover:bg-[var(--color-warm-black)] transition-colors"
            >
              Continue the Edition
            </Link>
            <a
              href="mailto:hello@maisontanneurs.com"
              className="inline-flex items-center text-[11px] tracking-[0.32em] uppercase border border-[var(--color-rule)] text-[var(--color-ink)] px-7 py-4 hover:border-[var(--color-ink)] transition-colors"
            >
              Write to the Atelier
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
