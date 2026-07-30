"use client";

import { useState } from "react";
import type { RegisterResponse } from "./registerTypes";
import { WhyDonateWidget } from "./WhyDonateWidget";
import styles from "./ConfirmationPanel.module.css";

interface ConfirmationPanelProps {
  result: RegisterResponse;
}

export function ConfirmationPanel({ result }: ConfirmationPanelProps) {
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
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
      } else {
        setError(data.errors?.[0]?.message ?? "Confirmation failed");
      }
    } catch {
      setError("Could not confirm payment. Please try again.");
    } finally {
      setConfirming(false);
    }
  }

  const isRunner = result.participationType === "runner";

  if (confirmed) {
    return (
      <section className={styles.panel}>
        <div className={styles.confirmedIcon} aria-hidden="true">
          ✓
        </div>
        <h2 className={styles.heading}>Payment received — thank you!</h2>
        <p className={styles.participantId}>Your ID: {result.participantId}</p>
        <p className={styles.confirmedMessage}>
          {isRunner
            ? "Your registration is now complete. You'll receive your race materials at the event."
            : "Thank you for supporting from afar! You'll receive a digital certificate by email."}
        </p>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <div className={styles.icon} aria-hidden="true">
        ✓
      </div>
      <h2 className={styles.heading}>Registration confirmed!</h2>

      <p className={styles.participantId}>Your ID: {result.participantId}</p>

      <div className={styles.summary}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Name</span>
          <span className={styles.rowValue}>{result.fullName}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Tier</span>
          <span className={styles.rowValue}>{result.tierName}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Amount</span>
          <span className={styles.rowValue}>€{result.amountEur}</span>
        </div>
      </div>

      <div className={styles.rewards}>
        <h3 className={styles.rewardsHeading}>Your rewards</h3>
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
          Complete your €{result.amountEur} donation
        </h3>
        <p className={styles.donationInstructions}>
          Please select the <strong>€{result.amountEur}</strong> option below to
          complete your {result.tierName} registration.
        </p>

        <div className={styles.widgetContainer}>
          <WhyDonateWidget shortcode="nudW7" />
        </div>

        <div className={styles.confirmSection}>
          <p className={styles.confirmLabel}>
            After completing your donation above:
          </p>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={confirming}
          >
            {confirming ? "Confirming…" : "I\u2019ve completed my donation"}
          </button>
          {error && <p className={styles.confirmError}>{error}</p>}
        </div>
      </div>
    </section>
  );
}
