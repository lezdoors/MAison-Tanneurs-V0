// Revolut Merchant API client — server-side only.
//
// Same Akal Digital Services Ltd merchant account as the main maisontanneurs
// site (approved 2026-05-21). Reuses the same env keys on Vercel:
//   REVOLUT_SECRET_KEY        sk_m...           — Bearer auth for all calls
//   REVOLUT_API_BASE          https://merchant.revolut.com/api
//                            (or sandbox endpoint for preview/test runs)
//   REVOLUT_WEBHOOK_SECRET    populated after webhook registration
import crypto from "node:crypto"

function url(path: string): string {
  const root = process.env.REVOLUT_API_BASE || "https://merchant.revolut.com/api"
  return `${root.replace(/\/$/, "")}${path}`
}

function authHeaders(): Record<string, string> {
  const key = process.env.REVOLUT_SECRET_KEY
  if (!key) throw new Error("REVOLUT_SECRET_KEY is not set")
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "Revolut-Api-Version": "2024-09-01",
    Accept: "application/json",
  }
}

export interface RevolutLineItem {
  name: string
  type?: "physical" | "service"
  quantity?: { value: number; unit?: "piece" }
  unit_price_amount?: number
  total_amount?: number
  external_id?: string
  image_urls?: string[]
}

export interface CreateOrderInput {
  amount: number       // minor units (cents)
  currency: string     // ISO 4217 e.g. "EUR"
  description?: string
  customer_email?: string
  external_id?: string
  redirect_url?: string
  metadata?: Record<string, string>
  line_items?: RevolutLineItem[]
  capture_mode?: "automatic" | "manual"
}

export interface RevolutCustomer {
  id?: string
  email?: string
  full_name?: string
  phone?: string
}

export interface RevolutShippingAddress {
  street_line_1?: string
  street_line_2?: string
  city?: string
  region?: string
  postcode?: string
  country_code?: string
}

export interface RevolutOrder {
  id: string
  token: string
  checkout_url: string
  state: "PENDING" | "PROCESSING" | "AUTHORISED" | "COMPLETED" | "CANCELLED" | "FAILED"
  amount: number
  currency: string
  created_at: string
  updated_at: string
  metadata?: Record<string, string>
  customer?: RevolutCustomer
  shipping_address?: RevolutShippingAddress
}

export async function createOrder(input: CreateOrderInput): Promise<RevolutOrder> {
  const res = await fetch(url("/orders"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Revolut createOrder ${res.status}: ${JSON.stringify(json)}`)
  return json as RevolutOrder
}

export async function getOrder(orderId: string): Promise<RevolutOrder> {
  const res = await fetch(url(`/orders/${orderId}`), { method: "GET", headers: authHeaders() })
  const json = await res.json()
  if (!res.ok) throw new Error(`Revolut getOrder ${res.status}: ${JSON.stringify(json)}`)
  return json as RevolutOrder
}

// === Webhook signature verification ===
// Revolut signs each delivery: HMAC-SHA256(`v1.{ts}.{body}`, signing_secret).
// Header: `Revolut-Signature: v1=<hex>[,v1=<hex>]` (multiple = key rotation).
// 5-minute replay-window tolerance.
const REPLAY_TOLERANCE_SECONDS = 5 * 60

export function verifyWebhookSignature(args: {
  rawBody: string
  signatureHeader: string | null
  timestampHeader: string | null
  secret: string
}): { valid: boolean; reason?: string } {
  const { rawBody, signatureHeader, timestampHeader, secret } = args
  if (!signatureHeader) return { valid: false, reason: "missing signature" }
  if (!timestampHeader) return { valid: false, reason: "missing timestamp" }
  if (!secret) return { valid: false, reason: "missing secret" }

  const tsMs = parseInt(timestampHeader, 10)
  if (!Number.isFinite(tsMs)) return { valid: false, reason: "bad timestamp" }
  const age = Math.abs((Date.now() - tsMs) / 1000)
  if (age > REPLAY_TOLERANCE_SECONDS) return { valid: false, reason: `outside ${REPLAY_TOLERANCE_SECONDS}s window` }

  const payload = `v1.${timestampHeader}.${rawBody}`
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex")
  const expectedBuf = Buffer.from(expected, "hex")

  const candidates = signatureHeader
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("v1="))
    .map((s) => s.slice(3))
  if (candidates.length === 0) return { valid: false, reason: "no v1 entries" }

  const match = candidates.some((c) => {
    try {
      const buf = Buffer.from(c, "hex")
      return buf.length === expectedBuf.length && crypto.timingSafeEqual(buf, expectedBuf)
    } catch {
      return false
    }
  })
  return match ? { valid: true } : { valid: false, reason: "signature mismatch" }
}
