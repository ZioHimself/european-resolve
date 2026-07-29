"use client";

import { useState } from "react";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import styles from "./FundraiserConfirmation.module.css";

interface FundraiserConfirmationProps {
  slug: string;
  editToken: string;
  displayName: string;
}

export function FundraiserConfirmation({
  slug,
  editToken,
  displayName,
}: FundraiserConfirmationProps) {
  const baseUrl = "european-resolve.org/events/2026-run-for-ukraine/fundraiser";
  const shareableUrl = `https://${baseUrl}?by=${slug}`;
  const editUrl = `${shareableUrl}&edit=${editToken}`;

  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedEdit, setCopiedEdit] = useState(false);

  async function copyToClipboard(text: string, type: "share" | "edit") {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "share") {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      } else {
        setCopiedEdit(true);
        setTimeout(() => setCopiedEdit(false), 2000);
      }
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.icon} aria-hidden="true">
        ✓
      </div>
      <h2 className={styles.heading}>Your fundraising page is ready!</h2>
      <p className={styles.subheading}>
        Share your page with friends and family — {displayName}
      </p>

      <div className={styles.linkBox}>
        <span className={styles.linkLabel}>Your shareable link</span>
        <div className={styles.linkRow}>
          <span className={styles.linkUrl}>{baseUrl}?by={slug}</span>
          <button
            type="button"
            className={styles.copyButton}
            onClick={() => copyToClipboard(shareableUrl, "share")}
          >
            {copiedShare ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className={styles.linkBox}>
        <span className={styles.linkLabel}>
          Secret edit link — save this!
        </span>
        <div className={styles.linkRow}>
          <span className={styles.linkUrl}>
            …?by={slug}&edit={editToken.slice(0, 4)}…
          </span>
          <button
            type="button"
            className={styles.copyButton}
            onClick={() => copyToClipboard(editUrl, "edit")}
          >
            {copiedEdit ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className={styles.linkHint}>
          This link lets you edit and publish your page. Keep it private.
        </p>
      </div>

      <a
        href={`/events/2026-run-for-ukraine/fundraiser?by=${slug}`}
        className={styles.viewLink}
      >
        View your page →
      </a>

      <div className={styles.shareSection}>
        <h3 className={styles.shareHeading}>Share your page</h3>
        <SocialShareButtons url={shareableUrl} title={displayName} />
      </div>
    </section>
  );
}
