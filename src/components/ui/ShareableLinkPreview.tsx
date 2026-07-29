"use client";

import { useState } from "react";
import styles from "./ShareableLinkPreview.module.css";

interface ShareableLinkPreviewProps {
  slug?: string;
}

export function ShareableLinkPreview({ slug }: ShareableLinkPreviewProps) {
  const [copied, setCopied] = useState(false);

  const displayUrl = slug
    ? `european-resolve.org/events/2026-run-for-ukraine/fundraiser?by=${slug}`
    : "european-resolve.org/r4u/your-name-here";

  const fullUrl = slug
    ? `https://european-resolve.org/events/2026-run-for-ukraine/fundraiser?by=${slug}`
    : "";

  async function handleCopy() {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <div className={styles.box}>
      <span className={styles.overline}>Your shareable link</span>
      <div className={styles.row}>
        <span className={styles.url}>{displayUrl}</span>
        <button
          type="button"
          className={styles.copyButton}
          disabled={!slug}
          aria-disabled={!slug}
          aria-label="Copy link"
          onClick={handleCopy}
        >
          <svg
            className={styles.copyIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
