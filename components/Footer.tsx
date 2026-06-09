import Link from "next/link"

const SHOP = [
  { label: "Object Register", href: "/products" },
  { label: "Atelier", href: "/atelier" },
  { label: "Heritage", href: "/heritage" },
]

const SUPPORT = [
  { label: "Request availability", href: "mailto:hello@maisontanneurs.com?subject=Reserve%20%C2%B7%20Maison%20Tanneurs" },
  { label: "Lifetime repair", href: "/terms#lifetime-repair" },
  { label: "Contact atelier", href: "mailto:hello@maisontanneurs.com" },
]

const LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
]

const LEDGER = [
  ["Origin", "Marrakech medina atelier"],
  ["Run", "Numbered small editions"],
  ["Material", "Full-grain leather / brass / waxed linen"],
  ["Service", "Lifetime repair for the original owner"],
]

export function Footer() {
  return (
    <footer data-nav-theme="dark" className="bg-[var(--color-paper)] text-[var(--color-ink)] border-t border-[var(--color-rule)]">
      <div className="max-w-[1500px] mx-auto px-5 sm:px-6 lg:px-10 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 border-b border-[var(--color-rule)] pb-12 lg:pb-16">
          <div className="lg:col-span-5">
            <Link href="/" aria-label="Maison Tanneurs - home" className="font-display text-2xl lg:text-4xl tracking-[0.12em]">
              MAISON TANNEURS
            </Link>
            <p className="mt-6 text-[14px] leading-[1.85] text-[var(--color-ink-soft)] max-w-md">
              Handmade leather bags registered by object, material, maker rhythm, and repair promise.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--color-rule)] border border-[var(--color-rule)]">
            {LEDGER.map(([key, value]) => (
              <div key={key} className="bg-[var(--color-paper)] p-4 lg:p-5 min-h-32">
                <p className="tech-meta mb-4">{key}</p>
                <p className="text-[13px] leading-[1.6] text-[var(--color-ink-soft)]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16 py-10 lg:py-12 border-b border-[var(--color-rule)]">
          <div>
            <h4 className="tech-label mb-5">Index</h4>
            <ul className="space-y-3">
              {SHOP.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="tech-label mb-5">Service</h4>
            <ul className="space-y-3">
              {SUPPORT.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2">
            <h4 className="tech-label mb-5">Atelier Note</h4>
            <p className="text-sm text-[var(--color-ink-soft)] leading-[1.8] max-w-lg">
              Every piece is cut, stitched, and finished by hand. This concept keeps the proof close to the object:
              material, dimensions, edition number, care, and repair.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--color-ink-muted)]">
            {LEGAL.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[var(--color-ink)] transition-colors">
                {link.label}
              </Link>
            ))}
            <span>© {new Date().getFullYear()} Maison Tanneurs</span>
          </div>
          <p className="tech-meta">Archive / Object Dossier</p>
        </div>
      </div>
    </footer>
  )
}
