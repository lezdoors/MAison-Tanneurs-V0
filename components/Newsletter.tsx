// Single email field, foreground dark. Posts to formsubmit.co (no backend yet).
export function Newsletter() {
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
        <form
          action="https://formsubmit.co/hello@maisontanneurs.com"
          method="POST"
          className="relative max-w-md mx-auto"
        >
          <input type="hidden" name="_subject" value="Newsletter signup · Maison Tanneurs" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="_captcha" value="false" />
          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            className="w-full bg-transparent border-0 border-b border-[var(--color-rule-on-dark)] py-3 pr-28 text-sm placeholder:text-[var(--color-ivory-soft)] text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-ivory)] transition-colors"
          />
          <button
            type="submit"
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] tracking-[0.3em] uppercase text-[var(--color-ivory)] hover:opacity-60 transition-opacity"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}
