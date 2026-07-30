import { t } from "@/locales";
import { eventDetails } from "@/data/event";
import styles from "./AccountabilityReport.module.css";

export function AccountabilityReport() {
  const { finalStats, impactStatement } = eventDetails.postEvent;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{t("closed.accountabilityHeading")}</h2>

      <dl className={styles.stats}>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>{t("closed.totalRaised")}</dt>
          <dd className={styles.statValue}>
            €{finalStats.raised.toLocaleString("en-GB")}
          </dd>
        </div>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>{t("closed.chargingStations")}</dt>
          <dd className={styles.statValue}>{finalStats.chargingStations}</dd>
        </div>
      </dl>

      <p className={styles.impact}>{impactStatement}</p>

      <p className={styles.beneficiary}>
        {t("hero.beneficiary")}{" "}
        <a
          href={eventDetails.beneficiary.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.beneficiaryLink}
        >
          {eventDetails.beneficiary.name} – {eventDetails.beneficiary.mission} ↗
        </a>
      </p>
    </section>
  );
}
