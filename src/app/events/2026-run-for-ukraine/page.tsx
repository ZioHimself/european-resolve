"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CoOrganiserBar } from "@/components/ui/CoOrganiserBar";
import { EventHero } from "@/components/ui/EventHero";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ProgressSection } from "@/components/ui/ProgressSection";
import { EventGallery } from "@/components/ui/EventGallery";
import { AccountabilityReport } from "@/components/ui/AccountabilityReport";
import { useLocale } from "@/components/ui/LocaleProvider";
import { t } from "@/locales";
import styles from "./page.module.css";

export default function RunForUkrainePage() {
  useLocale();

  return (
    <>
      <CoOrganiserBar actions={<LanguageSwitcher />} />
      <Breadcrumbs
        items={[
          { label: t("nav.events"), href: "/events" },
          { label: t("hero.title") },
        ]}
      />
      <EventHero />
      <div className={styles.sections}>
        <ProgressSection />
        <EventGallery />
        <AccountabilityReport />
      </div>
    </>
  );
}
