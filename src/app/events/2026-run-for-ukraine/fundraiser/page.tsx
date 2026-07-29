import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FundraiserPage } from "@/components/ui/FundraiserPage";

export const metadata: Metadata = {
  title: "Fundraiser — Run for Ukraine 2026",
  description:
    "Support a fundraiser for the Run for Ukraine 2026 charity run. All donations go to charging stations for Ukraine's defenders.",
};

export default function FundraiserRoute() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Events", href: "/events" },
          {
            label: "Run for Ukraine 2026",
            href: "/events/2026-run-for-ukraine",
          },
          { label: "Fundraiser" },
        ]}
      />
      <FundraiserPage />
    </>
  );
}
