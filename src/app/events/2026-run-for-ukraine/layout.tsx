import type { Metadata } from "next";
import { LocaleProvider } from "@/components/ui/LocaleProvider";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Run for Ukraine 2026 — European Resolve",
  description:
    "Join the charity run in Brussels on 23 August 2026. Register, fundraise, and help provide charging stations for Ukraine's defenders.",
};

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.eventRoot}>
      <LocaleProvider>
        <div className={styles.langBar}>
          <LanguageSwitcher />
        </div>
        {children}
      </LocaleProvider>
    </div>
  );
}
