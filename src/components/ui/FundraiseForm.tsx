"use client";

import { useState, useRef } from "react";
import { ShareableLinkPreview } from "@/components/ui/ShareableLinkPreview";
import { FundraiserConfirmation } from "@/components/ui/FundraiserConfirmation";
import styles from "./FundraiseForm.module.css";

interface FormErrors {
  displayName?: string;
  message?: string;
  goalEur?: string;
  photo?: string;
  global?: string;
}

interface CreationResult {
  slug: string;
  editToken: string;
  displayName: string;
}

export function FundraiseForm() {
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [goalEur, setGoalEur] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (displayName.trim().length < 2 || displayName.trim().length > 50) {
      errs.displayName = "Display name must be 2-50 characters";
    }
    if (!message.trim()) {
      errs.message = "Message is required";
    } else if (message.trim().length > 500) {
      errs.message = "Message must be under 500 characters";
    }
    const goal = Number(goalEur);
    if (!goalEur || isNaN(goal) || goal < 10 || goal > 100000 || !Number.isInteger(goal)) {
      errs.goalEur = "Goal must be a whole number between 10 and 100,000";
    }
    return errs;
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: "Photo must be under 5MB" }));
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, photo: "Photo must be JPEG, PNG, or WebP" }));
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, photo: undefined }));
  }

  async function handleSubmit(publishStatus: "draft" | "published") {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    const formData = new FormData();
    formData.append("displayName", displayName.trim());
    formData.append("message", message.trim());
    formData.append("goalEur", goalEur);
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      const res = await fetch(`${apiUrl}/api/fundraiser`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const apiErrors: FormErrors = {};
        for (const err of data.errors ?? []) {
          apiErrors[err.field as keyof FormErrors] = err.message;
        }
        setErrors(Object.keys(apiErrors).length > 0 ? apiErrors : { global: "Something went wrong. Please try again." });
        return;
      }

      if (publishStatus === "published" && data.data.editToken) {
        await fetch(`${apiUrl}/api/fundraiser/${data.data.slug}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${data.data.editToken}` },
          body: (() => {
            const fd = new FormData();
            fd.append("status", "published");
            return fd;
          })(),
        });
      }

      setResult({
        slug: data.data.slug,
        editToken: data.data.editToken,
        displayName: data.data.displayName,
      });
    } catch {
      setErrors({ global: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <FundraiserConfirmation
        slug={result.slug}
        editToken={result.editToken}
        displayName={result.displayName}
      />
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.formLayout}>
          <button
            type="button"
            className={styles.photoUpload}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload photo"
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                className={styles.photoImage}
              />
            ) : (
              <span className={styles.photoPlaceholder}>+ Photo</span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.hiddenInput}
              onChange={handlePhotoSelect}
            />
          </button>
          {errors.photo && <p className={styles.error}>{errors.photo}</p>}

          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="fund-name">
                Display name
              </label>
              <input
                id="fund-name"
                type="text"
                className={styles.input}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                placeholder="How you want to appear on your page"
              />
              {errors.displayName && (
                <p className={styles.error}>{errors.displayName}</p>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="fund-message">
                Personal message
              </label>
              <textarea
                id="fund-message"
                className={`${styles.input} ${styles.textarea}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                placeholder="Why are you running? What drives you?"
              />
              <span className={styles.charCount}>
                {message.length}/500
              </span>
              {errors.message && (
                <p className={styles.error}>{errors.message}</p>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="fund-goal">
                Personal goal (€)
              </label>
              <input
                id="fund-goal"
                type="number"
                className={styles.input}
                value={goalEur}
                onChange={(e) => setGoalEur(e.target.value)}
                min={10}
                max={100000}
                placeholder="50"
              />
              {errors.goalEur && (
                <p className={styles.error}>{errors.goalEur}</p>
              )}
            </div>
          </div>
        </div>

        <ShareableLinkPreview />

        {errors.global && <p className={styles.errorGlobal}>{errors.global}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => handleSubmit("draft")}
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => handleSubmit("published")}
            disabled={submitting}
          >
            {submitting ? "Publishing…" : "Publish page →"}
          </button>
        </div>
      </div>
    </section>
  );
}
