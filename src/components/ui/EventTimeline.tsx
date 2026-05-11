"use client";

import { useEffect, useState } from "react";
import type { EventDisplay } from "@/lib/events";
import { fetchEvents } from "@/lib/events";
import { EventCard } from "./EventCard";
import styles from "./EventTimeline.module.css";

export function EventTimeline({
  initialEvents,
}: {
  initialEvents: EventDisplay[];
}) {
  const [events, setEvents] = useState(() =>
    [...initialEvents].sort((a, b) => b.date.localeCompare(a.date)),
  );

  useEffect(() => {
    const thumbnailsByDate = new Map(
      initialEvents
        .filter((e) => e.thumbnail)
        .map((e) => [e.date, e.thumbnail]),
    );

    fetchEvents()
      .then((fresh) => {
        if (fresh.length > 0) {
          setEvents(
            fresh.map((e) => ({
              ...e,
              thumbnail: e.thumbnail || thumbnailsByDate.get(e.date) || "",
            })),
          );
        }
      })
      .catch(() => {
        // Keep build-time data on failure
      });
  }, []);

  if (events.length === 0) {
    return <p className={styles.empty}>No events yet</p>;
  }

  return (
    <div className={styles.timeline}>
      {events.map((event) => (
        <EventCard key={event.date + event.name} event={event} />
      ))}
    </div>
  );
}
