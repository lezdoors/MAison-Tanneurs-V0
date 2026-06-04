// Meta Conversions API (CAPI) — server-side Purchase mirror.
//
// Companion to the client-side Pixel (components/MetaPixel.tsx). Fires from
// the Revolut webhook on ORDER_COMPLETED, using the Revolut order id as
// event_id so Meta dedupes with the browser Pixel's Purchase event.
//
// Env vars (both required for CAPI to fire — otherwise no-op):
//   META_PIXEL_ID          — same numeric ID as NEXT_PUBLIC_META_PIXEL_ID
//   META_CAPI_ACCESS_TOKEN — generated in Events Manager → Settings
//
// PII (email, name, address) is SHA-256 hashed lowercase-trimmed per Meta's
// spec. node:crypto is built-in, no new deps.

import crypto from "node:crypto"

const META_API_VERSION = "v22.0"

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex")
}

export interface PurchaseEvent {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  value: number          // major units (e.g., 1950.00 EUR)
  currency: string       // "EUR"
  orderNumber: string    // event_id — must match client Pixel for dedup
  items: Array<{ id: string; quantity: number; price: number }>  // price in major
  fbp?: string
  fbc?: string
  clientIp?: string
  clientUserAgent?: string
  eventSourceUrl?: string
}

export async function sendPurchaseToCAPI(params: PurchaseEvent): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN
  if (!pixelId || !accessToken) {
    console.log("[CAPI] skipped — META_PIXEL_ID or META_CAPI_ACCESS_TOKEN unset")
    return
  }

  const userData: Record<string, string | string[]> = {}
  if (params.email) userData.em = sha256(params.email)
  if (params.firstName) userData.fn = sha256(params.firstName)
  if (params.lastName) userData.ln = sha256(params.lastName)
  if (params.phone) userData.ph = sha256(params.phone.replace(/[^\d]/g, ""))
  if (params.city) userData.ct = sha256(params.city)
  if (params.state) userData.st = sha256(params.state)
  if (params.zip) userData.zp = sha256(params.zip)
  if (params.country) userData.country = sha256(params.country)
  if (params.fbp) userData.fbp = params.fbp
  if (params.fbc) userData.fbc = params.fbc
  if (params.clientIp) userData.client_ip_address = params.clientIp
  if (params.clientUserAgent) userData.client_user_agent = params.clientUserAgent

  const body = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.orderNumber,
        action_source: "website",
        event_source_url: params.eventSourceUrl,
        user_data: userData,
        custom_data: {
          currency: params.currency,
          value: params.value,
          content_ids: params.items.map((i) => i.id),
          content_type: "product",
          num_items: params.items.reduce((s, i) => s + i.quantity, 0),
          contents: params.items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            item_price: i.price,
          })),
        },
      },
    ],
  }

  const url = `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${accessToken}`

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error(`[CAPI] Purchase failed (${res.status}): ${await res.text()}`)
      return
    }
    const json = await res.json()
    console.log(`[CAPI] Purchase sent — events_received=${json.events_received}`)
  } catch (err) {
    console.error("[CAPI] fetch error:", err)
  }
}
