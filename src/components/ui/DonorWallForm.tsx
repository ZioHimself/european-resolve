"use client";

import { useState } from "react";
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
  const [revealed, setRevealed] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ donorName?: string; message?: string; global?: string }>({});

  function validate() {
    const errs: typeof errors = {};
    if (donorName.trim().length < 2 || donorName.trim().length > 50) {
      errs.donorName = "Name must be 2-50 characters";
    }
    if (message.trim().length < 5 || message.trim().length > 200) {
      errs.message = "Message must be 5-200 characters";
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
        setErrors(Object.keys(apiErrors).length > 0 ? apiErrors : { global: "Something went wrong." });
        return;
      }

      onEntryAdded({
        donorName: donorName.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
      });

      setSubmitted(true);
    } catch {
      setErrors({ global: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.thankYou}>
        <span className={styles.thankYouIcon}>❤️</span>
        <p className={styles.thankYouText}>Thank you for your support!</p>
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
        I&apos;ve donated — leave a message of support
      </button>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="donor-name">
          Your name
        </label>
        <input
          id="donor-name"
          type="text"
          className={styles.input}
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          maxLength={50}
          placeholder="How you want to appear"
        />
        {errors.donorName && <p className={styles.error}>{errors.donorName}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="donor-message">
          Your message
        </label>
        <textarea
          id="donor-message"
          className={`${styles.input} ${styles.textarea}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          placeholder="A word of encouragement..."
        />
        <span className={styles.charCount}>{message.length}/200</span>
        {errors.message && <p className={styles.error}>{errors.message}</p>}
      </div>

      {errors.global && <p className={styles.error}>{errors.global}</p>}

      <button
        type="submit"
        className={styles.submitButton}
        disabled={submitting}
      >
        {submitting ? "Posting…" : "Post to wall"}
      </button>
    </form>
  );
}
