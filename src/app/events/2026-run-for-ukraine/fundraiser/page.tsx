"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FundraiserPage } from "@/components/ui/FundraiserPage";
import { useLocale } from "@/components/ui/LocaleProvider";
import { t } from "@/locales";

export default function FundraiserRoute() {
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
          { label: t("nav.fundraiser") },
        ]}
      />
      <FundraiserPage />
    </>
  );
}
