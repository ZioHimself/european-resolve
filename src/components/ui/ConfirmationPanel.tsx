"use client";

import { useState, useEffect } from "react";
import { t } from "@/locales";
import { eventDetails } from "@/data/event";
import type { RegisterResponse } from "./registerTypes";
import { WhyDonateWidget } from "./WhyDonateWidget";
import {
  PAYMENT_AMOUNT_STORAGE_KEY,
  parseWhyDonatePaymentReturn,
  clearPaymentAmountStorage,
} from "@/lib/whydonatePaymentRedirect";
import styles from "./ConfirmationPanel.module.css";

interface ConfirmationPanelProps {
  result: RegisterResponse;
  isRestoredSession?: boolean;
  onPaymentConfirmed?: () => void;
  onStartOver?: () => void;
}

const AMOUNT_STORAGE_KEY = PAYMENT_AMOUNT_STORAGE_KEY;

export function ConfirmationPanel({ result, isRestoredSession, onPaymentConfirmed, onStartOver }: ConfirmationPanelProps) {
  const [paymentReturn] = useState(() => parseWhyDonatePaymentReturn());
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectionActive, setDetectionActive] = useState(true);
  const [verifying, setVerifying] = useState(() => paymentReturn.isReturn);
  const [interruptedSession, setInterruptedSession] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [effectivePayment, setEffectivePayment] = useState<{
    tierName: string;
    rewards: string[];
    amountEur?: number;
  } | null>(null);

  useEffect(() => {
    if (!isRestoredSession) return;

    if (paymentReturn.isReturn) {
      clearPaymentAmountStorage();
      console.log("[ConfirmationPanel] redirect return — auto-confirming", {
        amount: paymentReturn.amount,
      });
      handleAutoConfirm(paymentReturn.amount);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (!params.has("orderId") && !paymentReturn.isReturn) {
      setInterruptedSession(true);
      const timer = setTimeout(() => setInterruptedSession(false), 10 * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, [isRestoredSession]);

  async function handleAutoConfirm(amount?: number) {
    setVerifying(true);
    setError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    try {
      const res = await fetch(`${apiUrl}/api/register/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: result.paymentToken,
          ...(amount != null ? { amount } : {}),
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
        }),
      });
      const data = await res.json();

      if (data.success && data.data?.confirmed) {
        setEffectivePayment({
          tierName: data.data.tierName,
          rewards: data.data.rewards ?? [],
          amountEur: data.data.amountEur,
        });
        setConfirmed(true);
        onPaymentConfirmed?.();
      } else {
        const firstErr = data.errors?.[0];
        setError(firstErr?.code ? t(`errors.${firstErr.code}`) || firstErr.message : firstErr?.message ?? t("register.confirmFailed"));
      }
    } catch {
      setError(t("register.confirmNetworkError"));
    } finally {
      setVerifying(false);
    }
  }

  async function handleManualConfirm() {
    setConfirming(true);
    setError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    try {
      const res = await fetch(`${apiUrl}/api/register/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: result.paymentToken,
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
        }),
      });
      const data = await res.json();

      if (data.success && data.data?.confirmed) {
        setEffectivePayment({
          tierName: data.data.tierName,
          rewards: data.data.rewards ?? [],
          amountEur: data.data.amountEur,
        });
        setConfirmed(true);
        onPaymentConfirmed?.();
      } else {
        const firstErr = data.errors?.[0];
        setError(firstErr?.code ? t(`errors.${firstErr.code}`) || firstErr.message : firstErr?.message ?? t("register.confirmFailed"));
      }
    } catch {
      setError(t("register.confirmNetworkError"));
    } finally {
      setConfirming(false);
    }
  }

  const isRunner = result.participationType === "runner";

  // Returning later (e.g. via the emailed link) to an already-paid
  // registration — no tier/reward details to show, just confirmation.
  if (result.status === "paid") {
    return (
      <section className={styles.panel}>
        <div className={styles.confirmedIcon} aria-hidden="true">
          ✓
        </div>
        <h2 className={styles.heading}>{t("register.alreadyPaidHeading")}</h2>
        <p className={styles.confirmedMessage}>
          {t("register.alreadyPaidMessage")}
        </p>
        <a href="/events/2026-run-for-ukraine" className={styles.startOverLink}>
          {t("register.alreadyPaidCta")}
        </a>
      </section>
    );
  }

  if (confirmed) {
    return (
      <section className={styles.panel}>
        <div className={styles.confirmedIcon} aria-hidden="true">
          ✓
        </div>
        <h2 className={styles.heading}>{t("register.confirmedHeading")}</h2>
        <p className={styles.participantId}>
          {t("register.confirmParticipantId", { id: result.participantId })}
        </p>

        <div className={styles.summary}>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{t("register.confirmTier")}</span>
            <span className={styles.rowValue}>
              {effectivePayment?.tierName ?? result.tierName}
            </span>
          </div>
          {effectivePayment?.amountEur != null && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>{t("register.confirmAmount")}</span>
              <span className={styles.rowValue}>€{effectivePayment.amountEur}</span>
            </div>
          )}
        </div>

        <div className={styles.rewards}>
          <h3 className={styles.rewardsHeading}>
            {t("register.confirmRewardsHeading")}
          </h3>
          <ul className={styles.rewardsList}>
            {(effectivePayment?.rewards ?? result.rewards).map((reward) => (
              <li key={reward} className={styles.reward}>
                <span className={styles.check}>✓</span> {reward}
              </li>
            ))}
          </ul>
        </div>

        <p className={styles.confirmedMessage}>
          {isRunner
            ? t("register.confirmedRunner")
            : t("register.confirmedSupporter")}
        </p>

        <div className={`${styles.widgetContainer} ${invoiceOpen ? "" : styles.widgetCollapsed}`}>
          {invoiceOpen && (
            <WhyDonateWidget shortcode={eventDetails.whydonateShortcode} />
          )}
        </div>
        <button
          type="button"
          className={styles.widgetExpandTrigger}
          onClick={() => setInvoiceOpen((open) => !open)}
        >
          {t("register.needInvoice")}
        </button>

        {onStartOver && (
          <button
            type="button"
            className={styles.startOverLink}
            onClick={onStartOver}
          >
            {t("register.startOver")}
          </button>
        )}
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <div className={styles.icon} aria-hidden="true">
        ✓
      </div>
      <h2 className={styles.heading}>{t("register.confirmHeading")}</h2>

      <p className={styles.participantId}>
        {t("register.confirmParticipantId", { id: result.participantId })}
      </p>

      <div className={styles.summary}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t("register.confirmName")}</span>
          <span className={styles.rowValue}>{result.fullName}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t("register.confirmTier")}</span>
          <span className={styles.rowValue}>{result.tierName}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t("register.confirmAmount")}</span>
          <span className={styles.rowValue}>€{result.amountEur}</span>
        </div>
      </div>

      <div className={styles.rewards}>
        <h3 className={styles.rewardsHeading}>
          {t("register.confirmRewardsHeading")}
        </h3>
        <ul className={styles.rewardsList}>
          {result.rewards.map((reward) => (
            <li key={reward} className={styles.reward}>
              <span className={styles.check}>✓</span> {reward}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.donationSection}>
        <h3 className={styles.donationHeading}>
          {t("register.confirmDonationHeading", {
            amount: String(result.amountEur),
          })}
        </h3>
        <p className={styles.donationInstructions}>
          {t("register.confirmDonationInstructions", {
            amount: String(result.amountEur),
            tierName: result.tierName,
          })}
        </p>

        {interruptedSession && (
          <div className={styles.interruptedNotice}>
            <p>
              {t("register.interruptedSession")}
            </p>
            {onStartOver && (
              <button
                type="button"
                className={styles.startOverLink}
                onClick={onStartOver}
              >
                {t("register.startOver")}
              </button>
            )}
          </div>
        )}

        <div className={styles.widgetContainer} style={{ position: "relative" }}>
          <WhyDonateWidget
            shortcode={eventDetails.whydonateShortcode}
            donationStorageKeys={{ amount: AMOUNT_STORAGE_KEY }}
            minTierAmount={result.amountEur}
            minTierName={result.tierName}
            onPaymentSuccess={(amount) => {
              try {
                sessionStorage.setItem(AMOUNT_STORAGE_KEY, String(amount));
              } catch { /* unavailable */ }
              handleAutoConfirm(amount).finally(clearPaymentAmountStorage);
            }}
            onDetectionFailed={() => setDetectionActive(false)}
            donorInfo={{ firstName: result.firstName, lastName: result.lastName, email: result.email }}
          />
          {verifying && (
            <div className={styles.verifyingOverlay}>
              <div className={styles.verifyingSpinner} />
              <p className={styles.verifyingText}>
                {t("register.verifyingPayment")}
              </p>
              {error && <p className={styles.confirmError}>{error}</p>}
            </div>
          )}
        </div>

        {!detectionActive && (
          <div className={styles.confirmSection}>
            <p className={styles.confirmLabel}>
              {t("register.confirmAfterDonation")}
            </p>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleManualConfirm}
              disabled={confirming}
            >
              {confirming
                ? t("register.confirmingPayment")
                : t("register.confirmButton")}
            </button>
            {error && <p className={styles.confirmError}>{error}</p>}
          </div>
        )}

        {onStartOver && (
          <button
            type="button"
            className={styles.startOverLink}
            onClick={onStartOver}
          >
            {t("register.abandonRegistration")}
          </button>
        )}
      </div>
    </section>
  );
}
