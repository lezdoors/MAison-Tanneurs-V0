"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Archive, Menu, X } from "lucide-react"

const NAV = [
  { href: "/products", label: "La Collection", code: "01" },
  { href: "/atelier", label: "L'Atelier", code: "02" },
  { href: "/heritage", label: "Heritage", code: "03" },
]

const RESERVE_MAILTO =
  "mailto:hello@maisontanneurs.com?subject=Reserve%20%C2%B7%20Maison%20Tanneurs&body=I%27d%20like%20to%20reserve%20a%20piece.%20Please%20let%20me%20know%20when%20the%20next%20edition%20is%20available."

type NavTheme = "light" | "dark"

export function Navigation() {
  const [theme, setTheme] = useState<NavTheme>("dark")
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Sample the section currently behind the nav (y=48) and use its
  // data-nav-theme attribute to pick header colours. Hero/dark sections
  // declare data-nav-theme="light"; paper/light sections declare "dark".
  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 40)
      const sampled = document.elementsFromPoint(window.innerWidth / 2, 48)
      let next: NavTheme = "dark"
      for (const el of sampled) {
        const t = (el as HTMLElement).closest?.("[data-nav-theme]") as HTMLElement | null
        if (t) {
          const v = t.dataset.navTheme
          if (v === "light" || v === "dark") {
            next = v as NavTheme
            break
          }
        }
      }
      setTheme(next)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [pathname])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const isLight = theme === "light"
  const fg = isLight ? "text-[var(--color-ivory)]" : "text-[var(--color-ink)]"
  const border = isLight ? "border-[var(--color-rule-on-dark)]" : "border-[var(--color-rule)]"
  // text-shadow keeps the wordmark + links legible over any photo / video
  // beneath the section's own scrim. No-op on light (dark text) sections.
  const txtShadow = isLight ? "0 1px 14px rgba(0,0,0,0.55)" : "none"

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-700 ease-in-out ${
          scrolled
            ? isLight
              ? "bg-[var(--color-warm-black)]/82 backdrop-blur-md border-b border-[var(--color-rule-on-dark)] shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
              : "bg-[var(--color-paper)]/95 backdrop-blur-md border-b border-[var(--color-rule)] shadow-[0_1px_2px_rgba(0,0,0,0.005)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className={`max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-10 flex items-center justify-between gap-3 relative transition-[height] duration-700 ease-in-out ${scrolled ? "h-16 lg:h-[72px]" : "h-20 lg:h-24"}`}>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className={`lg:hidden p-2 -ml-2 transition-colors duration-300 ${fg}`}
            style={{ textShadow: txtShadow }}
          >
            <Menu className="h-4 w-4 stroke-[1.15]" />
          </button>

          <ul
            className={`hidden lg:flex items-center gap-10 text-[9px] tracking-[0.34em] uppercase select-none transition-colors duration-300 ${fg}`}
            style={{ textShadow: txtShadow }}
          >
            {NAV.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`transition-colors duration-300 hover:text-[var(--color-ink)] ${pathname === l.href ? "opacity-100" : "opacity-80"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/"
            aria-label="Maison Tanneurs - home"
            className={`font-display absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base sm:text-lg lg:text-xl uppercase tracking-[0.28em] sm:tracking-[0.34em] whitespace-nowrap transition-[color,transform] duration-500 ${fg}`}
            style={{ textShadow: txtShadow }}
          >
            Maison Tanneurs
          </Link>

          <div className={`hidden sm:flex items-center gap-7 transition-colors duration-300 ${fg}`} style={{ textShadow: txtShadow }}>
            <Link
              href="/products"
              aria-label="Object register"
              className="hover:text-[var(--color-ink)] transition-colors duration-300"
            >
              <Archive className="h-[15px] w-[15px] stroke-[1.05]" />
            </Link>
            <a
              href={RESERVE_MAILTO}
              className={`inline-flex text-[10px] tracking-[0.28em] uppercase px-4 py-2 border ${border} hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] hover:border-[var(--color-ink)] transition-colors duration-300`}
            >
              Reserve
            </a>
          </div>
          <span className="sm:hidden w-9" aria-hidden />
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 bg-[var(--color-paper)] flex flex-col">
          <div className="h-16 px-5 flex items-center justify-between border-b border-[var(--color-rule)]">
            <span className="tech-label">Archive Index</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 -mr-2 text-[var(--color-ink)]">
              <X className="h-5 w-5 stroke-[1.5]" />
            </button>
          </div>
          <ul className="flex-1 flex flex-col px-5 py-8">
            {NAV.map((l) => (
              <li key={l.href} className="border-b border-[var(--color-rule)]">
                <Link
                  href={l.href}
                  className="grid grid-cols-[48px_1fr] items-baseline gap-4 py-6 text-[var(--color-ink)]"
                >
                  <span className="tech-meta">{l.code}</span>
                  <span className="font-display text-[clamp(30px,11vw,56px)] leading-none">{l.label}</span>
                </Link>
              </li>
            ))}
            <li className="pt-8">
              <a href={RESERVE_MAILTO} className="inline-flex border border-[var(--color-ink)] px-5 py-4 text-[11px] tracking-[0.24em] uppercase text-[var(--color-ink)]">
                Request availability
              </a>
            </li>
          </ul>
          <div className="px-5 py-5 border-t border-[var(--color-rule)]">
            <p className="text-[12px] leading-[1.7] text-[var(--color-ink-muted)]">
              Numbered leather objects. Marrakech atelier. Lifetime repair record.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
