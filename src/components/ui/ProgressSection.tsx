"use client";

import { useEffect, useState } from "react";
import { eventDetails } from "@/data/event";
import styles from "./ProgressSection.module.css";

interface ProgressData {
  totalRaisedEur: number;
  goalEur: number;
  goalPercent: number;
  participantCount: number;
  donorCount: number;
}

export function ProgressSection() {
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    async function fetchProgress() {
      try {
        const res = await fetch(`${apiUrl}/api/progress`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setProgress(data.data);
          }
        }
      } catch {
        /* keep last known values */
      }
    }

    fetchProgress();
    const interval = setInterval(fetchProgress, 30_000);
    return () => clearInterval(interval);
  }, []);

  const raised = progress
    ? `€${progress.totalRaisedEur.toLocaleString("en-GB")}`
    : "—";
  const goalPct = progress ? `${progress.goalPercent}%` : "0%";
  const participants = progress ? String(progress.participantCount) : "0";
  const donors = progress ? String(progress.donorCount) : "0";
  const barWidth = progress ? `${progress.goalPercent}%` : "0%";
  const barNow = progress?.goalPercent ?? 0;
  const totalRaised = progress?.totalRaisedEur ?? 0;
  const goalEur = progress?.goalEur ?? eventDetails.goalEur;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.overline}>Live progress</span>
        <span className={styles.indicator}>Updated live</span>
      </div>

      <dl className={styles.stats}>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>Raised</dt>
          <dd className={styles.statValue}>{raised}</dd>
        </div>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>Goal</dt>
          <dd className={styles.statValue}>{goalPct}</dd>
        </div>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>Participants</dt>
          <dd className={styles.statValue}>{participants}</dd>
        </div>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>Donors</dt>
          <dd className={styles.statValue}>{donors}</dd>
        </div>
      </dl>

      <div className={styles.barContainer}>
        <div
          className={styles.bar}
          role="progressbar"
          aria-valuenow={barNow}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={styles.barFill} style={{ width: barWidth }} />
        </div>
        <div className={styles.barLabels}>
          <span className={styles.barLeft}>
            €{totalRaised.toLocaleString("en-GB")} raised · Goal €
            {goalEur.toLocaleString("en-GB")}
          </span>
          <span className={styles.barRight}>{goalPct}</span>
        </div>
      </div>
    </section>
  );
}
