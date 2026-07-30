import { coOrganisers } from "@/data/event";
import { t } from "@/locales";
import styles from "./CoOrganiserBar.module.css";

export function CoOrganiserBar() {
  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <span className={styles.label}>{t("event.coOrganisers")}</span>
        <ul className={styles.list}>
          {coOrganisers.map((org) => (
            <li key={org.abbreviation} className={styles.org}>
              <span className={styles.abbreviation}>{org.abbreviation}</span>
              <span className={styles.name}>{org.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
