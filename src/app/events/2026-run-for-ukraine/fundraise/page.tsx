import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FundraiseForm } from "@/components/ui/FundraiseForm";
import { getEventStatus } from "@/hooks/useEventStatus";
import { t } from "@/locales";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Fundraise — Run for Ukraine 2026",
  description:
    "Create your personal fundraising page for the Run for Ukraine 2026 charity run in Brussels. Help fund charging stations for defenders.",
};

export default function FundraisePage() {
  const isCompleted = getEventStatus() === "completed";

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Events", href: "/events" },
          {
            label: "Run for Ukraine 2026",
            href: "/events/2026-run-for-ukraine",
          },
          { label: "Fundraise" },
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
