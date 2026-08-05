"use client";

import { useState, useEffect } from "react";
import { t } from "@/locales";
import { eventDetails } from "@/data/event";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import { WhyDonateWidget } from "@/components/ui/WhyDonateWidget";
import styles from "./FundraiserConfirmation.module.css";

const AMOUNT_STORAGE_KEY = "r4u:donation-amount";

function isWhyDonateReturn(): { isReturn: boolean; storedAmount: number } {
  if (typeof window === "undefined") return { isReturn: false, storedAmount: 0 };
  const params = new URLSearchParams(window.location.search);
  if (params.get("redirect_status") !== "succeeded") return { isReturn: false, storedAmount: 0 };
  let storedAmount = 0;
  try {
    storedAmount = Number(sessionStorage.getItem(AMOUNT_STORAGE_KEY)) || 0;
  } catch { /* unavailable */ }
  return { isReturn: true, storedAmount };
}

interface RegistrationData {
  participantId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  tierId: string;
  tierName: string;
  amountEur: number;
  rewards: string[];
  paymentToken: string;
}

interface FundraiserConfirmationProps {
  slug: string;
  editToken: string;
  displayName: string;
  registration?: RegistrationData;
  isRestoredSession?: boolean;
  onPaymentConfirmed?: () => void;
}

