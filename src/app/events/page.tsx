import type { Metadata } from "next";
import { parseEvents } from "@/lib/events";
import { fetchRawEvents, processEventThumbnails } from "@/lib/events-server";
import { EventTimeline } from "@/components/ui/EventTimeline";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Events — European Resolve",
  description: "Events organised and attended by European Resolve",
};

export default async function EventsPage() {
  const raw = await fetchRawEvents();
  const thumbnailMap = await processEventThumbnails(raw);
  const events = parseEvents(raw, thumbnailMap);

  return (
    <section className={styles.events}>
      <h1 className={styles.heading}>Events</h1>
      <p className={styles.intro}>
        We show up where it matters — rallies, panels, policy briefings, and
        public actions across Europe.
      </p>
      <EventTimeline initialEvents={events} />
    </section>
  );
}
