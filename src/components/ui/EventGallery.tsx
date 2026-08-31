import { eventDetails } from "@/data/event";
import { t } from "@/locales";
import styles from "./EventGallery.module.css";

export function EventGallery() {
  const driveUrl = eventDetails.postEvent.galleryDriveUrl;
  if (!driveUrl) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{t("closed.galleryHeading")}</h2>
      <p className={styles.lead}>{t("closed.galleryLead")}</p>
      <a
        href={driveUrl}
        className={styles.driveLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("closed.viewGalleryOnDrive")}
      </a>
    </section>
  );
}
