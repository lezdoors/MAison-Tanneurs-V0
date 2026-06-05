import { NextRequest, NextResponse } from "next/server"
import { createOrder } from "@/lib/revolut"
import { fetchProductBySlug, productHero, productNumber } from "@/lib/supabase"

// POST /api/checkout — single-product checkout for the reserve-mode site.
// Body: { slug: string, email?: string }
// Returns { url } — the Revolut hosted checkout to redirect the customer to.
//
// Currency: USD display + charge — matches Meta catalog + main site + ad
// account. Revolut auto-FX-settles to GBP on the Akal merchant.
//
// If REVOLUT_SECRET_KEY is unset (no env on this deploy yet), returns 503
// with a soft message so the client can fall back to mailto:reserve.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const CURRENCY = "USD"

export async function POST(request: NextRequest) {
  if (!process.env.REVOLUT_SECRET_KEY) {
    return NextResponse.json(
      { ok: false, reason: "checkout-unavailable", message: "Reserve via email instead" },
      { status: 503 },
    )
  }

  // Origin used for Revolut redirect_url + image absolute URLs MUST come
  // from a server-controlled env, not the (attacker-controlled) Host header.
  // Falling back to request.headers.get("host") is an open-redirect vector:
  // a poisoned Host would send the customer to an attacker domain after
  // payment. Fail closed if NEXT_PUBLIC_SITE_URL isn't set.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    console.error("[checkout] NEXT_PUBLIC_SITE_URL is not set — refusing to use Host header")
    return NextResponse.json(
      { ok: false, reason: "misconfigured", message: "Reserve via email instead" },
      { status: 503 },
    )
  }

  let body: { slug?: string; email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-json" }, { status: 400 })
  }

  const slug = (body?.slug || "").trim().toLowerCase()
  if (!slug) return NextResponse.json({ ok: false, reason: "missing-slug" }, { status: 400 })

  const product = await fetchProductBySlug(slug)
  if (!product) return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 })
  if (product.available_quantity <= 0)
    return NextResponse.json({ ok: false, reason: "sold-out" }, { status: 409 })

  const number = productNumber(product)

  try {
    // Static redirect_url — Revolut does NOT substitute `{order_id}`
    // templates. On success Revolut appends `?order_id=<id>` (or similar)
    // to the URL; the thank-you page reads it from window.location.
    // Tracking the order via metadata + the webhook is the source of
    // truth, not the redirect URL.
    const order = await createOrder({
      amount: product.price,
      currency: CURRENCY,
      description: `${product.title}${number ? ` (${number})` : ""}`,
      customer_email: body.email,
      redirect_url: `${siteUrl}/thank-you`,
      capture_mode: "automatic",
      metadata: {
        slug,
        product_number: number,
        product_title: product.title,
        hero_image: `${siteUrl}${productHero(product)}`,
        site: "maison-tanneurs-v0",
      },
    })

    return NextResponse.json({ ok: true, url: order.checkout_url, order_id: order.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown"
    console.error("[checkout] Revolut createOrder failed:", message)
    return NextResponse.json({ ok: false, reason: "revolut-error", message }, { status: 502 })
  }
}
