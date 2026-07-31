"use client";

import { useState, useEffect } from "react";
import { t } from "@/locales";
import { eventDetails } from "@/data/event";
import type { RegisterResponse } from "./registerTypes";
import { WhyDonateWidget } from "./WhyDonateWidget";
import styles from "./ConfirmationPanel.module.css";

interface ConfirmationPanelProps {
  result: RegisterResponse;
  onPaymentConfirmed?: () => void;
}

export function ConfirmationPanel({ result, onPaymentConfirmed }: ConfirmationPanelProps) {
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectionActive, setDetectionActive] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [effectiveTierName, setEffectiveTierName] = useState<string | null>(null);
  const [effectiveRewards, setEffectiveRewards] = useState<string[] | null>(null);
  const [interruptedSession, setInterruptedSession] = useState(false);

  useEffect(() => {
    const hasRegistration = sessionStorage.getItem("r4u:registration");
    const hasOrderId = new URLSearchParams(window.location.search).has("orderId");
    if (hasRegistration && !hasOrderId) {
      setInterruptedSession(true);
      const timer = setTimeout(() => setInterruptedSession(false), 10 * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  async function handleAutoConfirm(amount: number) {
    setVerifying(true);
    setError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    try {
      const res = await fetch(`${apiUrl}/api/register/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: result.paymentToken, amount }),
      });
      const data = await res.json();

      if (data.success && data.data?.confirmed) {
        setConfirmed(true);
        setEffectiveTierName(data.data.effectiveTierName ?? null);
        setEffectiveRewards(data.data.rewards ?? null);
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
        body: JSON.stringify({ token: result.paymentToken }),
      });
      const data = await res.json();

      if (data.success && data.data?.confirmed) {
        setConfirmed(true);
        setEffectiveTierName(data.data.effectiveTierName ?? null);
        setEffectiveRewards(data.data.rewards ?? null);
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
  const displayRewards = effectiveRewards ?? result.rewards;
  const displayTierName = effectiveTierName ?? result.tierName;

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
            <span className={styles.rowValue}>{displayTierName}</span>
          </div>
        </div>

        <div className={styles.rewards}>
          <h3 className={styles.rewardsHeading}>
            {t("register.confirmRewardsHeading")}
          </h3>
          <ul className={styles.rewardsList}>
            {displayRewards.map((reward) => (
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

        <div className={`${styles.widgetContainer} ${styles.widgetCollapsed}`}>
          <WhyDonateWidget shortcode={eventDetails.whydonateShortcode} />
        </div>
        <button
          type="button"
          className={styles.widgetExpandTrigger}
          onClick={(e) => {
            const container = (e.currentTarget as HTMLElement).previousElementSibling as HTMLElement;
            container?.classList.toggle(styles.widgetCollapsed);
          }}
        >
          {t("register.needInvoice") || "Need your invoice?"}
        </button>
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
              {t("register.interruptedSession") ||
                "It looks like your session was interrupted. If you\u2019ve already completed your payment, please contact us at info@european-resolve.org with your payment confirmation and we\u2019ll update your registration."}
            </p>
          </div>
        )}

        <div className={styles.widgetContainer} style={{ position: "relative" }}>
          <WhyDonateWidget
            shortcode={eventDetails.whydonateShortcode}
            onPaymentSuccess={handleAutoConfirm}
            onDetectionFailed={() => setDetectionActive(false)}
            donorInfo={{ fullName: result.fullName, email: result.email }}
          />
          {verifying && (
            <div className={styles.verifyingOverlay}>
              <div className={styles.verifyingSpinner} />
              <p className={styles.verifyingText}>
                {t("register.verifyingPayment") || "Verifying payment..."}
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
      </div>
    </section>
  );
}
