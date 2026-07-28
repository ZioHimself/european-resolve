import type { RegisterResponse } from "./registerTypes";
import styles from "./ConfirmationPanel.module.css";

interface ConfirmationPanelProps {
  result: RegisterResponse;
}

export function ConfirmationPanel({ result }: ConfirmationPanelProps) {
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

      {result.monobankJarUrl && (
        <div className={styles.ctaSection}>
          <a
            href={result.monobankJarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaButton}
          >
            Proceed to donate — Monobank
          </a>
          <p className={styles.visaNotice}>
            Monobank jar accepts Visa and Mastercard only. Bancontact and bank
            transfers are not supported.
          </p>
        </div>
      )}
    </section>
  );
}
