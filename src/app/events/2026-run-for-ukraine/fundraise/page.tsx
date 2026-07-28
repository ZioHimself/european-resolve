import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FundraiseForm } from "@/components/ui/FundraiseForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Fundraise — Run for Ukraine 2026",
  description:
    "Create your personal fundraising page for the Run for Ukraine 2026 charity run in Brussels. Help fund charging stations for defenders.",
};

export default function FundraisePage() {
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
        <div className={styles.header}>
          <span className={styles.overline}>Track B · Fundraise and Run</span>
          <h1 className={styles.title}>Your fundraising page</h1>
          <p className={styles.subtitle}>
            Takes about a minute. Share your page with friends and family to help
            reach the collective goal — then show up and run.
          </p>
        </div>

        <FundraiseForm />
      </div>
    </>
  );
}
