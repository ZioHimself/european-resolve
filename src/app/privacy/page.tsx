import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | European Resolve",
  description:
    "How European Resolve VZW handles personal data under GDPR, including event registration and fundraising.",
};

export default function PrivacyPage() {
  return (
    <article className={styles.privacy}>
      <h1>Privacy Policy</h1>
      <p>
        <strong>Last updated:</strong> July 2026
      </p>
      <p>
        This policy explains how European Resolve VZW (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;) collects, uses, and protects personal data in
        compliance with the General Data Protection Regulation (GDPR).
      </p>

      <h2>1. Data controller</h2>
      <p>
        European Resolve VZW, a Belgian non-profit organisation, is the data
        controller for all personal data processed through this website and its
        event registration services.
      </p>
      <p>
        Contact for data protection inquiries:{" "}
        <a href="mailto:it@european-resolve.org">it@european-resolve.org</a>
      </p>

      <h2>2. Website browsing</h2>
      <p>
        Our public website is a static site. When you browse it without
        registering for an event, we do not collect personal data, set cookies,
        or use analytics or tracking technologies.
      </p>

      <h2>3. Event registration data</h2>
      <p>
        When you register for one of our events (e.g. 35 Years of Ukraine
        Independence: Charity and Run), we collect:
      </p>
      <ul>
        <li>
          <strong>Identity data:</strong> full name, email address, phone number
          (optional)
        </li>
        <li>
          <strong>Event data:</strong> participation type (runner/supporter),
          t-shirt size, selected tier, language preference, country
        </li>
        <li>
          <strong>Consent records:</strong> GDPR consent confirmation,
          communications opt-in preference
        </li>
      </ul>
      <p>
        <strong>Legal basis:</strong> Your explicit consent (Art. 6(1)(a) GDPR),
        given via the required consent checkbox at registration.
      </p>
      <p>
        <strong>Purpose:</strong> Processing your registration, event logistics
        (race bibs, t-shirts, safety), sending you a confirmation email, and
        tracking donation progress toward the collective goal.
      </p>

      <h2>4. Fundraiser page data</h2>
      <p>
        If you create a personal fundraising page, we additionally collect:
      </p>
      <ul>
        <li>Display name and personal message (publicly visible on your page)</li>
        <li>Personal fundraising goal</li>
        <li>Profile photo (optional, publicly visible)</li>
      </ul>
      <p>
        <strong>Legal basis:</strong> Consent (Art. 6(1)(a) GDPR). You
        explicitly choose what to publish on your fundraising page.
      </p>

      <h2>5. Donor wall messages</h2>
      <p>
        When you leave a message on a fundraiser&apos;s supporter wall, we
        collect the display name and message you provide. These are publicly
        visible.
      </p>
      <p>
        <strong>Legal basis:</strong> Legitimate interest (Art. 6(1)(f) GDPR) in
        operating a community supporter wall where participants voluntarily share
        encouragement. Only what you choose to submit is stored.
      </p>

      <h2>6. Email communications</h2>
      <p>
        We send transactional emails (registration confirmation, fundraiser page
        details) to the email address you provide at registration. These are
        one-time operational messages.
      </p>
      <p>
        If you opt in to ongoing communications, we may occasionally send news
        about future events and beneficiary updates. You can unsubscribe at any
        time by contacting us.
      </p>

      <h2>7. Where data is stored</h2>
      <ul>
        <li>
          <strong>Registration and donor data:</strong> Google Sheets (Google
          Workspace), stored on EU servers under Google&apos;s Data Processing
          Agreement and Standard Contractual Clauses.
        </li>
        <li>
          <strong>Fundraiser photos:</strong> Google Drive, same protections as
          above.
        </li>
        <li>
          <strong>Email delivery:</strong> Processed via SMTP through our email
          provider. We do not store email content after delivery.
        </li>
      </ul>
      <p>
        Access to personal data is restricted to organisers who need it for event
        operations.
      </p>

      <h2>8. International transfers</h2>
      <p>
        Google services may process data in data centres outside the EU/EEA.
        These transfers are covered by Standard Contractual Clauses and
        Google&apos;s GDPR commitments. We do not transfer data to any other
        third parties.
      </p>

      <h2>9. Data retention</h2>
      <ul>
        <li>
          Registration data is retained for the duration of the event and up to
          12 months afterwards for operational follow-up and accountability
          reporting.
        </li>
        <li>
          Fundraiser pages and donor wall messages remain publicly visible while
          the event page is active. They are archived or deleted after the event
          concludes.
        </li>
        <li>
          You may request earlier deletion at any time (see below).
        </li>
      </ul>

      <h2>10. Your rights</h2>
      <p>Under GDPR, you have the right to:</p>
      <ul>
        <li>
          <strong>Access</strong> the personal data we hold about you
        </li>
        <li>
          <strong>Rectify</strong> inaccurate data
        </li>
        <li>
          <strong>Erase</strong> your data (&ldquo;right to be
          forgotten&rdquo;)
        </li>
        <li>
          <strong>Restrict</strong> or <strong>object</strong> to processing
        </li>
        <li>
          <strong>Data portability</strong>: receive your data in a structured
          format
        </li>
        <li>
          <strong>Withdraw consent</strong> at any time without affecting the
          lawfulness of prior processing
        </li>
      </ul>
      <p>
        To exercise any of these rights, email{" "}
        <a href="mailto:it@european-resolve.org">it@european-resolve.org</a>. We
        respond within 30 days.
      </p>
      <p>
        You also have the right to lodge a complaint with the Belgian Data
        Protection Authority (
        <a
          href="https://www.dataprotectionauthority.be"
          target="_blank"
          rel="noopener noreferrer"
        >
          www.dataprotectionauthority.be
        </a>
        ).
      </p>

      <h2>11. Cookies and analytics</h2>
      <p>
        We do not use cookies, analytics tools, or tracking technologies. If
        this changes in the future, we will update this policy and implement a
        consent mechanism before any non-essential tracking.
      </p>

      <h2>12. Donations</h2>
      <p>
        All donations are processed externally via Monobank (the
        beneficiary&apos;s payment provider). We do not collect, process, or
        store payment card details or financial transaction data. Our platform
        only redirects you to the external donation page.
      </p>

      <h2>13. Changes to this policy</h2>
      <p>
        We may update this policy to reflect changes in our data practices. The
        &ldquo;last updated&rdquo; date at the top indicates the most recent
        revision.
      </p>

      <h2>14. Contact</h2>
      <p>
        For any questions about this privacy policy or your personal data,
        contact:{" "}
        <a href="mailto:it@european-resolve.org">it@european-resolve.org</a>
      </p>
    </article>
  );
}
