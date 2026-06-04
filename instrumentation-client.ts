// Sentry — client runtime. Replay only on error (no session sampling).
// PII-safe defaults: maskAllText + blockAllMedia + maskAllInputs are ON,
// so customer emails, addresses, and product imagery never leave the
// browser as part of replay payloads. Override per-element with the
// `data-sentry-unmask` selector if/when a non-PII region needs unmasking.
import * as Sentry from "@sentry/nextjs"

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "production",
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
