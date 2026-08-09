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
          <details className={styles.details}>
            <summary className={styles.readMore}>{t("hero.readMore")}</summary>
            <div className={styles.expanded}>
              <section className={styles.subsection}>
                <h2 className={styles.subheading}>{t("hero.whyHeading")}</h2>
                <p>{t("hero.whyBody")}</p>
              </section>

              <section className={styles.subsection}>
                <h2 className={styles.subheading}>{t("hero.scheduleHeading")}</h2>
                <p>{t("hero.scheduleIntro")}</p>
                <ul className={styles.scheduleList}>
                  <li>{t("hero.scheduleGathering")}</li>
                  <li>{t("hero.scheduleFlag")}</li>
                  <li>{t("hero.scheduleRun")}</li>
                  <li>{t("hero.scheduleAfter")}</li>
                </ul>
                <p>{t("hero.scheduleOrganisers")}</p>
              </section>

              <section className={styles.subsection}>
                <h2 className={styles.subheading}>{t("hero.participateHeading")}</h2>
                <p>{t("hero.participateBody")}</p>
              </section>

              <section className={styles.subsection}>
                <h2 className={styles.subheading}>{t("hero.updatesHeading")}</h2>
                <p>
                  {t("hero.updatesPublished")}{" "}
                  <a
                    href={eventDetails.facebookEventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.beneficiaryLink}
                  >
                    {t("hero.facebookEventLink")} ↗
                  </a>
                  . {t("hero.updatesContact")}{" "}
                  <a
                    href={eventDetails.facebookEventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.beneficiaryLink}
                  >
                    {t("hero.facebookEventLink")} ↗
                  </a>
                  .
                </p>
              </section>

              <section className={styles.subsection}>
                <h2 className={styles.subheading}>{t("hero.notesHeading")}</h2>
                <p>{t("hero.notesBody")}</p>
              </section>

              <p className={styles.closing}>{t("hero.closing")}</p>
            </div>
          </details>
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
