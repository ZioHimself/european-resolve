"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RegisterClient } from "@/components/ui/RegisterClient";
import type { RegisterStep } from "@/components/ui/RegisterClient";
import { StockWarningBanner } from "@/components/ui/StockWarningBanner";
import { useEventStatus } from "@/hooks/useEventStatus";
import { useLocale } from "@/components/ui/LocaleProvider";
import { t } from "@/locales";
import styles from "./page.module.css";

const TITLE_KEY: Record<RegisterStep, "register.title" | "register.titleRegistration" | "register.titleConfirmation"> = {
  "pick-tier": "register.title",
  registration: "register.titleRegistration",
  confirmation: "register.titleConfirmation",
};

export default function RegisterPage() {
  useLocale();
  const searchParams = useSearchParams();
  const hasToken = Boolean(searchParams.get("token"));
  const isCompleted = useEventStatus() === "completed";
  const showClosedBanner = isCompleted && !hasToken;
  const [step, setStep] = useState<RegisterStep>("pick-tier");

  return (
    <>
      <Breadcrumbs
        items={[
          { label: t("nav.events"), href: "/events" },
          {
            label: t("hero.title"),
            href: "/events/2026-run-for-ukraine",
          },
          { label: t("nav.register") },
        ]}
      />

      <div className={styles.content}>
        {showClosedBanner ? (
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
              <h1 className={styles.title}>{t(TITLE_KEY[step])}</h1>
              <p className={styles.subtitle}>{t("register.subtitle")}</p>
            </div>

            <StockWarningBanner />

            <div className={styles.sections}>
              <RegisterClient onStepChange={setStep} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
