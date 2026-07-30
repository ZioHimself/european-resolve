"use client";

import { useState } from "react";
import { t } from "@/locales";
import { useEventStatus } from "@/hooks/useEventStatus";
import styles from "./DonorWallForm.module.css";

interface DonorEntry {
  donorName: string;
  message: string;
  createdAt: string;
}

interface DonorWallFormProps {
  slug: string;
  onEntryAdded: (entry: DonorEntry) => void;
}

export function DonorWallForm({ slug, onEntryAdded }: DonorWallFormProps) {
  const isCompleted = useEventStatus() === "completed";
  const [revealed, setRevealed] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ donorName?: string; message?: string; global?: string }>({});

  if (isCompleted) return null;

  function validate() {
    const errs: typeof errors = {};
    if (donorName.trim().length < 2 || donorName.trim().length > 50) {
      errs.donorName = t("donorWall.errorName");
    }
    if (message.trim().length < 5 || message.trim().length > 200) {
      errs.message = t("donorWall.errorMessage");
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    try {
      const res = await fetch(`${apiUrl}/api/donors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundraiserSlug: slug,
          donorName: donorName.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const apiErrors: typeof errors = {};
        for (const err of (data.errors ?? []) as { field: string; message: string }[]) {
          if (err.field === "donorName" || err.field === "message") {
            apiErrors[err.field] = err.message;
          } else {
            apiErrors.global = err.message;
          }
        }
        setErrors(Object.keys(apiErrors).length > 0 ? apiErrors : { global: t("donorWall.globalError") });
        return;
      }

      onEntryAdded({
        donorName: donorName.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
      });

      setSubmitted(true);
    } catch {
      setErrors({ global: t("donorWall.networkError") });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.thankYou}>
        <span className={styles.thankYouIcon}>❤️</span>
        <p className={styles.thankYouText}>{t("donorWall.thankYou")}</p>
      </div>
    );
  }

  if (!revealed) {
    return (
      <button
        type="button"
        className={styles.gateButton}
        onClick={() => setRevealed(true)}
      >
        {t("donorWall.gateButton")}
      </button>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="donor-name">
          {t("donorWall.nameLabel")}
        </label>
        <input
          id="donor-name"
          type="text"
          className={styles.input}
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          maxLength={50}
          placeholder={t("donorWall.namePlaceholder")}
        />
        {errors.donorName && <p className={styles.error}>{errors.donorName}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="donor-message">
          {t("donorWall.messageLabel")}
        </label>
        <textarea
          id="donor-message"
          className={`${styles.input} ${styles.textarea}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          placeholder={t("donorWall.messagePlaceholder")}
        />
        <span className={styles.charCount}>
          {t("common.charCount", { count: String(message.length), max: "200" })}
        </span>
        {errors.message && <p className={styles.error}>{errors.message}</p>}
      </div>

      {errors.global && <p className={styles.error}>{errors.global}</p>}

      <button
        type="submit"
        className={styles.submitButton}
        disabled={submitting}
      >
        {submitting ? t("donorWall.posting") : t("donorWall.postButton")}
      </button>
    </form>
  );
}
