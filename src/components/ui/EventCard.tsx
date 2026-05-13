import type { EventDisplay } from "@/lib/events";
import styles from "./EventCard.module.css";

function formatDate(iso: string): string {
  const date = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function EventCard({ event }: { event: EventDisplay }) {
  return (
    <article className={styles.card}>
      {event.thumbnail && (
        <figure className={styles.figure}>
          <img
            src={event.thumbnail}
            alt={event.name}
            width={800}
            height={533}
            loading="lazy"
            className={styles.thumbnail}
          />
          {event.image_credit && (
            <figcaption className={styles.credit}>
              Photo: {event.image_credit}
            </figcaption>
          )}
        </figure>
      )}

      <div className={styles.meta}>
        <span className={styles.date}>{formatDate(event.date)}</span>
        <span className={styles.badge}>{event.type}</span>
      </div>

      <h3 className={styles.name}>{event.name}</h3>
      <p className={styles.place}>{event.place}</p>

      {event.organizers.length > 0 && (
        <p className={styles.organizers}>
          Organised by:{" "}
          {event.organizers.map((org, i) => (
            <span key={org.name}>
              {i > 0 && ", "}
              {org.website ? (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {org.name}
                </a>
              ) : (
                <span>{org.name}</span>
              )}
            </span>
          ))}
        </p>
      )}

      {(event.announcement_url) && (
        <div className={styles.links}>
          {event.announcement_url && (
            <a
              href={event.announcement_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {event.announcement_title || "Announcement"}
            </a>
          )}
        </div>
      )}

      {(event.media_features.length > 0) && (
        <p className={styles.features}>
          Featured by:{" "}
          {event.media_features.map((url, i) => {
            const domain = new URL(url).hostname.replace("www.", "");
            return (
              <span key={domain}>
                {i > 0 && ", "}
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {domain}
                </a>
              </span>
            );
          })}
        </p>
      )}

      {event.tags.length > 0 && (
        <div className={styles.tags}>
          {event.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
