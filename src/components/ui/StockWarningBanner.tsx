import { t } from "@/locales";
import styles from "./StockWarningBanner.module.css";

export function StockWarningBanner() {
  return (
    <div className={styles.banner} role="alert">
      <span className={styles.icon} aria-hidden="true">
        ⚠️
      </span>
      <div className={styles.content}>
        <strong className={styles.heading}>
          {t("register.stockWarningHeading")}
        </strong>
        <p className={styles.text}>
          {t("register.stockWarningBody")}{" "}
          <a
            href="mailto:info@european-resolve.org"
            className={styles.link}
          >
            info@european-resolve.org
          </a>
          .
        </p>
      </div>
    </div>
  );
}
