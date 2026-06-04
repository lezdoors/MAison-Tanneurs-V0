import { NextRequest, NextResponse } from "next/server"
import { getOrder, verifyWebhookSignature, type RevolutOrder } from "@/lib/revolut"
import { notifyTelegram, escapeHTML } from "@/lib/notify-telegram"
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email"
import { sendPurchaseToCAPI } from "@/lib/meta-capi"

// Revolut webhook — fires on order.state transitions. On ORDER_COMPLETED:
//   1. Re-fetch the canonical order via Revolut API (don't trust webhook body)
//   2. Send branded order confirmation to customer (Resend)
//   3. Send admin notification (Resend → hello@maisontanneurs.com)
//   4. Fire Meta CAPI Purchase event (server-side, dedupes with client Pixel)
//   5. Telegram-ping with order detail
//
// Each downstream is wrapped — a single failure (e.g. Resend hiccup) MUST
// NOT keep us from ACK'ing the webhook. Revolut requires 2xx within ~5s.
//
// Signature: HMAC-SHA256(`v1.{ts}.{body}`, REVOLUT_WEBHOOK_SECRET).
// If REVOLUT_WEBHOOK_SECRET isn't set, we 200-ACK silently (Ryan's call:
// site relies on the redirect_url + Revolut dashboard, not webhook).

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
    // Webhook secret not configured — ACK to keep Revolut happy, no-op downstream.
    return NextResponse.json({ ok: true, note: "webhook-secret-not-configured" })
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
  const productNumber = order.metadata?.product_number || ""
  const totalMajor = order.amount / 100

  // Resolve item metadata from line items (Revolut returns these on the order)
  const lineItems = (order as unknown as { line_items?: Array<{ name?: string; unit_price_amount?: number; quantity?: { value?: number } }> }).line_items || []
  const items = lineItems.length > 0
    ? lineItems.map((li) => ({
        title: li.name || slug,
        price: (li.unit_price_amount ?? order.amount) / 100,
        quantity: li.quantity?.value ?? 1,
      }))
    : [{ title: slug, price: totalMajor, quantity: 1 }]

  const customerEmail = (order as unknown as { customer?: { email?: string; full_name?: string } }).customer?.email
  const customerName = (order as unknown as { customer?: { email?: string; full_name?: string } }).customer?.full_name || ""
  const shippingAddress = (order as unknown as { shipping_address?: Record<string, string> }).shipping_address

  // 1) Customer confirmation — branded Maison Tanneurs (Resend)
  if (customerEmail) {
    sendOrderConfirmation({
      to: customerEmail,
      orderNumber: order.id,
      customerName,
      items: items.map((i) => ({ title: i.title, price: i.price * 100, quantity: i.quantity })), // back to cents for formatPrice
      total: order.amount,
    }).catch((err) => console.error("[revolut webhook] sendOrderConfirmation failed:", err))
  }

  // 2) Admin notification — internal ops
  sendAdminNotification({
    orderNumber: order.id,
    customerName,
    customerEmail: customerEmail || "(no email)",
    items: items.map((i) => ({ title: i.title, price: i.price * 100, quantity: i.quantity })),
    total: order.amount,
    shippingAddress: shippingAddress as Record<string, string | undefined> | undefined,
  }).catch((err) => console.error("[revolut webhook] sendAdminNotification failed:", err))

  // 3) Meta CAPI Purchase — server-side ad attribution
  sendPurchaseToCAPI({
    email: customerEmail,
    firstName: customerName.split(" ")[0],
    lastName: customerName.split(" ").slice(1).join(" "),
    city: shippingAddress?.city,
    state: shippingAddress?.region,
    zip: shippingAddress?.postcode,
    country: shippingAddress?.country_code,
    value: totalMajor,
    currency: order.currency,
    orderNumber: order.id,
    items: items.map((i) => ({ id: slug, quantity: i.quantity, price: i.price })),
    eventSourceUrl: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/thank-you?order=${order.id}`,
  }).catch((err) => console.error("[revolut webhook] sendPurchaseToCAPI failed:", err))

  // 4) Telegram ping
  const text =
    `🎉 <b>New Maison Tanneurs order</b>\n\n` +
    `<b>Piece:</b> ${escapeHTML(slug)}${productNumber ? ` · ${productNumber}` : ""}\n` +
    `<b>Customer:</b> ${escapeHTML(customerEmail || "(no email)")}\n` +
    `<b>Total:</b> ${totalMajor.toFixed(2)} ${order.currency}\n` +
    `<b>Order:</b> <code>${order.id}</code>\n\n` +
    `Revolut: https://business.revolut.com/merchant/orders/${order.id}`
  notifyTelegram(text).catch(() => {})

  return NextResponse.json({ ok: true, order_id: order.id })
}
