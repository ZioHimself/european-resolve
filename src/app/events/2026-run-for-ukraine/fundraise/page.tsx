"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useLocale } from "@/components/ui/LocaleProvider";
import { t } from "@/locales";
import styles from "./page.module.css";

export default function FundraisePage() {
  useLocale();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: t("nav.events"), href: "/events" },
          {
            label: t("hero.title"),
            href: "/events/2026-run-for-ukraine",
          },
          { label: t("nav.fundraise") },
        ]}
      />

      <div className={styles.content}>
        <div className={styles.closedBanner}>
          <span className={styles.closedIcon} aria-hidden="true">
            ℹ️
          </span>
          <h1 className={styles.closedHeading}>
            {t("closed.fundraiseClosed")}
          </h1>
          <p className={styles.closedText}>{t("closed.eventCompleted")}</p>
          <a
            href="/events/2026-run-for-ukraine"
            className={styles.closedLink}
          >
            {t("closed.seeResults")}
          </a>
        </div>
      </div>
    </>
  );
}
