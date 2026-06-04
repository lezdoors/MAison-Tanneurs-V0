import { NextResponse } from "next/server"
import { sendNewsletterWelcome } from "@/lib/email"

// POST /api/newsletter — replaces the formsubmit.co fallback.
// Validates the email, fires welcome via Resend, notifies the inbox in
// parallel. Returns 503 if RESEND_API_KEY isn't wired so the client can
// degrade gracefully (Newsletter component falls back to mailto).

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: "Newsletter temporarily unavailable" }, { status: 503 })
  }
  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 })
  }
  const email = (body.email || "").trim().toLowerCase()
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 })
  }
  try {
    const result = await sendNewsletterWelcome(email)
    if (!result.welcome) {
      return NextResponse.json({ ok: false, error: "Couldn't subscribe right now. Please try again." }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[newsletter] send failed:", err)
    return NextResponse.json({ ok: false, error: "Couldn't subscribe right now. Please try again." }, { status: 502 })
  }
}
