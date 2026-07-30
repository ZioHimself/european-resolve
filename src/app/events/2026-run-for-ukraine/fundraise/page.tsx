"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FundraiseForm } from "@/components/ui/FundraiseForm";
import { useEventStatus } from "@/hooks/useEventStatus";
import { useLocale } from "@/components/ui/LocaleProvider";
import { t } from "@/locales";
import styles from "./page.module.css";

export default function FundraisePage() {
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
          { label: t("nav.fundraise") },
        ]}
      />

      <div className={styles.content}>
        {isCompleted ? (
          <div className={styles.closedBanner}>
            <span className={styles.closedIcon} aria-hidden="true">
              ℹ️
            </span>
            <h1 className={styles.closedHeading}>
              {t("closed.fundraiseClosed")}
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
                {t("fundraise.overline")}
              </span>
              <h1 className={styles.title}>{t("fundraise.title")}</h1>
              <p className={styles.subtitle}>{t("fundraise.subtitle")}</p>
            </div>

            <FundraiseForm />
          </>
        )}
      </div>
    </>
  );
}
