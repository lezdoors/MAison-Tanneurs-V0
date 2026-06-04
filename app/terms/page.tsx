import { LegalLayout } from "@/components/LegalLayout"

export const metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Maison Tanneurs and any purchase made.",
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <LegalLayout eyebrow="Legal · Terms" title="Terms of Service" lastUpdated="3 June 2026">
      <p>
        These Terms govern your use of <a href="https://maisontanneurs.com">maisontanneurs.com</a> and any order you
        place with us. By reserving or purchasing a piece you agree to them.
      </p>

      <h2>1 · About us</h2>
      <p>
        The site is operated by <strong>Akal Digital Services Ltd</strong>, a company registered in England &amp;
        Wales (company number <strong>17229387</strong>) with its registered office at 71-75 Shelton Street, Covent
        Garden, London, WC2H 9JQ, United Kingdom. Contact:{" "}
        <a href="mailto:hello@maisontanneurs.com">hello@maisontanneurs.com</a> · +44 7828 726017.
      </p>

      <h2>2 · The edition</h2>
      <p>
        Every Maison Tanneurs piece is hand-cut, saddle-stitched, and finished in our atelier in Marrakech,
        Morocco. Editions are numbered and produced in limited runs of 200 or fewer. Photographs on the site
        represent the type of piece you will receive; small variations in grain, colour, and patina are inherent
        to full-grain leather and are not defects.
      </p>

      <h2>3 · Reserving a piece</h2>
      <p>
        Until card checkout goes live, reservations are made by email through the &ldquo;Reserve&rdquo; button on the
        product page. A reservation is an enquiry, not a binding sale. We will confirm availability, lead time,
        and total cost by reply before any payment is requested.
      </p>

      <h2>4 · Orders and payment</h2>
      <p>
        When card checkout is enabled, orders are processed via <strong>Revolut</strong>. Prices are shown in the
        currency selected at checkout; the charge appears on your statement in GBP (the merchant&apos;s settlement
        currency). Your bank may apply a foreign-exchange fee — that&apos;s outside our control.
      </p>
      <p>
        A contract of sale is formed only when we email you an order confirmation. We reserve the right to refuse
        an order — for instance if a piece is sold out, if we suspect fraud, or if the requested ship-to country is
        outside our delivery network.
      </p>

      <h2>5 · Shipping</h2>
      <p>
        Pieces ship from Marrakech. Standard lead time is 14 days from order confirmation; small leather goods may
        ship sooner. We&apos;ll email tracking when the piece leaves the atelier. Import duties and taxes for
        deliveries outside the UK are the recipient&apos;s responsibility.
      </p>

      <h2>6 · Returns &amp; cancellations</h2>
      <p>
        Under the UK Consumer Contracts Regulations, you have <strong>14 days</strong> from the day after you
        receive the piece to change your mind and request a return. To exercise this right, email{" "}
        <a href="mailto:hello@maisontanneurs.com">hello@maisontanneurs.com</a> with your order number.
      </p>
      <p>
        Returned pieces must be unused, in their original packaging, and accompanied by all documents. We refund
        the full amount paid (including standard outbound shipping) within 14 days of receiving the piece back.
      </p>
      <p>
        {/* PLACEHOLDER — Ryan to decide before public launch:
            (a) restocking fee %, and
            (b) who pays return shipping (customer for change-of-mind, merchant for defects). */}
        <strong>Return shipping:</strong> if you change your mind, return shipping is at your cost. If the piece
        arrives faulty or not as described, we arrange and pay for the collection and refund the original
        shipping. (Restocking fee policy: 0% — pending final confirmation.)
      </p>

      <h2>7 · Lifetime repair guarantee</h2>
      <p>
        Every Maison Tanneurs piece carries our lifetime repair promise: re-stitch, re-line, re-edge for the
        original owner, complimentary, ship-both-ways included. The guarantee covers normal wear from carrying;
        it does not cover damage from accidents, neglect, or third-party repairs.
      </p>

      <h2>8 · Intellectual property</h2>
      <p>
        All site content — photography, video, copy, the Maison Tanneurs name and mark — is owned by Akal Digital
        Services Ltd or its licensors and is protected by UK and international copyright law. You may not
        reproduce, distribute, or use it commercially without our written consent.
      </p>

      <h2>9 · Liability</h2>
      <p>
        We are responsible for losses that are a foreseeable result of our breaking these terms or our failure to
        use reasonable care. We do not exclude liability for death, personal injury, fraud, or breach of statutory
        consumer rights — these can never be limited by us.
      </p>

      <h2>10 · Governing law</h2>
      <p>
        These Terms and any dispute arising under them are governed by the laws of <strong>England &amp; Wales</strong>{" "}
        and subject to the exclusive jurisdiction of the courts of England &amp; Wales. EU consumers also benefit
        from any mandatory protections of the country in which they ordinarily reside.
      </p>

      <h2>11 · Changes to these Terms</h2>
      <p>
        We may amend these Terms occasionally. The version that applies to your order is the one in force on the
        date the order is confirmed. The &ldquo;Last updated&rdquo; date at the top of the page reflects the latest
        revision.
      </p>
    </LegalLayout>
  )
}
