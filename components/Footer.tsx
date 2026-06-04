import Link from "next/link"

const SHOP = [
  { label: "Edition", href: "/products" },
  { label: "Atelier", href: "/atelier" },
  { label: "Heritage", href: "/heritage" },
]
const SUPPORT = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
]
const CONTACT = [
  { label: "hello@maisontanneurs.com", href: "mailto:hello@maisontanneurs.com" },
  { label: "+44 7828 726017", href: "tel:+447828726017" },
]

export function Footer() {
  return (
    <footer
      data-nav-theme="light"
      className="bg-[var(--color-warm-black)] text-[var(--color-ivory)]"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-14">
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
            <h4 className="tech-label tech-label--ondark mb-5">Support</h4>
            <ul className="space-y-3">
              {SUPPORT.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[var(--color-ivory-soft)] hover:text-[var(--color-ivory)] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
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
          <div>
            <h4 className="tech-label tech-label--ondark mb-5">Atelier</h4>
            <p className="text-sm text-[var(--color-ivory-soft)] leading-relaxed">
              A small workshop in the Marrakech medina.
              <br />
              Seven artisans · fourteen days · per piece.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--color-rule-on-dark)] grid grid-cols-1 md:grid-cols-2 gap-4 items-start text-xs text-[var(--color-ivory-soft)] leading-relaxed">
          <div>
            <span className="tech-label tech-label--ondark block mb-2">Maison Tanneurs · A registered trade name of Akal Digital Services Ltd</span>
            <span>
              Company No. 17229387, registered in England &amp; Wales.<br />
              71-75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom.
            </span>
          </div>
          <div className="md:text-right">
            <span className="block">© {new Date().getFullYear()} Akal Digital Services Ltd. All rights reserved.</span>
            <span className="block mt-1">Hand-stitched in Marrakech · Numbered, never restocked.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
