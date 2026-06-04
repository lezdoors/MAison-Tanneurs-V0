"use client"

import { useState } from "react"

type State = "idle" | "submitting" | "success" | "error"

// Posts to /api/newsletter (Resend). On 503 (env unset) the form shows a
// soft message — never silently fails. Brand register: warm-black bg,
// hairline underline input, no buttons-on-shadow drama.
export function Newsletter() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<State>("idle")
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === "submitting") return
    setState("submitting")
    setError("")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setState("error")
        setError(data?.error || "Couldn't subscribe right now. Please try again.")
        return
      }
      setState("success")
      setEmail("")
    } catch {
      setState("error")
      setError("Network error. Please try again.")
    }
  }

  return (
    <section
      data-nav-theme="light"
      className="bg-[var(--color-warm-black)] text-[var(--color-ivory)] py-20 lg:py-28 px-6 lg:px-10"
      aria-label="Stay connected"
    >
      <div className="max-w-2xl mx-auto text-center">
        <span className="tech-label tech-label--ondark block mb-5">§09 · Stay Connected</span>
        <h2 className="font-display text-[clamp(28px,3.6vw,46px)] leading-[1.15] tracking-[-0.005em] text-balance mb-6">
          Receive the next edition first.
        </h2>
        <p className="text-[14px] lg:text-[15px] leading-relaxed text-[var(--color-ivory-soft)] max-w-md mx-auto mb-10">
          Numbered editions, private releases, early access. No noise.
        </p>

        {state === "success" ? (
          <p className="text-[14px] tracking-wide text-[var(--color-ivory)] max-w-md mx-auto">
            Welcome. Check your inbox — the next edition is on its way.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="relative max-w-md mx-auto" noValidate>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={state === "submitting"}
              className="w-full bg-transparent border-0 border-b border-[var(--color-rule-on-dark)] py-3 pr-28 text-sm placeholder:text-[var(--color-ivory-soft)] text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-ivory)] transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={state === "submitting"}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] tracking-[0.3em] uppercase text-[var(--color-ivory)] hover:opacity-60 transition-opacity disabled:opacity-40"
            >
              {state === "submitting" ? "Sending…" : "Subscribe"}
            </button>
            {state === "error" && (
              <p className="mt-4 text-xs text-[var(--color-ivory-soft)] text-left">{error}</p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
