import { LegalLayout } from "@/components/LegalLayout"

export const metadata = {
  title: "Privacy Policy",
  description: "How Maison Tanneurs collects, processes, and protects your personal data.",
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <LegalLayout eyebrow="Legal · Privacy" title="Privacy Policy" lastUpdated="3 June 2026">
      <p>
        This Privacy Policy explains how <strong>Akal Digital Services Ltd</strong> (&ldquo;Maison Tanneurs&rdquo;,
        &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses, and shares your personal data when you visit{" "}
        <a href="https://maisontanneurs.com">maisontanneurs.com</a> or contact us about a piece. We are the data
        controller for all personal data processed through the site.
      </p>

      <h2>1 · Who we are</h2>
      <p>
        <strong>Akal Digital Services Ltd</strong> — registered in England &amp; Wales, company number{" "}
        <strong>17229387</strong>, registered office at 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ,
        United Kingdom. Sole director: Naoufal Haddaoui.
        For any privacy question, email{" "}
        <a href="mailto:hello@maisontanneurs.com">hello@maisontanneurs.com</a>.
      </p>

      <h2>2 · What we collect</h2>
      <p>We process the categories below, only when you provide them or visit the site:</p>
      <ul>
        <li>
          <strong>Reservation details</strong> — your email, name, and any message you include when emailing us to
          reserve a piece (sent via your own email client, not via a form on this site).
        </li>
        <li>
          <strong>Newsletter signup</strong> — your email address, if you submit it via the footer form.
        </li>
        <li>
          <strong>Site analytics</strong> — aggregated, anonymised page views and performance metrics (load times,
          page paths, viewport size). Only collected with your consent.
        </li>
        <li>
          <strong>Meta Pixel</strong> — when you consent, the Meta (Facebook) Pixel may store a cookie that lets us
          measure the effectiveness of our advertising on Meta-owned platforms. No purchase or contact data is sent.
        </li>
        <li>
          <strong>Order data</strong> — once Revolut card-checkout is live, the name, address, and payment metadata
          required to process and ship your order. Card data is handled directly by Revolut and never reaches our
          servers.
        </li>
      </ul>

      <h2>3 · How we use your data</h2>
      <ul>
        <li>To respond to your reservation enquiry and confirm availability of the requested piece.</li>
        <li>To send you the next edition newsletter you signed up for (you can unsubscribe in any email).</li>
        <li>To process and ship your order, and to handle returns or repairs.</li>
        <li>To understand which sections of the site are useful and to improve the edition.</li>
        <li>To detect fraud and to keep the site secure.</li>
      </ul>

      <h2>4 · Legal bases (UK GDPR)</h2>
      <ul>
        <li><strong>Contract</strong> — to fulfil your order, ship the piece, and handle returns.</li>
        <li><strong>Consent</strong> — for non-essential cookies (analytics, Meta Pixel) and newsletter signups.</li>
        <li><strong>Legitimate interest</strong> — to secure the site, prevent fraud, and respond to enquiries.</li>
        <li><strong>Legal obligation</strong> — to keep accounting records as required by UK law.</li>
      </ul>

      <h2>5 · Who we share with (data processors)</h2>
      <p>The site runs on third-party infrastructure. Each processor handles a defined slice of data:</p>
      <ul>
        <li><strong>Vercel Inc.</strong> — site hosting and edge delivery (USA).</li>
        <li><strong>Supabase Inc.</strong> — product catalogue and order storage (Singapore region).</li>
        <li><strong>Resend Inc.</strong> — transactional email delivery (USA / EU).</li>
        <li><strong>MochaHost</strong> — mailbox hosting for <code>hello@maisontanneurs.com</code>.</li>
        <li><strong>Revolut Ltd.</strong> — card processing once live (UK).</li>
        <li><strong>Meta Platforms Ireland Ltd.</strong> — only if you accept the Meta Pixel cookie.</li>
        <li><strong>FormSubmit</strong> — newsletter form proxy. May be replaced by Resend pre-launch.</li>
      </ul>
      <p>
        We do not sell your personal data. We do not share it with anyone outside the processors above and law
        enforcement when legally required.
      </p>

      <h2>6 · International transfers</h2>
      <p>
        Some processors are based outside the UK / EEA. Where this applies, transfers are protected by the UK&apos;s
        International Data Transfer Agreement, EU Standard Contractual Clauses, or equivalent safeguards.
      </p>

      <h2>7 · How long we keep data</h2>
      <ul>
        <li>Email correspondence: 24 months from last reply.</li>
        <li>Newsletter subscribers: until you unsubscribe.</li>
        <li>Order records: 7 years (UK accounting law).</li>
        <li>Analytics: 14 months in aggregated form.</li>
      </ul>

      <h2>8 · Your rights</h2>
      <p>You have the right to: access, correct, delete, restrict, port, or object to the processing of your personal data; and to withdraw consent at any time. To exercise these rights, email{" "}
        <a href="mailto:hello@maisontanneurs.com">hello@maisontanneurs.com</a>. You can also complain to the UK
        Information Commissioner&apos;s Office (<a href="https://ico.org.uk">ico.org.uk</a>).
      </p>

      <h2>9 · Cookies</h2>
      <p>
        Essential cookies (preferences, session) are set without consent because the site won&apos;t work without them.
        Analytics and Meta Pixel cookies are only set after you click &ldquo;Accept&rdquo; on the cookie banner. You can change
        your choice by clearing the <code>mt-consent</code> entry in your browser&apos;s local storage and reloading.
      </p>

      <h2>10 · Changes to this policy</h2>
      <p>
        We will update this page when our processing changes. The &ldquo;Last updated&rdquo; date at the top of the page
        reflects the latest revision.
      </p>
    </LegalLayout>
  )
}
