import Link from "next/link"

const SHOP = [
  { label: "Edition", href: "/products" },
  { label: "Atelier", href: "/atelier" },
  { label: "Heritage", href: "/heritage" },
]
const CONTACT = [
  { label: "hello@maisontanneurs.com", href: "mailto:hello@maisontanneurs.com" },
  { label: "wholesale@maisontanneurs.com", href: "mailto:wholesale@maisontanneurs.com" },
]

export function Footer() {
  return (
    <footer
      data-nav-theme="light"
      className="bg-[var(--color-warm-black)] text-[var(--color-ivory)]"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">
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
            <h4 className="tech-label tech-label--ondark mb-5">Atelier</h4>
            <p className="text-sm text-[var(--color-ivory-soft)] leading-relaxed">
              A small workshop in the Marrakech medina.
              <br />
              Seven artisans · fourteen days · per piece.
            </p>
          </div>
          <div>
            <h4 className="tech-label tech-label--ondark mb-5">Contact</h4>
            <ul className="space-y-3">
              {CONTACT.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-[var(--color-ivory-soft)] hover:text-[var(--color-ivory)] transition-colors break-all">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--color-rule-on-dark)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--color-ivory-soft)]">
          <span className="tech-label tech-label--ondark">Maison Tanneurs · Marrakech</span>
          <span>© {new Date().getFullYear()} Maison Tanneurs. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
