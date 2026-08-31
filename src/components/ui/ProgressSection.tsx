"use client";

import { t } from "@/locales";
import { eventDetails } from "@/data/event";
import { useEventStatus } from "@/hooks/useEventStatus";
import styles from "./ProgressSection.module.css";

function buildProgressFromFinalStats() {
  const fs = eventDetails.postEvent.finalStats;
  const goalPct =
    eventDetails.goalEur > 0
      ? Math.round((fs.raised / eventDetails.goalEur) * 100)
      : 0;

  return {
    totalRaisedEur: fs.raised,
    goalEur: eventDetails.goalEur,
    goalPercent: goalPct,
    participantCount: fs.participants,
    donorCount: fs.donors,
  };
}

export function ProgressSection() {
  const isCompleted = useEventStatus() === "completed";
  const progress = buildProgressFromFinalStats();

  const raised = `€${progress.totalRaisedEur.toLocaleString("en-GB")}`;
  const goalPct = `${progress.goalPercent}%`;
  const participants = String(progress.participantCount);
  const donors = String(progress.donorCount);
  const barWidth = `${progress.goalPercent}%`;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.overline}>
          {isCompleted ? t("closed.finalResults") : t("progress.overline")}
        </span>
        {!isCompleted && (
          <span className={styles.indicator}>{t("progress.indicator")}</span>
        )}
      </div>

      <dl className={styles.stats}>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>{t("progress.raised")}</dt>
          <dd className={styles.statValue}>{raised}</dd>
        </div>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>{t("progress.goal")}</dt>
          <dd className={styles.statValue}>{goalPct}</dd>
        </div>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>{t("progress.participants")}</dt>
          <dd className={styles.statValue}>{participants}</dd>
        </div>
        <div className={styles.statCard}>
          <dt className={styles.statLabel}>{t("progress.donors")}</dt>
          <dd className={styles.statValue}>{donors}</dd>
        </div>
      </dl>

      <div className={styles.barContainer}>
        <div
          className={styles.bar}
          role="progressbar"
          aria-valuenow={progress.goalPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={styles.barFill} style={{ width: barWidth }} />
        </div>
        <div className={styles.barLabels}>
          <span className={styles.barLeft}>
            {t("progress.barLabel", {
              raised: progress.totalRaisedEur.toLocaleString("en-GB"),
              goal: progress.goalEur.toLocaleString("en-GB"),
            })}
          </span>
          <span className={styles.barRight}>{goalPct}</span>
        </div>
      </div>
    </section>
  );
}
