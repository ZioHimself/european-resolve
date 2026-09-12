import { t } from "@/locales";
import { eventDetails } from "@/data/event";
import styles from "./AccountabilityReport.module.css";

const DEPLOYMENT_BULLET_KEYS = [
  "closed.deploymentUpdateBullet1",
  "closed.deploymentUpdateBullet2",
  "closed.deploymentUpdateBullet3",
  "closed.deploymentUpdateBullet4",
  "closed.deploymentUpdateBullet5",
] as const;

export function AccountabilityReport() {
  const { finalStats } = eventDetails.postEvent;

  return (
    <section className={styles.section}>
      <dl className={styles.stats}>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>{t("closed.totalRaised")}</dt>
          <dd className={styles.statValue}>
            €{finalStats.raised.toLocaleString("en-GB")}
          </dd>
        </div>
        {finalStats.chargingStations > 0 && (
          <div className={styles.statCard}>
            <dt className={styles.statLabel}>{t("closed.chargingStations")}</dt>
            <dd className={styles.statValue}>{finalStats.chargingStations}</dd>
          </div>
        )}
      </dl>

      <p className={styles.impact}>{t("closed.impactStatement")}</p>

      <div className={styles.deploymentUpdate}>
        <h2 className={styles.deploymentHeading}>
          {t("closed.deploymentUpdateHeading")}
        </h2>
        <p className={styles.deploymentLead}>
          {t("closed.deploymentUpdateLead")}
        </p>
        <ul className={styles.deploymentList}>
          {DEPLOYMENT_BULLET_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </div>

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
