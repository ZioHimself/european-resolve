import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <p className={styles.legal}>
            © {new Date().getFullYear()} European Resolve VZW
          </p>
          <a
            href="mailto:info@european-resolve.org"
            className={styles.contactEmail}
          >
            info@european-resolve.org
          </a>
        </div>
        <div className={styles.right}>
          <nav className={styles.links} aria-label="Footer navigation">
            <Link href="/privacy">Privacy Policy</Link>
            <a
              href="mailto:it@european-resolve.org"
              className={styles.privacyEmail}
            >
              it@european-resolve.org
            </a>
          </nav>
          <p className={styles.notice}>
            We don&apos;t use cookies or collect personal data.
          </p>
        </div>
      </div>
    </footer>
  );
}
