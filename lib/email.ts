import { Resend } from "resend"

// Resend transactional client — lazy-init so missing key doesn't crash builds.
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error("RESEND_API_KEY is not set")
  return new Resend(key)
}

const FROM_EMAIL = "Maison Tanneurs <orders@maisontanneurs.com>"
const REPLY_TO = "hello@maisontanneurs.com"
const ADMIN_EMAIL = "haddaoui.ops@outlook.com"

// V0's checkout is single-item, but the helper accepts an items[] array so we
// can extend to cart later without breaking the API.
export interface OrderItem {
  title: string
  price: number       // minor units (cents)
  quantity: number
}

export interface OrderEmailData {
  to: string
  orderNumber: string
  customerName: string
  items: OrderItem[]
  total: number          // minor units (cents)
  currency: string       // ISO 4217 e.g. "EUR"
}

// Inline price formatter — keeps email lib free of Supabase / currency deps.
function fmt(minor: number, currency: string): string {
  const major = minor / 100
  const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "USD" ? "$" : ""
  const n = major.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  return symbol ? `${symbol}${n}` : `${n} ${currency}`
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  if (!data.to) {
    console.warn("[email] sendOrderConfirmation skipped — no customer email")
    return
  }

  const itemsHtml = data.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e4dcc8;font-family:Georgia,serif;">${i.title}</td><td style="padding:8px 0;border-bottom:1px solid #e4dcc8;text-align:center;font-family:monospace;font-size:12px;">${i.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #e4dcc8;text-align:right;font-family:Georgia,serif;font-style:italic;">${fmt(i.price * i.quantity, data.currency)}</td></tr>`,
    )
    .join("")

  await getResend().emails.send({
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    to: data.to,
    subject: `Order Confirmed — ${data.orderNumber}`,
    html: `
      <div style="max-width:600px;margin:0 auto;background:#f5efe3;padding:48px 32px;font-family:Georgia,serif;color:#1f1b16;">
        <div style="text-align:center;margin-bottom:40px;">
          <div style="font-family:monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#7a6f5c;margin-bottom:8px;">Order Confirmed</div>
          <div style="font-size:36px;letter-spacing:-0.01em;line-height:1.1;">MAISON TANNEURS</div>
        </div>
        <p style="font-style:italic;font-size:18px;line-height:1.5;color:#3a332a;">Dear ${data.customerName || "friend"},</p>
        <p style="font-style:italic;font-size:16px;line-height:1.6;color:#3a332a;">Thank you for your order. Each piece is hand-stitched by our master artisans in Marrakech and will be carefully prepared for shipping.</p>
        <div style="margin:32px 0;padding:24px 0;border-top:1px solid #d9cfbb;">
          <div style="font-family:monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#7a6f5c;margin-bottom:16px;">Order ${data.orderNumber}</div>
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr><th style="text-align:left;font-family:monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#7a6f5c;padding-bottom:8px;">Item</th><th style="text-align:center;font-family:monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#7a6f5c;padding-bottom:8px;">Qty</th><th style="text-align:right;font-family:monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#7a6f5c;padding-bottom:8px;">Total</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="display:flex;justify-content:space-between;margin-top:16px;padding-top:16px;">
            <span style="font-family:monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#7a6f5c;">Total</span>
            <span style="font-size:22px;font-style:italic;">${fmt(data.total, data.currency)}</span>
          </div>
        </div>
        <div style="background:#ebe3d1;padding:24px;margin:32px 0;">
          <div style="font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7a6f5c;margin-bottom:8px;">Shipping</div>
          <p style="font-style:italic;font-size:14px;color:#3a332a;margin:0;line-height:1.6;">Your piece is finished and prepared in Marrakech, then shipped direct &mdash; free worldwide &mdash; by tracked express courier. Most orders arrive in 3 to 5 business days. You will receive a tracking number once your parcel leaves the atelier.</p>
        </div>
        <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #d9cfbb;">
          <div style="font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7a6f5c;">Maison Tanneurs &middot; Marrakech</div>
        </div>
      </div>
    `,
  })
}

export interface AdminNotificationData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  total: number
  currency: string
  shippingAddress?: Record<string, string | undefined>
}

export async function sendAdminNotification(data: AdminNotificationData): Promise<void> {
  const itemsList = data.items
    .map((i) => `- ${i.title} (${i.quantity}x) — ${fmt(i.price * i.quantity, data.currency)}`)
    .join("\n")
  const a = data.shippingAddress || {}
  const addressStr = [
    a.line1,
    a.line2,
    [a.city, a.state, a.postal_code].filter(Boolean).join(", "),
    a.country,
  ]
    .filter(Boolean)
    .join("\n")

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Maison Tanneurs Order · ${data.orderNumber} · ${fmt(data.total, data.currency)}`,
    html: `
      <div style="font-family:monospace;font-size:13px;line-height:1.8;color:#1f1b16;max-width:600px;">
        <h2 style="font-family:Georgia,serif;font-size:24px;font-weight:normal;">New Order: ${data.orderNumber}</h2>
        <p><strong>Customer:</strong> ${data.customerName || "(name not captured)"} (${data.customerEmail || "(no email)"})</p>
        <p><strong>Total:</strong> ${fmt(data.total, data.currency)}</p>
        <p><strong>Items:</strong></p>
        <pre style="background:#f5efe3;padding:16px;white-space:pre-wrap;">${itemsList}</pre>
        ${addressStr ? `<p><strong>Ship to:</strong></p><pre style="background:#f5efe3;padding:16px;white-space:pre-wrap;">${addressStr}</pre>` : ""}
        <p style="color:#7a6f5c;font-size:11px;margin-top:24px;">Coordinate with the Marrakech atelier for fulfillment.</p>
      </div>
    `,
  })
}
