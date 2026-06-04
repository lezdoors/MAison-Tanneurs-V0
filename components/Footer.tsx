import Link from "next/link"

// Brand-only footer (Hermès/Polène register). Legal entity disclosure
// lives in /privacy + /terms where it's legally required — never in the
// chrome of a luxury site.
const SHOP = [
  { label: "Edition", href: "/products" },
  { label: "Atelier", href: "/atelier" },
  { label: "Heritage", href: "/heritage" },
]
const SUPPORT = [
  { label: "Contact", href: "mailto:hello@maisontanneurs.com" },
  { label: "Reservations", href: "mailto:hello@maisontanneurs.com?subject=Reserve%20%C2%B7%20Maison%20Tanneurs" },
  { label: "Lifetime Repair", href: "/terms#lifetime-repair" },
]
const LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
]

export function Footer() {
  return (
    <footer
      data-nav-theme="light"
      className="bg-[var(--color-warm-black)] text-[var(--color-ivory)]"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-16 mb-16">
          <div>
            <h4 className="tech-label tech-label--ondark mb-5">Shop</h4>
            <ul className="space-y-3">
              {SHOP.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[var(--color-ivory-soft)] hover:text-[var(--color-ivory)] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="tech-label tech-label--ondark mb-5">Maison</h4>
            <ul className="space-y-3">
              {SUPPORT.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-[var(--color-ivory-soft)] hover:text-[var(--color-ivory)] transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h4 className="tech-label tech-label--ondark mb-5">The Atelier</h4>
            <p className="text-sm text-[var(--color-ivory-soft)] leading-relaxed max-w-xs">
              A small workshop in the Marrakech medina. Seven artisans, fourteen days, every piece.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--color-rule-on-dark)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Link href="/" aria-label="Maison Tanneurs — home" className="font-display text-lg tracking-[0.18em] text-[var(--color-ivory)]">
            MAISON TANNEURS
          </Link>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--color-ivory-soft)]">
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-[var(--color-ivory)] transition-colors">
                {l.label}
              </Link>
            ))}
            <span className="hidden md:inline opacity-40">·</span>
            <span>© {new Date().getFullYear()} Maison Tanneurs</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
