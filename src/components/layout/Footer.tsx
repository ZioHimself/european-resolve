import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.legal}>
          © {new Date().getFullYear()} European Resolve VZW
        </p>
        <div className={styles.right}>
          <nav className={styles.links} aria-label="Footer navigation">
            <Link href="/privacy">Privacy Policy</Link>
          </nav>
          <p className={styles.notice}>
            We don&apos;t use cookies or collect personal data.
          </p>
        </div>
      </div>
    </footer>
  );
}
