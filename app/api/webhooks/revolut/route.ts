import { NextRequest, NextResponse } from "next/server"
import { getOrder, verifyWebhookSignature, type RevolutOrder } from "@/lib/revolut"
import { notifyTelegram, escapeHTML } from "@/lib/notify-telegram"
import { fetchProductBySlug } from "@/lib/supabase"
import { sendOrderConfirmation, sendAdminNotification, type OrderItem } from "@/lib/email"
import { sendPurchaseToCAPI } from "@/lib/meta-capi"

// Revolut webhook — fires on order.state transitions. We care about
// ORDER_COMPLETED (payment captured). On that event:
//   1. Re-fetch the canonical order via API (don't trust webhook payload)
//   2. Telegram-ping Ryan with the order detail
//   3. Send Resend customer confirmation + admin notification
//   4. Mirror Purchase event to Meta CAPI (dedup with browser Pixel)
//
// Signature verification: HMAC-SHA256 over `v1.{ts}.{body}` using
// REVOLUT_WEBHOOK_SECRET. 5-min replay tolerance. All side effects after
// signature verification are fire-and-forget — Revolut requires 2xx within 5s.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface WebhookPayload {
  event: string
  timestamp: string
  order_id: string
  merchant_order_ext_ref?: string
}

export async function POST(request: NextRequest) {
  const raw = await request.text()
  const signatureHeader = request.headers.get("revolut-signature")
  const timestampHeader = request.headers.get("revolut-request-timestamp")
  const secret = process.env.REVOLUT_WEBHOOK_SECRET

  if (!secret) {
    console.error("[revolut webhook] REVOLUT_WEBHOOK_SECRET not set")
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  const sigCheck = verifyWebhookSignature({
    rawBody: raw,
    signatureHeader,
    timestampHeader,
    secret,
  })
  if (!sigCheck.valid) {
    console.warn("[revolut webhook] signature rejected:", sigCheck.reason)
    return NextResponse.json({ ok: false, reason: sigCheck.reason }, { status: 401 })
  }

  let payload: WebhookPayload
  try {
    payload = JSON.parse(raw) as WebhookPayload
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-json" }, { status: 400 })
  }

  if (payload.event !== "ORDER_COMPLETED") {
    return NextResponse.json({ ok: true, ignored: payload.event })
  }

  let order: RevolutOrder
  try {
    order = await getOrder(payload.order_id)
  } catch (err) {
    console.error("[revolut webhook] getOrder failed:", err)
    return NextResponse.json({ ok: false }, { status: 502 })
  }

  const slug = order.metadata?.slug || ""
  const number = order.metadata?.product_number || ""
  const amountMajor = order.amount / 100
  const currency = (order.currency || "EUR").toUpperCase()

  // Telegram alert — fire-and-forget, never block the webhook response
  const telegramText =
    `🎉 <b>New Maison Tanneurs order</b>\n\n` +
    `<b>Piece:</b> ${escapeHTML(slug)}${number ? ` · ${number}` : ""}\n` +
    `<b>Total:</b> ${amountMajor.toFixed(2)} ${currency}\n` +
    `<b>Order:</b> <code>${order.id}</code>\n` +
    `<b>State:</b> ${order.state}\n\n` +
    `Revolut dashboard: https://business.revolut.com/merchant/orders/${order.id}`
  notifyTelegram(telegramText).catch((err) => console.error("[telegram] failed:", err))

  // Re-fetch product for canonical title + image (don't trust order.line_items[*].name
  // because Revolut may truncate or transform). Falls back gracefully if the SKU was
  // hidden/removed between checkout and webhook.
  const product = slug ? await fetchProductBySlug(slug).catch(() => null) : null
  const itemTitle = product?.title || order.metadata?.title || slug || "Maison Tanneurs piece"
  const items: OrderItem[] = [
    {
      title: itemTitle,
      price: order.amount, // single-item: order total == line total
      quantity: 1,
    },
  ]

  const customerEmail = order.customer?.email || ""
  const customerName = order.customer?.full_name || ""
  const shippingAddress = order.shipping_address
    ? {
        line1: order.shipping_address.street_line_1,
        line2: order.shipping_address.street_line_2,
        city: order.shipping_address.city,
        state: order.shipping_address.region,
        postal_code: order.shipping_address.postcode,
        country: order.shipping_address.country_code,
      }
    : undefined

  // Customer confirmation + admin notification (Resend) — non-blocking
  ;(async () => {
    try {
      if (customerEmail) {
        await sendOrderConfirmation({
          to: customerEmail,
          orderNumber: number || order.id,
          customerName,
          items,
          total: order.amount,
          currency,
        })
      }
      await sendAdminNotification({
        orderNumber: number || order.id,
        customerName,
        customerEmail,
        items,
        total: order.amount,
        currency,
        shippingAddress,
      })
    } catch (err) {
      console.error("[email] send failed:", err)
    }
  })().catch(() => {})

  // Meta CAPI Purchase mirror — non-blocking. Use Revolut order id as event_id
  // so it dedupes with the client-side Pixel's Purchase on /thank-you.
  ;(async () => {
    try {
      const [firstName, ...rest] = (customerName || "").split(" ")
      const lastName = rest.join(" ")
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.maisontanneurs.com"
      await sendPurchaseToCAPI({
        email: customerEmail || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: order.customer?.phone,
        city: shippingAddress?.city,
        state: shippingAddress?.state,
        zip: shippingAddress?.postal_code,
        country: shippingAddress?.country,
        value: amountMajor,
        currency,
        orderNumber: order.id,
        items: [
          {
            id: slug || order.id,
            quantity: 1,
            price: amountMajor,
          },
        ],
        fbp: order.metadata?.meta_fbp,
        fbc: order.metadata?.meta_fbc,
        eventSourceUrl: `${siteUrl}/thank-you?order=${order.id}`,
      })
    } catch (err) {
      console.error("[CAPI] failed:", err)
    }
  })().catch(() => {})

  return NextResponse.json({ ok: true, order_id: order.id })
}
