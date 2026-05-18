import Link from "next/link";
import { ObfuscatedEmail } from "@/components/ui/ObfuscatedEmail";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <p className={styles.legal}>
            © {new Date().getFullYear()} European Resolve VZW
          </p>
          <ObfuscatedEmail
            email="info@european-resolve.org"
            className={styles.contactEmail}
          />
        </div>
        <div className={styles.right}>
          <nav className={styles.links} aria-label="Footer navigation">
            <Link href="/privacy">Privacy Policy</Link>
            <ObfuscatedEmail
              email="it@european-resolve.org"
              className={styles.privacyEmail}
            />
          </nav>
          <p className={styles.notice}>
            We don&apos;t use cookies or collect personal data.
          </p>
        </div>
      </div>
    </footer>
  );
}
