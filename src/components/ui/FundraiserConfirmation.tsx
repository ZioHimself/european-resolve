"use client";

import { useState } from "react";
import { t } from "@/locales";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import { WhyDonateWidget } from "@/components/ui/WhyDonateWidget";
import styles from "./FundraiserConfirmation.module.css";

interface RegistrationData {
  participantId: string;
  fullName: string;
  email?: string;
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
  onPaymentConfirmed?: () => void;
}

export function FundraiserConfirmation({
  slug,
  editToken,
  displayName,
  registration,
  onPaymentConfirmed,
}: FundraiserConfirmationProps) {
  const baseUrl = "european-resolve.org/events/2026-run-for-ukraine/fundraiser";
  const shareableUrl = `https://${baseUrl}?by=${slug}`;
  const editUrl = `${shareableUrl}&edit=${editToken}`;

  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedEdit, setCopiedEdit] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [detectionActive, setDetectionActive] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [effectiveTierName, setEffectiveTierName] = useState<string | null>(null);
  const [effectiveRewards, setEffectiveRewards] = useState<string[] | null>(null);

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
        body: JSON.stringify({ token: registration.paymentToken, amount }),
      });
      const data = await res.json();

      if (data.success && data.data?.confirmed) {
        setConfirmed(true);
        setEffectiveTierName(data.data.effectiveTierName ?? null);
        setEffectiveRewards(data.data.rewards ?? null);
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
        body: JSON.stringify({ token: registration.paymentToken }),
      });
      const data = await res.json();

      if (data.success && data.data?.confirmed) {
        setConfirmed(true);
        setEffectiveTierName(data.data.effectiveTierName ?? null);
        setEffectiveRewards(data.data.rewards ?? null);
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

  const displayTierName = effectiveTierName ?? registration?.tierName;
  const displayRewards = effectiveRewards ?? registration?.rewards;

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
              <span className={styles.summaryValue}>{confirmed ? displayTierName : registration.tierName}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>{t("confirmation.amount")}</span>
              <span className={styles.summaryValue}>€{registration.amountEur}</span>
            </div>
          </div>

          <div className={styles.rewards}>
            <h4 className={styles.rewardsHeading}>{t("confirmation.rewardsHeading")}</h4>
            <ul className={styles.rewardsList}>
              {(confirmed && displayRewards ? displayRewards : registration.rewards).map((reward) => (
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

              <div className={styles.widgetContainer} style={{ position: "relative" }}>
                <WhyDonateWidget
                  shortcode={process.env.NEXT_PUBLIC_WHYDONATE_SHORTCODE ?? ""}
                  onPaymentSuccess={handleAutoConfirm}
                  onDetectionFailed={() => setDetectionActive(false)}
                  donorInfo={registration.email ? { fullName: registration.fullName, email: registration.email } : undefined}
                />
                {verifying && (
                  <div className={styles.verifyingOverlay}>
                    <div className={styles.verifyingSpinner} />
                    <p className={styles.verifyingText}>
                      {t("confirmation.verifyingPayment") || "Verifying payment..."}
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
