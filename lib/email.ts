// Resend-powered transactional email. Lazy-init the client so a missing
// RESEND_API_KEY env doesn't crash builds at module load.
import { Resend } from "resend"
import { formatPrice } from "./supabase"

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error("RESEND_API_KEY is not set")
  return new Resend(key)
}

const FROM_ORDERS = "Maison Tanneurs <orders@maisontanneurs.com>"
const FROM_NEWSLETTER = "Maison Tanneurs <newsletter@send.maisontanneurs.com>"
const REPLY_TO = "hello@maisontanneurs.com"
const ADMIN = "hello@maisontanneurs.com"

// ─── Order confirmation (sent to the customer post-checkout) ────────────
export interface OrderEmailData {
  to: string
  orderNumber: string
  customerName: string
  items: { title: string; price: number; quantity: number }[]
  total: number
  currency?: string
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const itemsHtml = data.items
    .map((i) => `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #e6e1d4;font-family:Georgia,serif;color:#2c2a28;">${i.title}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e6e1d4;text-align:center;font-family:monospace;font-size:12px;color:#6b6864;">${i.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e6e1d4;text-align:right;font-family:Georgia,serif;color:#2c2a28;">${formatPrice(i.price * i.quantity)}</td>
    </tr>`)
    .join("")

  await getResend().emails.send({
    from: FROM_ORDERS,
    replyTo: REPLY_TO,
    to: data.to,
    subject: `Order received · ${data.orderNumber}`,
    html: `
      <div style="max-width:600px;margin:0 auto;background:#f8f6f1;padding:48px 32px;font-family:Georgia,serif;color:#2c2a28;">
        <div style="text-align:center;margin-bottom:40px;">
          <div style="font-family:monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#8c7a5a;margin-bottom:12px;">Order received</div>
          <div style="font-family:Georgia,serif;font-size:30px;letter-spacing:0.18em;color:#2c2a28;">MAISON TANNEURS</div>
        </div>

        <p style="font-size:16px;line-height:1.6;color:#3a3835;">Dear ${data.customerName || "friend"},</p>
        <p style="font-size:15px;line-height:1.75;color:#3a3835;">Thank you. Your piece is numbered and entering the queue at our atelier in Marrakech. Hand-cut, saddle-stitched, edge-burnished — fourteen days from hide to final stitch. A second email will follow with tracking once the piece leaves the workshop.</p>

        <div style="margin:32px 0;padding-top:24px;border-top:1px solid #d8d2c2;">
          <div style="font-family:monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#8c7a5a;margin-bottom:16px;">Order ${data.orderNumber}</div>
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr>
              <th style="text-align:left;font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#8c7a5a;padding-bottom:8px;">Piece</th>
              <th style="text-align:center;font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#8c7a5a;padding-bottom:8px;">Qty</th>
              <th style="text-align:right;font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#8c7a5a;padding-bottom:8px;">Total</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="display:flex;justify-content:space-between;margin-top:20px;padding-top:16px;border-top:1px solid #d8d2c2;">
            <span style="font-family:monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8c7a5a;">Total</span>
            <span style="font-family:Georgia,serif;font-size:20px;color:#2c2a28;">${formatPrice(data.total)}</span>
          </div>
        </div>

        <div style="background:#efece5;padding:22px;margin:32px 0;">
          <div style="font-family:monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#8c7a5a;margin-bottom:8px;">Shipping</div>
          <p style="font-size:14px;line-height:1.7;color:#3a3835;margin:0;">Tracked worldwide express from the atelier — typically 3–5 business days once dispatched. You'll receive a tracking number by email when the parcel leaves Marrakech.</p>
        </div>

        <p style="font-size:13px;line-height:1.7;color:#6b6864;">Questions, requests, or anything else — reply to this email and you'll reach us directly.</p>

        <div style="text-align:center;margin-top:48px;padding-top:24px;border-top:1px solid #d8d2c2;">
          <div style="font-family:monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#8c7a5a;">Maison Tanneurs · Marrakech</div>
        </div>
      </div>`,
  })
}

// ─── Admin notification (internal, mirrors the order to ops) ────────────
export interface AdminNotificationData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: { title: string; price: number; quantity: number }[]
  total: number
  shippingAddress?: Record<string, string | undefined>
}

export async function sendAdminNotification(data: AdminNotificationData) {
  const itemsList = data.items
    .map((i) => `- ${i.title} (${i.quantity}×) — ${formatPrice(i.price * i.quantity)}`)
    .join("\n")
  const addr = data.shippingAddress || {}
  const addressStr = [
    addr.street_line_1, addr.street_line_2,
    [addr.city, addr.region, addr.postcode].filter(Boolean).join(" "),
    addr.country_code,
  ].filter(Boolean).join("\n") || "(no shipping address provided)"

  await getResend().emails.send({
    from: FROM_ORDERS,
    to: ADMIN,
    subject: `New order · ${data.orderNumber} · ${formatPrice(data.total)}`,
    text: [
      `New Maison Tanneurs order: ${data.orderNumber}`,
      ``,
      `Customer: ${data.customerName || "(no name)"} <${data.customerEmail}>`,
      `Total: ${formatPrice(data.total)}`,
      ``,
      `Items:`,
      itemsList,
      ``,
      `Ship to:`,
      addressStr,
      ``,
      `Coordinate with the atelier for fulfilment.`,
    ].join("\n"),
  })
}

// ─── Newsletter welcome (sent on /api/newsletter signup) ────────────────
export async function sendNewsletterWelcome(email: string) {
  const r = getResend()
  const welcome = r.emails.send({
    from: FROM_NEWSLETTER,
    replyTo: REPLY_TO,
    to: email,
    subject: "Welcome to Maison Tanneurs",
    text: [
      "Welcome.",
      "",
      "You're on the list for numbered editions, private releases, and early access. Nothing else.",
      "",
      "The next edition releases soon. We'll be in touch.",
      "",
      "— Maison Tanneurs",
      "Hand-stitched in Marrakech",
    ].join("\n"),
  })
  const notify = r.emails.send({
    from: FROM_NEWSLETTER,
    to: ADMIN,
    replyTo: email,
    subject: `Newsletter signup · ${email}`,
    text: `New subscriber: ${email}\nUTC: ${new Date().toISOString()}\nSource: maison-tanneurs-v0 /newsletter`,
  })
  const [w, n] = await Promise.allSettled([welcome, notify])
  return {
    welcome: w.status === "fulfilled" && !w.value.error,
    admin: n.status === "fulfilled" && !n.value.error,
  }
}
