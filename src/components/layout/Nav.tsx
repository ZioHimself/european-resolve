import Link from "next/link";
import styles from "./Nav.module.css";

export function Nav() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/" className={styles.wordmark}>
          European Resolve
        </Link>
        <div className={styles.links}>
          <Link href="/#team">Team</Link>
          <Link href="/events">Events</Link>
        </div>
      </nav>
    </header>
  );
}
