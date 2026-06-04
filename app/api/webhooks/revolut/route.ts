import { NextRequest, NextResponse } from "next/server"
import { verifyWebhookSignature } from "@/lib/revolut"
import { fulfillOrder } from "@/lib/fulfill-order"

// Revolut webhook endpoint — defensive only.
//
// In current production, Revolut webhooks are NOT configured for this
// merchant account. The /thank-you page handles fulfillment off the
// post-payment redirect. This route stays in place so that:
//   - If a webhook ever gets configured later, fulfillment fires here too
//   - fulfillOrder() is idempotent on revolut_order_id, so a webhook firing
//     alongside the /thank-you path is safe (only one row, one email, one
//     CAPI event per order)
//
// REVOLUT_WEBHOOK_SECRET must be set for signature verification. If unset,
// any inbound POST gets rejected so we never trust an unsigned payload.

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
    // No webhook is registered with Revolut for this account; reject any
    // payload that arrives so we don't process unsigned input.
    console.warn("[revolut webhook] REVOLUT_WEBHOOK_SECRET unset — rejecting")
    return NextResponse.json({ ok: false, reason: "webhook-not-configured" }, { status: 503 })
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

  // Fire-and-forget — /thank-you may have already fulfilled (idempotent).
  ;(async () => {
    const result = await fulfillOrder(payload.order_id)
    if (!result.ok) console.error("[revolut webhook] fulfillment failed:", result.reason)
  })().catch((err) => console.error("[revolut webhook] fatal:", err))

  return NextResponse.json({ ok: true, order_id: payload.order_id })
}
