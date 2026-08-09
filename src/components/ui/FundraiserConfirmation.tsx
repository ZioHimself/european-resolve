"use client";

import { useState, useEffect } from "react";
import { t } from "@/locales";
import { eventDetails } from "@/data/event";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import { WhyDonateWidget } from "@/components/ui/WhyDonateWidget";
import {
  PAYMENT_AMOUNT_STORAGE_KEY,
  parseWhyDonatePaymentReturn,
  clearPaymentAmountStorage,
} from "@/lib/whydonatePaymentRedirect";
import { regFlowLog, tokenHint } from "@/lib/registrationFlowLog";
import styles from "./FundraiserConfirmation.module.css";

const AMOUNT_STORAGE_KEY = PAYMENT_AMOUNT_STORAGE_KEY;

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

  const [paymentReturn] = useState(() => parseWhyDonatePaymentReturn());
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedEdit, setCopiedEdit] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [detectionActive, setDetectionActive] = useState(true);
  const [verifying, setVerifying] = useState(paymentReturn.isReturn);
  const [interruptedSession, setInterruptedSession] = useState(false);
  const [effectivePayment, setEffectivePayment] = useState<{
    tierName: string;
    rewards: string[];
    amountEur?: number;
  } | null>(null);

  useEffect(() => {
    regFlowLog.fundraiserConfirmation("panel mounted", {
      slug,
      hasRegistration: Boolean(registration),
      isRestoredSession: Boolean(isRestoredSession),
      paymentReturn: paymentReturn.isReturn,
    });
  }, []);

  useEffect(() => {
    if (!isRestoredSession) return;

    if (paymentReturn.isReturn && registration) {
      clearPaymentAmountStorage();
      regFlowLog.fundraiserConfirmation("redirect return — auto-confirming", {
        amount: paymentReturn.amount,
        paymentToken: tokenHint(registration.paymentToken),
      });
      handleAutoConfirm(paymentReturn.amount);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (!params.has("orderId") && !paymentReturn.isReturn) {
      regFlowLog.fundraiserConfirmationWarn("restored session without payment return params");
      setInterruptedSession(true);
      const timer = setTimeout(() => setInterruptedSession(false), 10 * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, [isRestoredSession]);

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

  async function handleAutoConfirm(amount?: number) {
    if (!registration) return;
    setVerifying(true);
    setConfirmError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    regFlowLog.fundraiserConfirmation("confirm-payment request (auto)", {
      paymentToken: tokenHint(registration.paymentToken),
      amount,
    });

    try {
      const res = await fetch(`${apiUrl}/api/register/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: registration.paymentToken,
          ...(amount != null ? { amount } : {}),
          email: registration.email,
          firstName: registration.firstName,
          lastName: registration.lastName,
        }),
      });
      const data = await res.json();

      if (data.success && data.data?.confirmed) {
        regFlowLog.fundraiserConfirmation("confirm-payment success (auto)", {
          tierName: data.data.tierName,
          amountEur: data.data.amountEur,
          rewardCount: data.data.rewards?.length ?? 0,
        });
        setEffectivePayment({
          tierName: data.data.tierName,
          rewards: data.data.rewards ?? [],
          amountEur: data.data.amountEur,
        });
        setConfirmed(true);
        onPaymentConfirmed?.();
      } else {
        const firstErr = data.errors?.[0];
        regFlowLog.fundraiserConfirmationWarn("confirm-payment rejected (auto)", {
          status: res.status,
          code: firstErr?.code,
          message: firstErr?.message,
        });
        setConfirmError(firstErr?.code ? t(`errors.${firstErr.code}`) || firstErr.message : firstErr?.message ?? t("confirmation.confirmFailed"));
      }
    } catch {
      regFlowLog.fundraiserConfirmationError("confirm-payment network error (auto)");
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
    regFlowLog.fundraiserConfirmation("confirm-payment request (manual)", {
      paymentToken: tokenHint(registration.paymentToken),
    });

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
        regFlowLog.fundraiserConfirmation("confirm-payment success (manual)", {
          tierName: data.data.tierName,
          amountEur: data.data.amountEur,
          rewardCount: data.data.rewards?.length ?? 0,
        });
        setEffectivePayment({
          tierName: data.data.tierName,
          rewards: data.data.rewards ?? [],
          amountEur: data.data.amountEur,
        });
        setConfirmed(true);
        onPaymentConfirmed?.();
      } else {
        const firstErr = data.errors?.[0];
        regFlowLog.fundraiserConfirmationWarn("confirm-payment rejected (manual)", {
          status: res.status,
          code: firstErr?.code,
          message: firstErr?.message,
        });
        setConfirmError(firstErr?.code ? t(`errors.${firstErr.code}`) || firstErr.message : firstErr?.message ?? t("confirmation.confirmFailed"));
      }
    } catch {
      regFlowLog.fundraiserConfirmationError("confirm-payment network error (manual)");
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
                  donationStorageKeys={{ amount: AMOUNT_STORAGE_KEY }}
                  minTierAmount={registration.amountEur}
                  minTierName={registration.tierName}
                  onPaymentSuccess={(amount) => {
                    regFlowLog.fundraiserConfirmation("widget reported payment success", { amount });
                    try {
                      sessionStorage.setItem(AMOUNT_STORAGE_KEY, String(amount));
                    } catch { /* unavailable */ }
                    handleAutoConfirm(amount).finally(clearPaymentAmountStorage);
                  }}
                  onDetectionFailed={() => {
                    regFlowLog.fundraiserConfirmationWarn("widget auto-detection failed — showing manual confirm");
                    setDetectionActive(false);
                  }}
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
            <>
              <div className={styles.confirmedBanner}>
                <span className={styles.confirmedIcon}>✓</span>
                {t("confirmation.confirmed")}
              </div>

              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>{t("confirmation.tier")}</span>
                  <span className={styles.summaryValue}>
                    {effectivePayment?.tierName ?? registration.tierName}
                  </span>
                </div>
                {effectivePayment?.amountEur != null && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryKey}>{t("confirmation.amount")}</span>
                    <span className={styles.summaryValue}>
                      €{effectivePayment.amountEur}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.rewards}>
                <h4 className={styles.rewardsHeading}>{t("confirmation.rewardsHeading")}</h4>
                <ul className={styles.rewardsList}>
                  {(effectivePayment?.rewards ?? registration.rewards).map((reward) => (
                    <li key={reward} className={styles.reward}>
                      <span className={styles.check}>✓</span> {reward}
                    </li>
                  ))}
                </ul>
              </div>
            </>
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
