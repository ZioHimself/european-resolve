import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { TierGrid } from "@/components/ui/TierGrid";
import { RegistrationForm } from "@/components/ui/RegistrationForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Register — Run for Ukraine 2026",
  description:
    "Choose your tier and register for the Run for Ukraine 2026 charity run in Brussels. Every fee helps fund charging stations for defenders.",
};

export default function RegisterPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Events", href: "/events" },
          {
            label: "Run for Ukraine 2026",
            href: "/events/2026-run-for-ukraine",
          },
          { label: "Register" },
        ]}
      />

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.overline}>Track A · Donate or Run</span>
          <h1 className={styles.title}>Pick a tier</h1>
          <p className={styles.subtitle}>
            Every tier directly funds charging stations for Ukraine&apos;s
            defenders. Run on the day or simply support from anywhere.
          </p>
        </div>

        <div className={styles.sections}>
          <TierGrid />
          <RegistrationForm />
        </div>
      </div>
    </>
  );
}
