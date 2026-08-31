import { eventDetails } from "@/data/event";
import { t } from "@/locales";
import { UaStripe } from "@/components/ui/UaStripe";
import styles from "./EventHero.module.css";

export function EventHero() {
  return (
    <section className={`${styles.hero} ${styles.heroCompleted}`}>
      <UaStripe />
      <span className={styles.overline}>{t("closed.eventCompleted")}</span>
      <h1 className={styles.title}>{t("hero.title")}</h1>
      <p className={styles.meta}>
        {eventDetails.date} · {eventDetails.location}
      </p>
      <p className={styles.thankYou}>{eventDetails.postEvent.thankYouMessage}</p>
    </section>
  );
}
