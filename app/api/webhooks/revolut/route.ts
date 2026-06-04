import { NextRequest, NextResponse } from "next/server"
import { getOrder, verifyWebhookSignature, type RevolutOrder } from "@/lib/revolut"
import { notifyTelegram, escapeHTML } from "@/lib/notify-telegram"

// Revolut webhook — fires on order.state transitions. We care about
// ORDER_COMPLETED (payment captured). On that event:
//   1. Re-fetch the canonical order via API (don't trust webhook payload)
//   2. Telegram-ping Ryan with the order detail
//   3. (Future) write to Supabase orders table for fulfilment
//
// Signature verification: HMAC-SHA256 over `v1.{ts}.{body}` using
// REVOLUT_WEBHOOK_SECRET. 5-min replay tolerance.

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

  // ACK immediately for events we don't action — Revolut requires 2xx within 5s
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

  // Telegram alert — fire-and-forget, never block the webhook response
  const slug = order.metadata?.slug || ""
  const number = order.metadata?.product_number || ""
  const amount = (order.amount / 100).toFixed(2)
  const text =
    `🎉 <b>New Maison Tanneurs order</b>\n\n` +
    `<b>Piece:</b> ${escapeHTML(slug)}${number ? ` · ${number}` : ""}\n` +
    `<b>Total:</b> ${amount} ${order.currency}\n` +
    `<b>Order:</b> <code>${order.id}</code>\n` +
    `<b>State:</b> ${order.state}\n\n` +
    `Revolut dashboard: https://business.revolut.com/merchant/orders/${order.id}`
  await notifyTelegram(text).catch(() => {})

  return NextResponse.json({ ok: true, order_id: order.id })
}
