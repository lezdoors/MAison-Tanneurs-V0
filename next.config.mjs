import { withSentryConfig } from "@sentry/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  org: process.env.SENTRY_ORG ?? "haddaoui",
  project: process.env.SENTRY_PROJECT ?? "maison-tanneurs-v0",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  disableLogger: true,
  widenClientFileUpload: true,
  // Bypass ad-blockers that swallow *.sentry.io requests.
  tunnelRoute: "/monitoring",
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
    deleteSourcemapsAfterUpload: true,
  },
})
