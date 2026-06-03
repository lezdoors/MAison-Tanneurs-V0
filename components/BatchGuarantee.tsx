// Two-column band: THE BATCH (left, paper) · THE GUARANTEE (right, noir).
// Strongest section on the page — anchors the "small atelier, real numbers"
// claim with hard figures (07 / 14 / ≤200) and a lifetime-repair promise.

function Row({ k, v, note }: { k: string; v: string; note?: string }) {
  return (
    <li className="flex items-baseline justify-between gap-6 py-4">
      <span className="tech-label">{k}</span>
      <span className="text-right">
        <span className="font-display text-base lg:text-lg block">{v}</span>
        {note && <span className="tech-meta opacity-70">{note}</span>}
      </span>
    </li>
  )
}

function DarkRow({ k, v, note }: { k: string; v: string; note?: string }) {
  return (
    <li className="flex items-baseline justify-between gap-6 py-4 border-[var(--color-rule-on-dark)]">
      <span className="tech-label tech-label--ondark">{k}</span>
      <span className="text-right text-[var(--color-ivory)]">
        <span className="font-display text-base lg:text-lg block">{v}</span>
        {note && <span className="tech-meta opacity-70 text-[var(--color-ivory-soft)]">{note}</span>}
      </span>
    </li>
  )
}

export function BatchGuarantee() {
  return (
    <section
      data-nav-theme="dark"
      aria-label="The batch and the guarantee"
      className="w-full bg-[var(--color-paper)] text-[var(--color-ink)] border-y border-[var(--color-rule)]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <article className="md:border-r border-[var(--color-rule)] border-b md:border-b-0 px-6 lg:px-12 py-16 lg:py-24">
          <div className="flex items-center gap-3 mb-8">
            <span className="tech-label">§06.A · The Batch</span>
            <span className="h-px w-10 bg-[var(--color-rule)]" />
          </div>
          <h3 className="font-display leading-[1.05] tracking-[-0.015em]" style={{ fontSize: "clamp(36px,4.4vw,72px)" }}>
            07 hands.
            <br />
            14 days.
            <br />
            <span className="text-[var(--color-ink-muted)]">No exceptions.</span>
          </h3>
          <p className="mt-8 max-w-[52ch] text-[14px] leading-[1.75] text-[var(--color-ink-soft)]">
            The atelier runs on a single closed circuit of seven master artisans in Marrakech — cutter, skiver,
            two stitchers, edge-coater, finisher, dispatcher. Every object is hand-assembled, edge-burnished
            and saddle-stitched at the same workbench, in the same fourteen-day cycle. We do not subcontract
            the finish. We do not inflate the run.
          </p>
          <ul className="mt-10 divide-y divide-[var(--color-rule)] border-y border-[var(--color-rule)]">
            <Row k="Run Size" v="≤ 200 / Edition" />
            <Row k="Cadence" v="04 Editions / Year" />
            <Row k="Ceiling" v="≤ 560 / Year" note="Numbered, never restocked" />
          </ul>
        </article>

        <article className="bg-[var(--color-warm-black)] text-[var(--color-ivory)] px-6 lg:px-12 py-16 lg:py-24">
          <div className="flex items-center gap-3 mb-8">
            <span className="tech-label tech-label--ondark">§06.B · The Guarantee</span>
            <span className="h-px w-10 bg-[var(--color-rule-on-dark)]" />
          </div>
          <h3 className="font-display leading-[1.05] tracking-[-0.015em]" style={{ fontSize: "clamp(36px,4.4vw,72px)" }}>
            Lifetime
            <br />
            Repair<span className="text-[var(--color-ivory-soft)]">.</span>
          </h3>
          <p className="mt-8 max-w-[52ch] text-[14px] leading-[1.75] text-[var(--color-ivory-soft)]">
            Vegetable-tanned full-grain leather is engineered to age, not to wear out. Edges darken, surfaces
            soften, the grain takes on the imprint of its carrier. When time finally catches up — a worn
            shoulder strap, a thread that has paid its debt — we re-stitch, re-line and re-edge. Shipping
            both ways is on us.
          </p>
          <ul className="mt-10 divide-y divide-[var(--color-rule-on-dark)] border-y border-[var(--color-rule-on-dark)]">
            <DarkRow k="Coverage" v="Lifetime · Original Owner" />
            <DarkRow k="Turnaround" v="14–21 Days" />
            <DarkRow k="Cost" v="Complimentary" note="Edge-coat, re-stitch, re-line" />
          </ul>
        </article>
      </div>
    </section>
  )
}
