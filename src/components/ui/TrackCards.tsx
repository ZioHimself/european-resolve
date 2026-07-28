import styles from "./TrackCards.module.css";

export function TrackCards() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Choose how you take part</h2>
      <p className={styles.subtitle}>
        Two tracks, one goal. Pick what suits you&nbsp;best.
      </p>

      <div className={styles.grid}>
        <article className={styles.card}>
          <span className={styles.overline}>Track A</span>
          <h3 className={styles.cardTitle}>Run or Donate</h3>
          <p className={styles.cardDescription}>
            Register at one of three tiers. Your fee covers the race pack and
            directly funds charging stations for defenders — no fundraising
            required.
          </p>
          <p className={styles.features}>Race bib · Finisher medal · T-shirt</p>
          <a href="/events/2026-run-for-ukraine/register" className={styles.cta}>
            See tiers →
          </a>
        </article>

        <article className={styles.card}>
          <span className={styles.overline}>Track B</span>
          <h3 className={styles.cardTitle}>Raise Funds and Run</h3>
          <p className={styles.cardDescription}>
            Get a personal fundraising page. Share it with your network. Every
            donation counts toward your tier and the collective goal.
          </p>
          <p className={styles.features}>
            Personal page · Shareable link · Live stats
          </p>
          <a href="/events/2026-run-for-ukraine/fundraise" className={styles.cta}>
            Create my page →
          </a>
        </article>
      </div>
    </section>
  );
}
