import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CoOrganiserBar } from "@/components/ui/CoOrganiserBar";
import { EventHero } from "@/components/ui/EventHero";
import { ProgressSection } from "@/components/ui/ProgressSection";
import { TrackCards } from "@/components/ui/TrackCards";
import { eventDetails } from "@/data/event";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Run for Ukraine 2026 — European Resolve",
  description:
    "Join the charity run in Brussels on 23 August 2026. Register, fundraise, and help provide charging stations for Ukraine's defenders.",
};

export default function RunForUkrainePage() {
  return (
    <>
      <CoOrganiserBar />
      <Breadcrumbs
        items={[
          { label: "Events", href: "/events" },
          { label: "Run for Ukraine 2026" },
        ]}
      />
      <EventHero />
      <div className={styles.sections}>
        <ProgressSection />
        <TrackCards />
      </div>
    </>
  );
}
