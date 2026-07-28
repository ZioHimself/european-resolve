import styles from "./TrackCards.module.css";

export function TrackCards() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Choose your track</h2>
      <p className={styles.subtitle}>
        Two ways to support, one goal. Pick one&nbsp;track.
      </p>

      <div className={styles.grid}>
        <article className={styles.card}>
          <span className={styles.overline}>Track A</span>
          <h3 className={styles.cardTitle}>Donate or Run</h3>
          <p className={styles.cardDescription}>
            Pick a tier and contribute directly — run on the day or simply
            support from anywhere. Your fee funds charging stations for
            defenders.
          </p>
          <p className={styles.features}>Race bib · Finisher medal · T-shirt</p>
          <a href="/events/2026-run-for-ukraine/register" className={styles.cta}>
            See tiers →
          </a>
        </article>

        <article className={styles.card}>
          <span className={styles.overline}>Track B</span>
          <h3 className={styles.cardTitle}>Fundraise and Run</h3>
          <p className={styles.cardDescription}>
            Create a personal fundraising page and rally your network. Every
            donation counts toward the collective goal — then show up and run.
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
