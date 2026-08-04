"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { t } from "@/locales";
import { useEventStatus } from "@/hooks/useEventStatus";
import { WhyDonateWidget } from "@/components/ui/WhyDonateWidget";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import { eventDetails } from "@/data/event";
import { DonorWall } from "@/components/ui/DonorWall";
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

const STORAGE_KEY = "r4u:fundraiser-slug";

function FundraiserContent() {
  const searchParams = useSearchParams();
  const editToken = searchParams.get("edit");
  const redirectStatus = searchParams.get("redirect_status");
  const isCompleted = useEventStatus() === "completed";

  // Resolve slug: prefer query param, fall back to sessionStorage on WhyDonate redirect
  const slug = (() => {
    const fromUrl = searchParams.get("by");
    if (fromUrl) return fromUrl;
    if (typeof window === "undefined") return null;
    if (redirectStatus || searchParams.has("payment_intent")) {
      try { return sessionStorage.getItem(STORAGE_KEY); } catch { return null; }
    }
    return null;
  })();

  // If returning from WhyDonate redirect with a successful payment, start in completed state
  const isPaymentReturn = redirectStatus === "succeeded";

  const [fundraiser, setFundraiser] = useState<FundraiserData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [wallEntries, setWallEntries] = useState<DonorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [widgetVisible, setWidgetVisible] = useState(false);
  const [donationCompleted, setDonationCompleted] = useState(isPaymentReturn);
  const [wallPosted, setWallPosted] = useState(false);
  const [detectionActive, setDetectionActive] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [detectedAmount, setDetectedAmount] = useState(0);
  const [donorName, setDonorName] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [postingWall, setPostingWall] = useState(false);

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
      ) : donationCompleted ? (
        <div className={styles.donateSection}>
          {wallPosted ? (
            <div className={styles.thankYouBanner}>
              <span className={styles.thankYouIcon} aria-hidden="true">✓</span>
              <p className={styles.thankYouText}>
                {t("fundraiser.thankYouDonation")}
              </p>
            </div>
          ) : (
            <div className={styles.wallInlineForm}>
              <span className={styles.thankYouIcon} aria-hidden="true">✓</span>
              <p className={styles.thankYouText}>
                {t("fundraiser.thankYouDonation")}
              </p>
              <p className={styles.thankYouSubtext}>
                {t("fundraiser.leaveMessage")}
              </p>
              <input
                type="text"
                className={styles.wallInput}
                placeholder={t("donorWall.namePlaceholder")}
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                maxLength={50}
              />
              <textarea
                className={`${styles.wallInput} ${styles.wallTextarea}`}
                placeholder={t("donorWall.messagePlaceholder")}
                value={donorMessage}
                onChange={(e) => setDonorMessage(e.target.value)}
                maxLength={200}
              />
              <button
                type="button"
                className={styles.ctaButton}
                disabled={postingWall}
                onClick={async () => {
                  setPostingWall(true);
                  try {
                    const res = await fetch(`${apiUrl}/api/donation/${slug}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        amount: detectedAmount,
                        donorName: donorName.trim() || undefined,
                        message: donorMessage.trim() || undefined,
                      }),
                    });
                    const data = await res.json();
                    if (data.success && data.data) {
                      handleEntryAdded({
                        donorName: data.data.donorName,
                        message: data.data.message,
                        createdAt: data.data.createdAt,
                      });
                    }
                  } catch { /* best-effort */ }
                  setWallPosted(true);
                  setPostingWall(false);
                }}
              >
                {postingWall ? t("donorWall.posting") : t("donorWall.postButton")}
              </button>
            </div>
          )}
        </div>
      ) : !widgetVisible ? (
        <div className={styles.donateSection}>
          <h2 className={styles.donateHeading}>{t("fundraiser.donateHeading")}</h2>
          <button
            type="button"
            className={styles.ctaButton}
            onClick={() => {
              try { sessionStorage.setItem(STORAGE_KEY, slug!); } catch { /* unavailable */ }
              setWidgetVisible(true);
            }}
          >
            {t("fundraiser.ctaButton", { name: fundraiser.displayName })}
          </button>
        </div>
      ) : (
        <div className={styles.donateSection}>
          <h2 className={styles.donateHeading}>{t("fundraiser.donateHeading")}</h2>
          <div className={styles.widgetContainer} style={{ position: "relative" }}>
            <WhyDonateWidget
              shortcode={eventDetails.whydonateShortcode}
              onPaymentSuccess={(amount) => {
                setDetectedAmount(amount);
                setDonationCompleted(true);
              }}
              onDetectionFailed={() => setDetectionActive(false)}
            />
            {verifying && (
              <div className={styles.verifyingOverlay}>
                <div className={styles.verifyingSpinner} />
                <p className={styles.verifyingText}>
                  {t("fundraiser.verifying")}
                </p>
              </div>
            )}
          </div>
          {!detectionActive && (
            <div className={styles.fallbackSection}>
              <p className={styles.fallbackLabel}>
                {t("confirmation.afterDonation")}
              </p>
              <button
                type="button"
                className={styles.fallbackButton}
                onClick={() => setDonationCompleted(true)}
              >
                {t("fundraiser.manualConfirm")}
              </button>
            </div>
          )}
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
