// Cookie / tracking consent — single source of truth.
// Stored in localStorage under "mt-consent" as one of: "granted" | "denied" | (absent = undecided).
// Server components default to "denied" (no tracking ships until the user opts in client-side).

export type ConsentState = "granted" | "denied" | "unset"

const KEY = "mt-consent"

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return "unset"
  const v = localStorage.getItem(KEY)
  if (v === "granted" || v === "denied") return v
  return "unset"
}

export function writeConsent(state: "granted" | "denied"): void {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, state)
  // Notify listeners (banner unmount, pixel mount, etc.)
  window.dispatchEvent(new CustomEvent("mt-consent-change", { detail: state }))
}

export function onConsentChange(cb: (state: ConsentState) => void): () => void {
  if (typeof window === "undefined") return () => {}
  const handler = (e: Event) => cb((e as CustomEvent<ConsentState>).detail)
  window.addEventListener("mt-consent-change", handler)
  return () => window.removeEventListener("mt-consent-change", handler)
}
