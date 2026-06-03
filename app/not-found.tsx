import Link from "next/link"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />
      <section
        data-nav-theme="dark"
        className="flex-1 flex items-center justify-center px-6 py-32 text-center"
      >
        <div className="max-w-md">
          <span className="tech-label block mb-5">404 · Lost in the medina</span>
          <h1 className="font-display text-[clamp(36px,5vw,64px)] leading-[1.1] tracking-[-0.012em] mb-6 text-balance">
            That piece can't be found.
          </h1>
          <p className="text-[14px] leading-relaxed text-[var(--color-ink-soft)] mb-10">
            It may have left the atelier, or never been numbered. Find your way back to the Edition.
          </p>
          <Link
            href="/"
            className="inline-flex items-center text-[11px] tracking-[0.32em] uppercase border-b border-[var(--color-ink)] pb-1 hover:border-transparent transition-colors"
          >
            Return Home
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}