export function FundraiserConfirmation({
  slug,
  editToken,
  displayName,
  registration,
  isRestoredSession,
  onPaymentConfirmed,
}: FundraiserConfirmationProps) {
  const baseUrl = "european-resolve.org/events/2026-run-for-ukraine/fundraiser";
  const shareableUrl = `https://${baseUrl}?by=${slug}`;
  const editUrl = `${shareableUrl}&edit=${editToken}`;

  const [paymentReturn] = useState(() => isWhyDonateReturn());
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedEdit, setCopiedEdit] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [detectionActive, setDetectionActive] = useState(true);
  const [verifying, setVerifying] = useState(paymentReturn.isReturn && paymentReturn.storedAmount > 0);
  const [interruptedSession, setInterruptedSession] = useState(false);

  useEffect(() => {
    if (!isRestoredSession) return;

    if (paymentReturn.isReturn && paymentReturn.storedAmount > 0 && registration) {
      try { sessionStorage.removeItem(AMOUNT_STORAGE_KEY); } catch { /* unavailable */ }
      console.log("[FundraiserConfirmation] redirect return — auto-confirming with stored amount", paymentReturn.storedAmount);
      handleAutoConfirm(paymentReturn.storedAmount);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (!params.has("orderId") && !paymentReturn.isReturn) {
      setInterruptedSession(true);
      const timer = setTimeout(() => setInterruptedSession(false), 10 * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, [isRestoredSession]); // eslint-disable-line react-hooks/exhaustive-deps

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

  async function handleAutoConfirm(amount: number) {
    if (!registration) return;
    setVerifying(true);
    setConfirmError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    try {
      const res = await fetch(`${apiUrl}/api/register/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: registration.paymentToken,
          amount,
          email: registration.email,
          firstName: registration.firstName,
          lastName: registration.lastName,
        }),
      });
      const data = await res.json();

      if (data.success && data.data?.confirmed) {
        setConfirmed(true);
        onPaymentConfirmed?.();
      } else {
        const firstErr = data.errors?.[0];
        setConfirmError(firstErr?.code ? t(`errors.${firstErr.code}`) || firstErr.message : firstErr?.message ?? t("confirmation.confirmFailed"));
      }
    } catch {
      setConfirmError(t("confirmation.confirmError"));
    } finally {
      setVerifying(false);
    }
  }

  async function handleManualConfirm() {
    if (!registration) return;
    setConfirming(true);
    setConfirmError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    try {
      const res = await fetch(`${apiUrl}/api/register/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: registration.paymentToken,
          email: registration.email,
          firstName: registration.firstName,
          lastName: registration.lastName,
        }),
      });
      const data = await res.json();

      if (data.success && data.data?.confirmed) {
        setConfirmed(true);
        onPaymentConfirmed?.();
      } else {
        const firstErr = data.errors?.[0];
        setConfirmError(firstErr?.code ? t(`errors.${firstErr.code}`) || firstErr.message : firstErr?.message ?? t("confirmation.confirmFailed"));
      }
    } catch {
      setConfirmError(t("confirmation.confirmError"));
    } finally {
      setConfirming(false);
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.icon} aria-hidden="true">
        ✓
      </div>
      <h2 className={styles.heading}>{t("confirmation.heading")}</h2>
      <p className={styles.subheading}>
        {t("confirmation.subheading", { name: displayName })}
      </p>

      <div className={styles.linkBox}>
        <span className={styles.linkLabel}>{t("confirmation.shareableLink")}</span>
        <div className={styles.linkRow}>
          <span className={styles.linkUrl}>{baseUrl}?by={slug}</span>
          <button
            type="button"
            className={styles.copyButton}
            onClick={() => copyToClipboard(shareableUrl, "share")}
          >
            {copiedShare ? t("confirmation.copied") : t("confirmation.copy")}
          </button>
        </div>
      </div>

      <div className={styles.linkBox}>
        <span className={styles.linkLabel}>{t("confirmation.editLink")}</span>
        <div className={styles.linkRow}>
          <span className={styles.linkUrl}>
            …?by={slug}&edit={editToken.slice(0, 4)}…
          </span>
          <button
            type="button"
            className={styles.copyButton}
            onClick={() => copyToClipboard(editUrl, "edit")}
          >
            {copiedEdit ? t("confirmation.copied") : t("confirmation.copy")}
          </button>
        </div>
        <p className={styles.linkHint}>{t("confirmation.editHint")}</p>
      </div>

      {registration && (
        <div className={styles.registrationSection}>
          <h3 className={styles.registrationHeading}>
            {t("confirmation.registrationHeading")}
          </h3>
          <p className={styles.participantId}>
            {t("confirmation.participantId", { id: registration.participantId })}
          </p>

          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>{t("confirmation.tier")}</span>
              <span className={styles.summaryValue}>{registration.tierName}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>{t("confirmation.amount")}</span>
              <span className={styles.summaryValue}>€{registration.amountEur}</span>
            </div>
          </div>

          <div className={styles.rewards}>
            <h4 className={styles.rewardsHeading}>{t("confirmation.rewardsHeading")}</h4>
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
                {t("confirmation.paymentHeading", {
                  amount: String(registration.amountEur),
                })}
              </h4>
              <p className={styles.paymentInstructions}>
                {t("confirmation.paymentInstructions", {
                  amount: String(registration.amountEur),
                  tierName: registration.tierName,
                })}
              </p>

              {interruptedSession && (
                <div className={styles.interruptedNotice}>
                  <p>
                    {t("confirmation.interruptedSession")}
                  </p>
                </div>
              )}

              <div className={styles.widgetContainer} style={{ position: "relative" }}>
                <WhyDonateWidget
                  shortcode={eventDetails.whydonateShortcode}
                  onPaymentSuccess={(amount) => {
                    try {
                      sessionStorage.setItem(AMOUNT_STORAGE_KEY, String(amount));
                    } catch { /* unavailable */ }
                    handleAutoConfirm(amount).finally(() => {
                      try { sessionStorage.removeItem(AMOUNT_STORAGE_KEY); } catch { /* unavailable */ }
                    });
                  }}
                  onDetectionFailed={() => setDetectionActive(false)}
                  donorInfo={{ firstName: registration.firstName, lastName: registration.lastName, email: registration.email }}
                />
                {verifying && (
                  <div className={styles.verifyingOverlay}>
                    <div className={styles.verifyingSpinner} />
                    <p className={styles.verifyingText}>
                      {t("confirmation.verifyingPayment")}
                    </p>
                    {confirmError && <p className={styles.confirmError}>{confirmError}</p>}
                  </div>
                )}
              </div>

              {!detectionActive && (
                <div className={styles.confirmSection}>
                  <p className={styles.confirmLabel}>{t("confirmation.afterDonation")}</p>
                  <button
                    type="button"
                    className={styles.confirmButton}
                    onClick={handleManualConfirm}
                    disabled={confirming}
                  >
                    {confirming
                      ? t("confirmation.confirming")
                      : t("confirmation.confirmButton")}
                  </button>
                  {confirmError && <p className={styles.confirmError}>{confirmError}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.confirmedBanner}>
              <span className={styles.confirmedIcon}>✓</span>
              {t("confirmation.confirmed")}
            </div>
          )}
        </div>
      )}

      <a
        href={`/events/2026-run-for-ukraine/fundraiser?by=${slug}`}
        className={styles.viewLink}
      >
        {t("confirmation.viewPage")}
      </a>

      <div className={styles.shareSection}>
        <h3 className={styles.shareHeading}>{t("confirmation.shareHeading")}</h3>
        <SocialShareButtons url={shareableUrl} title={displayName} />
      </div>
    </section>
  );
}
