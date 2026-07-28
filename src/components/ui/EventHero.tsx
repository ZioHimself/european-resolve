import { eventDetails } from "@/data/event";
import { UaStripe } from "@/components/ui/UaStripe";
import styles from "./EventHero.module.css";

export function EventHero() {
  return (
    <section className={styles.hero}>
      <UaStripe />
      <span className={styles.overline}>Charity run · Brussels</span>
      <h1 className={styles.title}>{eventDetails.title}</h1>
      <p className={styles.meta}>
        {eventDetails.date} · {eventDetails.location}
      </p>
      <p className={styles.description}>{eventDetails.description}</p>
      <p className={styles.beneficiary}>
        Beneficiary:{" "}
        <a
          href={eventDetails.beneficiary.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.beneficiaryLink}
        >
          {eventDetails.beneficiary.name} – {eventDetails.beneficiary.mission}{" "}
          ↗
        </a>
      </p>
    </section>
  );
}
