"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { t } from "@/locales";
import { useEventStatus } from "@/hooks/useEventStatus";
import { WhyDonateWidget } from "@/components/ui/WhyDonateWidget";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import { DonorWall } from "@/components/ui/DonorWall";
import { DonorWallForm } from "@/components/ui/DonorWallForm";
import styles from "./FundraiserPage.module.css";

interface FundraiserData {
  slug: string;
  displayName: string;
  message: string;
  goalEur: number;
  photoUrl: string | null;
  status: "draft" | "published";
  createdAt: string;
}

interface ProgressData {
  totalRaisedEur: number;
  goalEur: number;
  goalPercent: number;
}

interface DonorEntry {
  donorName: string;
  message: string;
  createdAt: string;
}

function FundraiserContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("by");
  const editToken = searchParams.get("edit");
  const isCompleted = useEventStatus() === "completed";

  const [fundraiser, setFundraiser] = useState<FundraiserData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [wallEntries, setWallEntries] = useState<DonorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    async function fetchData() {
      try {
        const [fundRes, progRes] = await Promise.all([
          fetch(`${apiUrl}/api/fundraiser/${slug}`),
          fetch(`${apiUrl}/api/progress`),
        ]);

        if (!fundRes.ok) {
          setNotFound(true);
          return;
        }

        const fundData = await fundRes.json();
        if (fundData.success) {
          setFundraiser(fundData.data);
        } else {
          setNotFound(true);
        }

        if (progRes.ok) {
          const progData = await progRes.json();
          if (progData.success) {
            setProgress(progData.data);
          }
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug, apiUrl]);

  async function handlePublish() {
    if (!slug || !editToken || !fundraiser) return;
    setPublishing(true);

    try {
      const formData = new FormData();
      formData.append("status", "published");

      const res = await fetch(`${apiUrl}/api/fundraiser/${slug}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${editToken}` },
        body: formData,
      });

      if (res.ok) {
        setFundraiser({ ...fundraiser, status: "published" });
      }
    } catch {
      /* silent fail */
    } finally {
      setPublishing(false);
    }
  }

  const handleEntriesLoaded = useCallback((entries: DonorEntry[]) => {
    setWallEntries(entries);
  }, []);

  function handleEntryAdded(entry: DonorEntry) {
    setWallEntries((prev) => [entry, ...prev]);
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} aria-label={t("common.loading")} />
      </div>
    );
  }

  if (notFound || !fundraiser) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundHeading}>{t("fundraiser.notFoundHeading")}</h1>
        <p className={styles.notFoundText}>{t("fundraiser.notFoundText")}</p>
        <a href="/events/2026-run-for-ukraine/fundraise" className={styles.backLink}>
          {t("fundraiser.createOwn")}
        </a>
      </div>
    );
  }

  return (
    <article className={styles.page}>
      {fundraiser.status === "draft" && (
        <div className={styles.draftBanner}>{t("fundraiser.draftBanner")}</div>
      )}

      <header className={styles.header}>
        <div className={styles.avatar}>
          {fundraiser.photoUrl ? (
            <img
              src={fundraiser.photoUrl}
              alt={fundraiser.displayName}
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.avatarPlaceholder}>
              {fundraiser.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h1 className={styles.name}>
          {fundraiser.displayName}{t("fundraiser.nameSuffix")}
        </h1>
      </header>

      <div className={styles.message}>
        <p>{fundraiser.message}</p>
      </div>

      <div className={styles.goalInfo}>
        <span className={styles.goalPersonal}>
          {t("fundraiser.personalGoal", {
            goal: fundraiser.goalEur.toLocaleString("en-GB"),
          })}
        </span>
        {progress && (
          <span className={styles.goalCollective}>
            {t("fundraiser.collectiveTotal", {
              total: progress.totalRaisedEur.toLocaleString("en-GB"),
            })}
          </span>
        )}
      </div>

      {isCompleted ? (
        <div className={styles.donateSection}>
          <p className={styles.donationsClosed}>{t("closed.donationsClosed")}</p>
        </div>
      ) : (
        <div className={styles.donateSection}>
          <h2 className={styles.donateHeading}>{t("fundraiser.donateHeading")}</h2>
          <WhyDonateWidget shortcode="nudW7" />
        </div>
      )}

      <div className={styles.shareSection}>
        <h2 className={styles.shareSectionHeading}>{t("fundraiser.shareHeading")}</h2>
        <SocialShareButtons
          url={`https://european-resolve.org/events/2026-run-for-ukraine/fundraiser?by=${fundraiser.slug}`}
          title={fundraiser.displayName}
        />
      </div>

      {fundraiser.status === "published" && slug && (
        <div className={styles.donorWallSection}>
          <DonorWall
            slug={slug}
            entries={wallEntries}
            onEntriesLoaded={handleEntriesLoaded}
          />
          {!isCompleted && (
            <DonorWallForm slug={slug} onEntryAdded={handleEntryAdded} />
          )}
        </div>
      )}

      {!isCompleted && editToken && fundraiser.status === "draft" && (
        <div className={styles.editControls}>
          <button
            type="button"
            className={styles.publishButton}
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? t("fundraiser.publishing") : t("fundraiser.publish")}
          </button>
        </div>
      )}
    </article>
  );
}

export function FundraiserPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.loading}>
          <div className={styles.spinner} aria-label={t("common.loading")} />
        </div>
      }
    >
      <FundraiserContent />
    </Suspense>
  );
}
