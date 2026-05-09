import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — European Resolve",
  description: "How European Resolve handles data",
};

export default function PrivacyPage() {
  return (
    <article className={styles.privacy}>
      <h1>Data Privacy Policy</h1>
      <p>
        This policy defines how we handle personal data in compliance with GDPR.
      </p>

      <h2>Framework</h2>
      <p>
        We&apos;re a Belgian NGO. GDPR applies. We process personal data
        lawfully, fairly, and transparently.
      </p>

      <h2>What we collect</h2>
      <p>
        As a static website, we do not collect, store, or process any personal
        data. We don&apos;t use cookies, analytics, or tracking of any kind.
      </p>

      <h2>Data minimization</h2>
      <ul>
        <li>Only collect what we need</li>
        <li>Only keep it as long as necessary</li>
        <li>Only give access to those who need it</li>
      </ul>

      <h2>Data subject rights</h2>
      <p>
        People can request to access, correct, or delete their data. We respond
        within 30 days.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        Not implemented. If added in the future, cookie consent will be required
        for non-essential tracking, and this privacy notice will be updated.
      </p>

      <h2>International transfers</h2>
      <p>
        No routine transfers outside EU/EEA. If needed, adequate safeguards
        (Standard Contractual Clauses or equivalent) will be ensured.
      </p>

      <h2>Contact</h2>
      <p>
        For data-related inquiries, contact the{" "}
        <Link href="/team/serhiy-onyshchenko">Head of IT</Link> at European
        Resolve VZW.
      </p>
    </article>
  );
}
