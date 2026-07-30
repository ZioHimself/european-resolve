"use client";

import { useEffect, useState } from "react";
import { t } from "@/locales";
import styles from "./DonorWall.module.css";

interface DonorEntry {
  donorName: string;
  message: string;
  createdAt: string;
}

interface DonorWallProps {
  slug: string;
  entries: DonorEntry[];
  onEntriesLoaded: (entries: DonorEntry[]) => void;
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function DonorWall({ slug, entries, onEntriesLoaded }: DonorWallProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    async function fetchEntries() {
      try {
        const res = await fetch(`${apiUrl}/api/donors/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            onEntriesLoaded(data.data);
          }
        }
      } catch {
        /* keep empty state */
      } finally {
        setLoading(false);
      }
    }

    fetchEntries();
  }, [slug, onEntriesLoaded]);

  if (loading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.heading}>{t("donorWall.heading")}</h2>
        <p className={styles.loading}>{t("donorWall.loading")}</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        {t("donorWall.heading")}{" "}
        {entries.length > 0 && (
          <span className={styles.count}>({entries.length})</span>
        )}
      </h2>

      {entries.length === 0 ? (
        <p className={styles.empty}>{t("donorWall.empty")}</p>
      ) : (
        <ul className={styles.list}>
          {entries.map((entry, i) => (
            <li key={`${entry.donorName}-${i}`} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryName}>{entry.donorName}</span>
                <span className={styles.entryTime}>
                  {getRelativeTime(entry.createdAt)}
                </span>
              </div>
              <p className={styles.entryMessage}>{entry.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
