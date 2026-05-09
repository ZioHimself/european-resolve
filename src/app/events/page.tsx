import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Events — European Resolve",
  description: "Events organised and attended by European Resolve",
};

export default function EventsPage() {
  return (
    <section className={styles.events}>
      <h1>Events</h1>
      <p>We show up where it matters. Listings coming soon.</p>
    </section>
  );
}
