"use client";

import { useState } from "react";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import { WhyDonateWidget } from "@/components/ui/WhyDonateWidget";
import styles from "./FundraiserConfirmation.module.css";

interface RegistrationData {
  participantId: string;
  fullName: string;
  tierId: string;
  tierName: string;
  amountEur: number;
  rewards: string[];
  paymentToken: string;
  whydonateWidgetUrl: string;
}

interface FundraiserConfirmationProps {
  slug: string;
  editToken: string;
  displayName: string;
  registration?: RegistrationData;
}

export function FundraiserConfirmation({
  slug,
  editToken,
  displayName,
  registration,
}: FundraiserConfirmationProps) {
  const baseUrl = "european-resolve.org/events/2026-run-for-ukraine/fundraiser";
  const shareableUrl = `https://${baseUrl}?by=${slug}`;
  const editUrl = `${shareableUrl}&edit=${editToken}`;

  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedEdit, setCopiedEdit] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

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

  async function handleConfirmPayment() {
    if (!registration) return;
    setConfirming(true);
    setConfirmError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    try {
      const res = await fetch(`${apiUrl}/api/register/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: registration.paymentToken }),
      });
      const data = await res.json();

      if (data.success && data.data?.confirmed) {
        setConfirmed(true);
      } else {
        setConfirmError(data.errors?.[0]?.message ?? "Confirmation failed");
      }
    } catch {
      setConfirmError("Could not confirm payment. Please try again.");
    } finally {
      setConfirming(false);
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

      {registration && (
        <div className={styles.registrationSection}>
          <h3 className={styles.registrationHeading}>Runner registration</h3>
          <p className={styles.participantId}>Your ID: {registration.participantId}</p>

          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>Tier</span>
              <span className={styles.summaryValue}>{registration.tierName}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>Amount</span>
              <span className={styles.summaryValue}>€{registration.amountEur}</span>
            </div>
          </div>

          <div className={styles.rewards}>
            <h4 className={styles.rewardsHeading}>Your rewards</h4>
            <ul className={styles.rewardsList}>
              {registration.rewards.map((reward) => (
                <li key={reward} className={styles.reward}>
                  <span className={styles.check}>✓</span> {reward}
                </li>
              ))}
            </ul>
          </div>

          {!confirmed ? (
            <div className={styles.paymentSection}>
              <h4 className={styles.paymentHeading}>
                Complete your €{registration.amountEur} donation
              </h4>
              <p className={styles.paymentInstructions}>
                Select the <strong>€{registration.amountEur}</strong> option below to complete your {registration.tierName} registration.
              </p>

              <div className={styles.widgetContainer}>
                <WhyDonateWidget shortcode="nudW7" />
              </div>

              <div className={styles.confirmSection}>
                <p className={styles.confirmLabel}>After completing your donation above:</p>
                <button
                  type="button"
                  className={styles.confirmButton}
                  onClick={handleConfirmPayment}
                  disabled={confirming}
                >
                  {confirming ? "Confirming…" : "I\u2019ve completed my donation"}
                </button>
                {confirmError && <p className={styles.confirmError}>{confirmError}</p>}
              </div>
            </div>
          ) : (
            <div className={styles.confirmedBanner}>
              <span className={styles.confirmedIcon}>✓</span>
              Payment confirmed — you&apos;re all set!
            </div>
          )}
        </div>
      )}

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
