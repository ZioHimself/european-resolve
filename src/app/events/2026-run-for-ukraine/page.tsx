"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CoOrganiserBar } from "@/components/ui/CoOrganiserBar";
import { EventHero } from "@/components/ui/EventHero";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ProgressSection } from "@/components/ui/ProgressSection";
import { TrackCards } from "@/components/ui/TrackCards";
import { EventGallery } from "@/components/ui/EventGallery";
import { AccountabilityReport } from "@/components/ui/AccountabilityReport";
import { useEventStatus } from "@/hooks/useEventStatus";
import { useLocale } from "@/components/ui/LocaleProvider";
import { t } from "@/locales";
import styles from "./page.module.css";

export default function RunForUkrainePage() {
  useLocale();
  const isCompleted = useEventStatus() === "completed";

  return (
    <>
      <CoOrganiserBar actions={<LanguageSwitcher />} />
      <Breadcrumbs
        items={[
          { label: t("nav.events"), href: "/events" },
          { label: "Run for Ukraine 2026" },
        ]}
      />
      <EventHero isCompleted={isCompleted} />
      <div className={styles.sections}>
        <ProgressSection />
        {isCompleted ? (
          <>
            <EventGallery />
            <AccountabilityReport />
          </>
        ) : (
          <TrackCards />
        )}
      </div>
    </>
  );
}
