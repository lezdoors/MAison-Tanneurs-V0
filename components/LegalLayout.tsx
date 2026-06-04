import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"

// Shared shell for /privacy + /terms — narrow column, paper bg, dark text.
// data-nav-theme="dark" so the nav uses dark text over light background.
export function LegalLayout({
  eyebrow,
  title,
  lastUpdated,
  children,
}: {
  eyebrow: string
  title: string
  lastUpdated: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen">
      <Navigation />
      <section
        data-nav-theme="dark"
        className="bg-[var(--color-paper)] text-[var(--color-ink)] pt-32 lg:pt-40 pb-20 lg:pb-28 px-6 lg:px-10"
      >
        <div className="max-w-3xl mx-auto">
          <span className="tech-label block mb-5">{eyebrow}</span>
          <h1 className="font-display text-[clamp(34px,4.5vw,60px)] leading-[1.08] tracking-[-0.012em] mb-3 text-balance">
            {title}
          </h1>
          <p className="tech-meta">Last updated {lastUpdated}</p>
          <div className="mt-12 lg:mt-16 space-y-10 lg:space-y-12 text-[14px] lg:text-[15px] leading-[1.85] text-[var(--color-ink-soft)] [&_h2]:font-display [&_h2]:text-[var(--color-ink)] [&_h2]:text-xl [&_h2]:lg:text-2xl [&_h2]:tracking-[-0.005em] [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:first:mt-0 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-70 [&_a]:transition-opacity [&_strong]:text-[var(--color-ink)] [&_strong]:font-medium [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:marker:text-[var(--color-bronze)]">
            {children}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
