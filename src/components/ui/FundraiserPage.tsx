"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { t } from "@/locales";
import { useEventStatus } from "@/hooks/useEventStatus";
import { WhyDonateWidget } from "@/components/ui/WhyDonateWidget";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import { eventDetails } from "@/data/event";
import { mergePendingDonation } from "@/lib/whydonateDonationStorage";
import { DonorWall } from "@/components/ui/DonorWall";
import styles from "./FundraiserPage.module.css";

interface FundraiserData {
  slug: string;
  displayName: string;
  message: string;
  goalEur: number;
  raisedEur?: number;
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
const STORAGE_AMOUNT_KEY = "r4u:donation-amount";
const STORAGE_DONOR_KEY = "r4u:donation-donor";
const STORAGE_MESSAGE_KEY = "r4u:donation-message";
const recordedKey = (slug: string) => `r4u:donation-recorded:${slug}`;

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

  const isPaymentReturn = redirectStatus === "succeeded";

  const [fundraiser, setFundraiser] = useState<FundraiserData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [wallEntries, setWallEntries] = useState<DonorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [widgetVisible, setWidgetVisible] = useState(false);
  const [donationCompleted, setDonationCompleted] = useState(isPaymentReturn);
  const [detectionActive, setDetectionActive] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    console.log("[FundraiserPage] init", { slug, isPaymentReturn, redirectStatus });

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
          setEditMessage(fundData.data.message);
          setEditGoal(String(fundData.data.goalEur));
        } else {
          setNotFound(true);
        }

        if (progRes.ok) {
          const progData = await progRes.json();
          if (progData.success) {
            setProgress(progData.data);
          }
        }

        if (editToken && fundData.success && !isCompleted) {
          try {
            const verifyRes = await fetch(`${apiUrl}/api/fundraiser/${slug}`, {
              method: "PUT",
              headers: { Authorization: `Bearer ${editToken}` },
              body: new FormData(),
            });
            if (verifyRes.ok) {
              setCanEdit(true);
              setEditing(true);
            }
          } catch {
            setCanEdit(false);
          }
        }

        if (isPaymentReturn) {
          const recorded = (() => {
            try { return sessionStorage.getItem(recordedKey(slug!)) === "1"; } catch { return false; }
          })();

          if (!recorded) {
            let storedAmount = 0;
            let storedDonor = "";
            let storedMessage = "";
            try {
              storedAmount = Number(sessionStorage.getItem(STORAGE_AMOUNT_KEY)) || 0;
              storedDonor = sessionStorage.getItem(STORAGE_DONOR_KEY) ?? "";
              storedMessage = sessionStorage.getItem(STORAGE_MESSAGE_KEY) ?? "";
            } catch { /* unavailable */ }

            const pending = mergePendingDonation(eventDetails.whydonateShortcode, {
              amount: storedAmount,
              donor: storedDonor,
              message: storedMessage,
            });

            console.log("[FundraiserPage] redirect return — recording donation", {
              slug, ...pending,
            });

            fetch(`${apiUrl}/api/donation/${slug}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: pending.amount || undefined,
                donorName: pending.donorName,
                message: pending.message,
                redirect: true,
              }),
            })
              .then((r) => r.json())
              .then((data) => {
                console.log("[FundraiserPage] donation record response", data);
                if (data.success && data.data) {
                  try { sessionStorage.setItem(recordedKey(slug!), "1"); } catch { /* unavailable */ }
                  handleEntryAdded({
                    donorName: data.data.donorName,
                    message: data.data.message,
                    createdAt: data.data.createdAt,
                  });
                }
              })
              .catch((err) => console.error("[FundraiserPage] donation record failed", err));
          }

          try {
            sessionStorage.removeItem(STORAGE_AMOUNT_KEY);
            sessionStorage.removeItem(STORAGE_DONOR_KEY);
            sessionStorage.removeItem(STORAGE_MESSAGE_KEY);
            sessionStorage.removeItem(STORAGE_KEY);
          } catch { /* unavailable */ }
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

  async function handleSave() {
    if (!slug || !editToken || !fundraiser) return;
    setSaving(true);
    setSaveError(null);

    try {
      const formData = new FormData();
      if (editMessage.trim() !== fundraiser.message) {
        formData.append("message", editMessage.trim());
      }
      const newGoal = Number(editGoal);
      if (!isNaN(newGoal) && newGoal !== fundraiser.goalEur) {
        formData.append("goalEur", String(newGoal));
      }

      const res = await fetch(`${apiUrl}/api/fundraiser/${slug}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${editToken}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setFundraiser(data.data);
        setEditing(false);
      } else {
        setSaveError(data.errors?.[0]?.message ?? t("fundraiser.saveFailed"));
      }
    } catch {
      setSaveError(t("fundraiser.saveFailed"));
    } finally {
      setSaving(false);
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

      {editing ? (
        <div className={styles.editForm}>
          <label className={styles.editLabel}>
            {t("fundraiser.editMessage")}
            <textarea
              className={styles.editTextarea}
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              maxLength={500}
              rows={4}
            />
          </label>
          <label className={styles.editLabel}>
            {t("fundraiser.editGoal")}
            <input
              type="number"
              className={styles.editInput}
              value={editGoal}
              onChange={(e) => setEditGoal(e.target.value)}
              min={10}
              max={100000}
            />
          </label>
          {saveError && <p className={styles.saveError}>{saveError}</p>}
          <div className={styles.editActions}>
            <button
              type="button"
              className={styles.ctaButton}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? t("fundraiser.saving") : t("fundraiser.save")}
            </button>
            <button
              type="button"
              className={styles.editCancelButton}
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              {t("fundraiser.cancel")}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.message}>
            <p>{fundraiser.message}</p>
          </div>

          <div className={styles.goalInfo}>
            <span className={styles.goalPersonal}>
              {t("fundraiser.personalGoal", {
                goal: fundraiser.goalEur.toLocaleString("en-GB"),
              })}
            </span>
            {(fundraiser.raisedEur ?? 0) > 0 && (
              <span className={styles.goalRaised}>
                {t("fundraiser.raisedSoFar", {
                  raised: (fundraiser.raisedEur ?? 0).toLocaleString("en-GB"),
                })}
              </span>
            )}
            {progress && (
              <span className={styles.goalCollective}>
                {t("fundraiser.collectiveTotal", {
                  total: progress.totalRaisedEur.toLocaleString("en-GB"),
                })}
              </span>
            )}
          </div>
        </>
      )}

      {!editing && (isCompleted ? (
        <div className={styles.donateSection}>
          <p className={styles.donationsClosed}>{t("closed.donationsClosed")}</p>
        </div>
      ) : donationCompleted ? (
        <div className={styles.donateSection}>
          <div className={styles.thankYouBanner}>
            <span className={styles.thankYouIcon} aria-hidden="true">✓</span>
            <p className={styles.thankYouText}>
              {t("fundraiser.thankYouDonation")}
            </p>
          </div>
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
              donationStorageKeys={{
                amount: STORAGE_AMOUNT_KEY,
                donor: STORAGE_DONOR_KEY,
                message: STORAGE_MESSAGE_KEY,
              }}
              onPaymentSuccess={(amount, details) => {
                console.log("[FundraiserPage] in-page payment detected", { amount, details, slug });
                try {
                  sessionStorage.setItem(STORAGE_AMOUNT_KEY, String(amount));
                  if (details?.donorName) sessionStorage.setItem(STORAGE_DONOR_KEY, details.donorName);
                  if (details?.message) sessionStorage.setItem(STORAGE_MESSAGE_KEY, details.message);
                } catch { /* unavailable */ }
                setDonationCompleted(true);
                fetch(`${apiUrl}/api/donation/${slug}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    amount,
                    donorName: details?.donorName,
                    message: details?.message,
                  }),
                })
                  .then((r) => r.json())
                  .then((data) => {
                    if (data.success && data.data) {
                      try { sessionStorage.setItem(recordedKey(slug!), "1"); } catch { /* unavailable */ }
                      handleEntryAdded({
                        donorName: data.data.donorName,
                        message: data.data.message,
                        createdAt: data.data.createdAt,
                      });
                    }
                  })
                  .catch(() => { /* best-effort */ })
                  .finally(() => {
                    try {
                      sessionStorage.removeItem(STORAGE_AMOUNT_KEY);
                      sessionStorage.removeItem(STORAGE_DONOR_KEY);
                      sessionStorage.removeItem(STORAGE_MESSAGE_KEY);
                      sessionStorage.removeItem(STORAGE_KEY);
                    } catch { /* unavailable */ }
                  });
              }}
              onDetectionFailed={() => {
                console.log("[FundraiserPage] widget detection failed");
                setDetectionActive(false);
              }}
            />
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
      ))}

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

      {!isCompleted && canEdit && fundraiser.status === "draft" && (
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
