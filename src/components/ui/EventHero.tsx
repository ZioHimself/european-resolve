import { eventDetails } from "@/data/event";
import { t } from "@/locales";
import { UaStripe } from "@/components/ui/UaStripe";
import styles from "./EventHero.module.css";

interface EventHeroProps {
  isCompleted?: boolean;
}

export function EventHero({ isCompleted = false }: EventHeroProps) {
  return (
    <section className={`${styles.hero} ${isCompleted ? styles.heroCompleted : ""}`}>
      <UaStripe />
      <span className={styles.overline}>
        {isCompleted ? t("closed.eventCompleted") : t("hero.overline")}
      </span>
      <h1 className={styles.title}>{t("hero.title")}</h1>
      <p className={styles.meta}>
        {eventDetails.date} · {eventDetails.location}
      </p>
      {isCompleted ? (
        <p className={styles.thankYou}>{eventDetails.postEvent.thankYouMessage}</p>
      ) : (
        <>
          <p className={styles.description}>{t("hero.description")}</p>
          <p className={styles.beneficiary}>
            {t("hero.beneficiary")}{" "}
            <a
              href={eventDetails.beneficiary.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.beneficiaryLink}
            >
              {eventDetails.beneficiary.name} –{" "}
              {eventDetails.beneficiary.mission} ↗
            </a>
          </p>
        </>
      )}
    </section>
  );
}
