// Smoke test for Resend wiring. Sends a fake order confirmation to a
// configurable address. Verifies:
//   1. RESEND_API_KEY env var is set
//   2. From/replyTo domain (orders@maisontanneurs.com) is DKIM-verified
//   3. Order confirmation HTML renders
//
// Run: pnpm tsx scripts/test-email.ts [recipient@example.com]
//
// Skips silently if RESEND_API_KEY isn't set (so prebuild doesn't break
// in offline environments).

try {
  process.loadEnvFile(".env.local")
} catch {
  /* fine */
}

import { sendOrderConfirmation, sendAdminNotification } from "../lib/email"

async function main(): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[test-email] RESEND_API_KEY unset — skipping")
    return
  }

  const recipient = process.argv[2] || "ryanaoufal@gmail.com"
  const orderNumber = `TEST-${Date.now()}`
  const items = [{ title: "Atlas Field Briefcase (TEST)", price: 89500, quantity: 1 }]

  console.log(`[test-email] sending order confirmation → ${recipient}`)
  await sendOrderConfirmation({
    to: recipient,
    orderNumber,
    customerName: "Smoke Test",
    items,
    total: 89500,
    currency: "EUR",
  })
  console.log(`[test-email] customer email sent`)

  console.log(`[test-email] sending admin notification → haddaoui.ops@outlook.com`)
  await sendAdminNotification({
    orderNumber,
    customerName: "Smoke Test",
    customerEmail: recipient,
    items,
    total: 89500,
    currency: "EUR",
    shippingAddress: {
      line1: "1 Rue de la Cite",
      city: "Marrakech",
      state: "Marrakech-Safi",
      postal_code: "40000",
      country: "MA",
    },
  })
  console.log(`[test-email] admin email sent`)
  console.log(`[test-email] OK — check inbox for ${orderNumber}`)
}

main().catch((err) => {
  console.error("[test-email] failed:", err)
  process.exit(1)
})
