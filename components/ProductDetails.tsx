"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

// Collapsible product details — Materials / Dimensions / Care / Shipping.
// Pure CSS transition (no framer dep). First item opens by default.
type Item = { title: string; content: string[] }

export function ProductDetails({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="divide-y divide-[var(--color-rule)] border-y border-[var(--color-rule)]">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex items-center justify-between w-full text-left py-5 group"
            >
              <span className="tech-label group-hover:text-[var(--color-ink)] transition-colors">{item.title}</span>
              {isOpen ? (
                <Minus className="w-4 h-4 stroke-[1.2] text-[var(--color-ink-muted)]" />
              ) : (
                <Plus className="w-4 h-4 stroke-[1.2] text-[var(--color-ink-muted)]" />
              )}
            </button>
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <ul className="pb-6 space-y-3 text-[13px] leading-[1.75] text-[var(--color-ink-soft)]">
                  {item.content.map((line, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span className="w-6 h-px bg-[var(--color-rule)] mt-[11px] flex-shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
