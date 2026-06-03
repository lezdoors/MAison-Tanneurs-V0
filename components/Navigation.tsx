"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

const NAV = [
  { href: "/products", label: "Edition" },
  { href: "/atelier", label: "Atelier" },
  { href: "/heritage", label: "Heritage" },
]

const RESERVE_MAILTO =
  "mailto:hello@maisontanneurs.com?subject=Reserve%20%C2%B7%20Maison%20Tanneurs&body=I%27d%20like%20to%20reserve%20a%20piece.%20Please%20let%20me%20know%20when%20the%20next%20edition%20is%20available."

type NavTheme = "light" | "dark"

export function Navigation() {
  const [theme, setTheme] = useState<NavTheme>("dark")
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Sample the section under the nav (y=48) and use its data-nav-theme to pick
  // header colours. Hero sections declare data-nav-theme="light".
  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 24)
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
  const fgSoft = isLight ? "text-[var(--color-ivory-soft)]" : "text-[var(--color-ink-muted)]"
  const border = isLight ? "border-[var(--color-rule-on-dark)]" : "border-[var(--color-rule)]"

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background,backdrop-filter,border-color] duration-500 ${
          scrolled ? (isLight ? "bg-[var(--color-warm-black)]/55 backdrop-blur-md" : "bg-[var(--color-paper)]/85 backdrop-blur-md border-b border-[var(--color-rule)]") : ""
        }`}
      >
        <nav className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 lg:h-20 flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className={`lg:hidden p-2 -ml-2 ${fg}`}
          >
            <Menu className="h-5 w-5 stroke-[1.5]" />
          </button>

          <ul className={`hidden lg:flex items-center gap-10 text-[11px] tracking-[0.28em] uppercase ${fg}`}>
            {NAV.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`transition-opacity hover:opacity-70 ${pathname === l.href ? "opacity-100" : ""}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link href="/" aria-label="Maison Tanneurs — home" className={`font-display text-lg lg:text-xl tracking-[0.18em] ${fg}`}>
            MAISON TANNEURS
          </Link>

          <a
            href={RESERVE_MAILTO}
            className={`hidden sm:inline-flex text-[10px] tracking-[0.32em] uppercase px-4 py-2 border ${border} ${fg} hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] hover:border-[var(--color-ink)] transition-colors`}
          >
            Reserve
          </a>
          <span className="sm:hidden w-9" />
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 bg-[var(--color-paper)] flex flex-col">
          <div className="h-16 px-6 flex items-center justify-between border-b border-[var(--color-rule)]">
            <span className="tech-label">Menu</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 -mr-2 text-[var(--color-ink)]">
              <X className="h-5 w-5 stroke-[1.5]" />
            </button>
          </div>
          <ul className="flex-1 flex flex-col gap-2 px-6 py-10">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block font-display text-3xl py-3 text-[var(--color-ink)]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-6 mt-6 border-t border-[var(--color-rule)]">
              <a href={RESERVE_MAILTO} className="block tech-label text-[var(--color-ink)]">Reserve a piece →</a>
            </li>
          </ul>
        </div>
      )}
    </>
  )
}
