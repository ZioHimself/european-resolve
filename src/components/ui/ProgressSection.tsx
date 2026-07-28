import { eventDetails } from "@/data/event";
import styles from "./ProgressSection.module.css";

export function ProgressSection() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.overline}>Live progress</span>
        <span className={styles.indicator}>Updated live</span>
      </div>

      <dl className={styles.stats}>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>Raised</dt>
          <dd className={styles.statValue}>&mdash;</dd>
        </div>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>Goal</dt>
          <dd className={styles.statValue}>0%</dd>
        </div>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>Participants</dt>
          <dd className={styles.statValue}>0</dd>
        </div>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>Donors</dt>
          <dd className={styles.statValue}>0</dd>
        </div>
      </dl>

      <div className={styles.barContainer}>
        <div
          className={styles.bar}
          role="progressbar"
          aria-valuenow={0}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={styles.barFill} style={{ width: "0%" }} />
        </div>
        <div className={styles.barLabels}>
          <span className={styles.barLeft}>
            €0 raised · Goal €{eventDetails.goalEur.toLocaleString("en-GB")}
          </span>
          <span className={styles.barRight}>0%</span>
        </div>
      </div>
    </section>
  );
}
