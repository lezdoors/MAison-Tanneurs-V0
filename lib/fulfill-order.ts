// Post-payment order fulfillment — idempotent on revolut_order_id.
//
// Called from /thank-you (primary path, since Revolut redirects the buyer
// here with the order id) and from /api/webhooks/revolut (defensive, in
// case a webhook is ever configured). Both paths converge on the same
// helper so the side effects fire exactly once per order.
//
// Side effects when a row is freshly inserted:
//   1. orders row persisted (status='paid')
//   2. Resend customer confirmation + admin notification
//   3. Telegram alert
//   4. Meta CAPI Purchase event (dedupes with client Pixel via order id)
//
// Re-running with the same revolut_order_id returns `alreadyFulfilled:true`
// and does nothing. Safe to call from multiple paths.

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { getOrder, type RevolutOrder } from "@/lib/revolut"
import { fetchProductBySlug } from "@/lib/supabase"
import { sendOrderConfirmation, sendAdminNotification, type OrderItem } from "@/lib/email"
import { sendPurchaseToCAPI } from "@/lib/meta-capi"
import { notifyTelegram, escapeHTML } from "@/lib/notify-telegram"

let _sb: SupabaseClient | null = null
function sb(): SupabaseClient | null {
  if (_sb) return _sb
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  _sb = createClient(url, key, { auth: { persistSession: false } })
  return _sb
}

export interface FulfilledOrderView {
  orderNumber: string
  customerEmail: string
  customerName: string
  total: number
  currency: string
  items: OrderItem[]
}

export interface FulfillResult {
  ok: boolean
  alreadyFulfilled?: boolean
  view?: FulfilledOrderView
  reason?: string
}

export async function fulfillOrder(revolutOrderId: string): Promise<FulfillResult> {
  if (!revolutOrderId) return { ok: false, reason: "missing-order-id" }

  const supabase = sb()

  // 1. Idempotency check — has this order already been fulfilled?
  if (supabase) {
    const { data: existing } = await supabase
      .from("orders")
      .select("order_number,customer_email,customer_name,items,total,currency")
      .eq("revolut_order_id", revolutOrderId)
      .maybeSingle()
    if (existing) {
      return {
        ok: true,
        alreadyFulfilled: true,
        view: {
          orderNumber: existing.order_number as string,
          customerEmail: (existing.customer_email as string) || "",
          customerName: (existing.customer_name as string) || "",
          items: (existing.items as OrderItem[]) || [],
          total: Number(existing.total) || 0,
          currency: (existing.currency as string) || "EUR",
        },
      }
    }
  }

  // 2. Fetch canonical order from Revolut
  let order: RevolutOrder
  try {
    order = await getOrder(revolutOrderId)
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown"
    console.error("[fulfill] getOrder failed:", message)
    return { ok: false, reason: `revolut-fetch-failed: ${message}` }
  }

  if (order.state !== "COMPLETED") {
    return { ok: false, reason: `order-state-${order.state}` }
  }

  // 3. Re-derive canonical product info (title + slug) from metadata
  const slug = order.metadata?.slug || ""
  const product = slug ? await fetchProductBySlug(slug).catch(() => null) : null
  const itemTitle = product?.title || slug || "Maison Tanneurs piece"
  const items: OrderItem[] = [{ title: itemTitle, price: order.amount, quantity: 1 }]

  const customerEmail = order.customer?.email || ""
  const customerName = order.customer?.full_name || ""
  const currency = (order.currency || "EUR").toUpperCase()
  const orderNumber = order.metadata?.product_number || `MT-${order.id.slice(0, 8).toUpperCase()}`
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

  // 4. Persist — race-safe via upsert on revolut_order_id
  if (supabase) {
    const { error } = await supabase.from("orders").upsert(
      {
        order_number: orderNumber,
        sales_channel: "direct",
        revolut_order_id: revolutOrderId,
        customer_email: customerEmail,
        customer_name: customerName,
        shipping_address: shippingAddress || {},
        items: items.map((i) => ({ ...i, slug, product_id: product?.id })),
        subtotal: order.amount,
        shipping_cost: 0,
        total: order.amount,
        currency,
        status: "paid",
      },
      { onConflict: "revolut_order_id" },
    )
    if (error) {
      console.error("[fulfill] persist failed:", error.message)
      // Don't bail — emails are still useful even if persist failed
    }
  }

  // 5. Side effects — Telegram, Resend, CAPI. Don't fail the page if any of
  //    them throw; log and move on. The customer still sees the thank-you.
  const amountMajor = order.amount / 100
  const telegramText =
    `New Maison Tanneurs order\n\n` +
    `Piece: ${escapeHTML(slug)}${order.metadata?.product_number ? ` · ${order.metadata.product_number}` : ""}\n` +
    `Total: ${amountMajor.toFixed(2)} ${currency}\n` +
    `Order: <code>${order.id}</code>\n` +
    `Dashboard: https://business.revolut.com/merchant/orders/${order.id}`

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.maisontanneurs.com"
  const [firstName, ...rest] = (customerName || "").split(" ")
  const lastName = rest.join(" ")

  await Promise.allSettled([
    notifyTelegram(telegramText),
    customerEmail
      ? sendOrderConfirmation({
          to: customerEmail,
          orderNumber,
          customerName,
          items,
          total: order.amount,
          currency,
        })
      : Promise.resolve(),
    sendAdminNotification({
      orderNumber,
      customerName,
      customerEmail,
      items,
      total: order.amount,
      currency,
      shippingAddress,
    }),
    sendPurchaseToCAPI({
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
      items: [{ id: slug || order.id, quantity: 1, price: amountMajor }],
      fbp: order.metadata?.meta_fbp,
      fbc: order.metadata?.meta_fbc,
      eventSourceUrl: `${siteUrl}/thank-you?order=${order.id}`,
    }),
  ]).then((results) => {
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const tag = ["telegram", "customer-email", "admin-email", "capi"][i]
        console.error(`[fulfill] ${tag} failed:`, r.reason)
      }
    })
  })

  return {
    ok: true,
    alreadyFulfilled: false,
    view: { orderNumber, customerEmail, customerName, total: order.amount, currency, items },
  }
}
