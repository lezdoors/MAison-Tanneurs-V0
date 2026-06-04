import Link from "next/link"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { fulfillOrder } from "@/lib/fulfill-order"

export const metadata = {
  title: "Thank you",
  description: "Your Maison Tanneurs order has been received.",
  robots: { index: false, follow: false },
}

// Revolut redirects the buyer here with `?order={order_id}` after a successful
// hosted checkout. Since Revolut webhooks aren't configured on this account,
// /thank-you is the canonical fulfillment trigger:
//   - Confirm order state via Revolut API
//   - Persist to Supabase orders table (idempotent on revolut_order_id)
//   - Fire Resend confirmation + admin notification
//   - Fire Telegram alert
//   - Mirror Purchase event to Meta CAPI
// Customer refreshes are safe — the helper short-circuits on existing rows.

export const dynamic = "force-dynamic"

function fmt(minor: number, currency: string): string {
  const major = minor / 100
  const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "USD" ? "$" : ""
  const n = major.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  return symbol ? `${symbol}${n}` : `${n} ${currency}`
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; revolut_order_id?: string; order_status?: string }>
}) {
  const params = await searchParams
  // Revolut appends ?revolut_order_id=<id>&order_status=COMPLETED on hosted
  // checkout success. Accept either param name so dev/test flows still work.
  const orderId = params?.revolut_order_id || params?.order || ""

  // Trigger fulfillment side effects (idempotent). Failures here don't block
  // the page — the customer always sees the thank-you, and we log internally.
  const fulfillment = orderId ? await fulfillOrder(orderId) : null

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
            Thank you{fulfillment?.view?.customerName ? `, ${fulfillment.view.customerName.split(" ")[0]}` : ""}.
          </h1>
          <p className="text-[15px] lg:text-[17px] leading-[1.85] text-[var(--color-ink-soft)] max-w-prose mx-auto mb-10">
            Your piece is numbered and entering the queue at our Marrakech atelier. You&apos;ll receive a
            confirmation email shortly, and a second email with tracking once the piece leaves the workshop —
            fourteen days, typically.
          </p>

          {fulfillment?.view && (
            <div className="mb-12 pt-8 border-t border-[var(--color-rule)]">
              <p className="tech-meta mb-3">
                Order reference ·{" "}
                <span className="text-[var(--color-ink)] tracking-[0.18em]">{fulfillment.view.orderNumber}</span>
              </p>
              <p className="font-display text-2xl">{fmt(fulfillment.view.total, fulfillment.view.currency)}</p>
              <ul className="mt-4 text-[14px] text-[var(--color-ink-soft)] space-y-1">
                {fulfillment.view.items.map((i) => (
                  <li key={i.title}>
                    {i.title}
                    {i.quantity > 1 ? ` × ${i.quantity}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {orderId && !fulfillment?.view && (
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
