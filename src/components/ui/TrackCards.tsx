import { t } from "@/locales";
import styles from "./TrackCards.module.css";

export function TrackCards() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{t("tracks.heading")}</h2>
      <p className={styles.subtitle}>{t("tracks.subtitle")}</p>

      <div className={styles.grid}>
        <article className={styles.card}>
          <span className={styles.overline}>{t("tracks.trackAOverline")}</span>
          <h3 className={styles.cardTitle}>{t("tracks.trackATitle")}</h3>
          <p className={styles.cardDescription}>
            {t("tracks.trackADescription")}
          </p>
          <p className={styles.features}>{t("tracks.trackAFeatures")}</p>
          <a href="/events/2026-run-for-ukraine/register" className={styles.cta}>
            {t("tracks.trackACta")}
          </a>
        </article>

        <article className={styles.card}>
          <span className={styles.overline}>{t("tracks.trackBOverline")}</span>
          <h3 className={styles.cardTitle}>{t("tracks.trackBTitle")}</h3>
          <p className={styles.cardDescription}>
            {t("tracks.trackBDescription")}
          </p>
          <p className={styles.features}>{t("tracks.trackBFeatures")}</p>
          <a href="/events/2026-run-for-ukraine/fundraise" className={styles.cta}>
            {t("tracks.trackBCta")}
          </a>
        </article>
      </div>
    </section>
  );
}
