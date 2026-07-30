"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RegisterClient } from "@/components/ui/RegisterClient";
import { useEventStatus } from "@/hooks/useEventStatus";
import { useLocale } from "@/components/ui/LocaleProvider";
import { t } from "@/locales";
import styles from "./page.module.css";

export default function RegisterPage() {
  useLocale();
  const isCompleted = useEventStatus() === "completed";

  return (
    <>
      <Breadcrumbs
        items={[
          { label: t("nav.events"), href: "/events" },
          {
            label: "Run for Ukraine 2026",
            href: "/events/2026-run-for-ukraine",
          },
          { label: t("nav.register") },
        ]}
      />

      <div className={styles.content}>
        {isCompleted ? (
          <div className={styles.closedBanner}>
            <span className={styles.closedIcon} aria-hidden="true">
              ℹ️
            </span>
            <h1 className={styles.closedHeading}>
              {t("closed.registrationClosed")}
            </h1>
            <p className={styles.closedText}>
              {t("closed.eventCompleted")}
            </p>
            <a
              href="/events/2026-run-for-ukraine"
              className={styles.closedLink}
            >
              {t("closed.seeResults")}
            </a>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <span className={styles.overline}>
                {t("register.overline")}
              </span>
              <h1 className={styles.title}>{t("register.title")}</h1>
              <p className={styles.subtitle}>{t("register.subtitle")}</p>
            </div>

            <div className={styles.sections}>
              <RegisterClient />
            </div>
          </>
        )}
      </div>
    </>
  );
}
