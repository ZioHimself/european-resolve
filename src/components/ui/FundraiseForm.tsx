"use client";

import { useState, useRef } from "react";
import { TierGrid } from "@/components/ui/TierGrid";
import { tiers } from "@/data/event";
import { FundraiserConfirmation } from "@/components/ui/FundraiserConfirmation";
import styles from "./FundraiseForm.module.css";

type TierId = "supporter" | "champion" | "patron";
type Step = 1 | 2 | 3;

interface FormData {
  displayName: string;
  message: string;
  goalEur: string;
  photoFile: File | null;
  photoPreview: string | null;
  fullName: string;
  email: string;
  phone: string;
  tshirtSize: string;
  language: string;
  country: string;
  tierId: TierId | null;
  gdprConsent: boolean;
  commsOptin: boolean;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface CombinedResult {
  fundraiser: {
    slug: string;
    editToken: string;
    displayName: string;
    photoUrl: string | null;
  };
  registration: {
    participantId: string;
    fullName: string;
    tierId: TierId;
    tierName: string;
    amountEur: number;
    rewards: string[];
    paymentToken: string;
    whydonateWidgetUrl: string;
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FundraiseForm() {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<FormData>({
    displayName: "",
    message: "",
    goalEur: "",
    photoFile: null,
    photoPreview: null,
    fullName: "",
    email: "",
    phone: "",
    tshirtSize: "M",
    language: "English",
    country: "",
    tierId: null,
    gdprConsent: false,
    commsOptin: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CombinedResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update(fields: Partial<FormData>) {
    setData((prev) => ({ ...prev, ...fields }));
  }

  function validateStep1(): FormErrors {
    const errs: FormErrors = {};
    if (data.displayName.trim().length < 2 || data.displayName.trim().length > 50) {
      errs.displayName = "Display name must be 2-50 characters";
    }
    if (!data.message.trim()) {
      errs.message = "Message is required";
    } else if (data.message.trim().length > 500) {
      errs.message = "Message must be under 500 characters";
    }
    const goal = Number(data.goalEur);
    if (!data.goalEur || isNaN(goal) || goal < 10 || goal > 100000 || !Number.isInteger(goal)) {
      errs.goalEur = "Goal must be a whole number between 10 and 100,000";
    }
    return errs;
  }

  function validateStep2(): FormErrors {
    const errs: FormErrors = {};
    if (!data.tierId) {
      errs.tierId = "Please select a tier";
    }
    if (!data.fullName.trim()) {
      errs.fullName = "Full name is required";
    }
    if (!data.email.trim() || !EMAIL_REGEX.test(data.email)) {
      errs.email = "Valid email address is required";
    }
    if (!data.country.trim()) {
      errs.country = "Country is required";
    }
    if (!data.gdprConsent) {
      errs.gdprConsent = "GDPR consent is required to register";
    }
    return errs;
  }

  function handleNext() {
    if (step === 1) {
      const errs = validateStep1();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      const errs = validateStep2();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setErrors({});
      setStep(3);
    }
  }

  function handleBack() {
    setErrors({});
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
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

    update({ photoFile: file, photoPreview: URL.createObjectURL(file) });
    setErrors((prev) => ({ ...prev, photo: undefined }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setErrors({});

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    const formData = new FormData();

    formData.append("displayName", data.displayName.trim());
    formData.append("message", data.message.trim());
    formData.append("goalEur", data.goalEur);
    if (data.photoFile) formData.append("photo", data.photoFile);

    formData.append("fullName", data.fullName.trim());
    formData.append("email", data.email.trim().toLowerCase());
    if (data.phone.trim()) formData.append("phone", data.phone.trim());
    formData.append("tshirtSize", data.tshirtSize);
    formData.append("language", data.language);
    formData.append("country", data.country.trim());
    formData.append("tierId", data.tierId!);
    formData.append("gdprConsent", String(data.gdprConsent));
    formData.append("commsOptin", String(data.commsOptin));

    try {
      const res = await fetch(`${apiUrl}/api/fundraiser/register`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const apiErrors: FormErrors = {};
        for (const err of (json.errors ?? []) as { field: string; message: string }[]) {
          apiErrors[err.field] = err.message;
        }
        setErrors(Object.keys(apiErrors).length > 0 ? apiErrors : { global: "Something went wrong. Please try again." });
        if (apiErrors.displayName || apiErrors.message || apiErrors.goalEur || apiErrors.photo) {
          setStep(1);
        } else if (Object.keys(apiErrors).length > 0) {
          setStep(2);
        }
        return;
      }

      setResult(json.data);
    } catch {
      setErrors({ global: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <FundraiserConfirmation
        slug={result.fundraiser.slug}
        editToken={result.fundraiser.editToken}
        displayName={result.fundraiser.displayName}
        registration={result.registration}
      />
    );
  }

  const selectedTier = data.tierId ? tiers.find((t) => t.id === data.tierId) : null;

  return (
    <section className={styles.section}>
      <div className={styles.stepIndicator}>
        <span className={step >= 1 ? styles.stepActive : styles.stepInactive}>1. Your page</span>
        <span className={styles.stepDivider}>→</span>
        <span className={step >= 2 ? styles.stepActive : styles.stepInactive}>2. Runner details</span>
        <span className={styles.stepDivider}>→</span>
        <span className={step >= 3 ? styles.stepActive : styles.stepInactive}>3. Review</span>
      </div>

      {errors.global && <p className={styles.errorGlobal}>{errors.global}</p>}

      {step === 1 && (
        <div className={styles.card}>
          <h2 className={styles.stepHeading}>Set up your fundraising page</h2>
          <div className={styles.formLayout}>
            <button
              type="button"
              className={styles.photoUpload}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload photo"
            >
              {data.photoPreview ? (
                <img src={data.photoPreview} alt="Preview" className={styles.photoImage} />
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
                <label className={styles.label} htmlFor="fund-name">Display name</label>
                <input
                  id="fund-name"
                  type="text"
                  className={styles.input}
                  value={data.displayName}
                  onChange={(e) => update({ displayName: e.target.value })}
                  maxLength={50}
                  placeholder="How you want to appear on your page"
                />
                {errors.displayName && <p className={styles.error}>{errors.displayName}</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="fund-message">Personal message</label>
                <textarea
                  id="fund-message"
                  className={`${styles.input} ${styles.textarea}`}
                  value={data.message}
                  onChange={(e) => update({ message: e.target.value })}
                  maxLength={500}
                  placeholder="Why are you running? What drives you?"
                />
                <span className={styles.charCount}>{data.message.length}/500</span>
                {errors.message && <p className={styles.error}>{errors.message}</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="fund-goal">Personal goal (€)</label>
                <input
                  id="fund-goal"
                  type="number"
                  className={styles.input}
                  value={data.goalEur}
                  onChange={(e) => update({ goalEur: e.target.value })}
                  min={10}
                  max={100000}
                  placeholder="50"
                />
                {errors.goalEur && <p className={styles.error}>{errors.goalEur}</p>}
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <span />
            <button type="button" className={styles.primaryButton} onClick={handleNext}>
              Next: Runner details →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={styles.card}>
          <h2 className={styles.stepHeading}>Your runner registration</h2>

          {errors.tierId && <p className={styles.error}>{errors.tierId}</p>}
          <TierGrid
            selectedTierId={data.tierId}
            onSelectTier={(id) => update({ tierId: id })}
            participationType="runner"
          />

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                type="text"
                className={styles.input}
                value={data.fullName}
                onChange={(e) => update({ fullName: e.target.value })}
              />
              {errors.fullName && <p className={styles.error}>{errors.fullName}</p>}
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                className={styles.input}
                value={data.email}
                onChange={(e) => update({ email: e.target.value })}
              />
              {errors.email && <p className={styles.error}>{errors.email}</p>}
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-phone">
                Phone <span className={styles.optional}>(optional)</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                className={styles.input}
                value={data.phone}
                onChange={(e) => update({ phone: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-tshirt">T-shirt size</label>
              <select
                id="reg-tshirt"
                className={styles.input}
                value={data.tshirtSize}
                onChange={(e) => update({ tshirtSize: e.target.value })}
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-language">Language</label>
              <select
                id="reg-language"
                className={styles.input}
                value={data.language}
                onChange={(e) => update({ language: e.target.value })}
              >
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="Ukrainian">Ukrainian</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-country">Country</label>
              <input
                id="reg-country"
                type="text"
                className={styles.input}
                value={data.country}
                onChange={(e) => update({ country: e.target.value })}
              />
              {errors.country && <p className={styles.error}>{errors.country}</p>}
            </div>
          </div>

          <div className={styles.checkboxes}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={data.gdprConsent}
                onChange={(e) => update({ gdprConsent: e.target.checked })}
              />
              <span>
                <strong>GDPR consent (required)</strong>. I agree to my data being processed for the purpose of race registration and safety, in line with the privacy notice.
              </span>
            </label>
            {errors.gdprConsent && <p className={styles.error}>{errors.gdprConsent}</p>}
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={data.commsOptin}
                onChange={(e) => update({ commsOptin: e.target.checked })}
              />
              <span>
                <strong>Ongoing communications (optional)</strong>. Send me news about future editions and the beneficiary&apos;s work.
              </span>
            </label>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.ghostButton} onClick={handleBack}>
              ← Back
            </button>
            <button type="button" className={styles.primaryButton} onClick={handleNext}>
              Next: Review →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={styles.card}>
          <h2 className={styles.stepHeading}>Review and submit</h2>

          <div className={styles.reviewSection}>
            <h3 className={styles.reviewLabel}>Your fundraising page</h3>
            <div className={styles.reviewGrid}>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>Display name</span>
                <span className={styles.reviewValue}>{data.displayName}</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>Message</span>
                <span className={styles.reviewValue}>{data.message.slice(0, 80)}{data.message.length > 80 ? "…" : ""}</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>Goal</span>
                <span className={styles.reviewValue}>€{Number(data.goalEur).toLocaleString("en-GB")}</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>Photo</span>
                <span className={styles.reviewValue}>{data.photoFile ? "Uploaded" : "None"}</span>
              </div>
            </div>
          </div>

          <div className={styles.reviewSection}>
            <h3 className={styles.reviewLabel}>Runner registration</h3>
            <div className={styles.reviewGrid}>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>Tier</span>
                <span className={styles.reviewValue}>
                  {selectedTier ? `${selectedTier.name} — €${selectedTier.price}` : "—"}
                </span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>Full name</span>
                <span className={styles.reviewValue}>{data.fullName}</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>Email</span>
                <span className={styles.reviewValue}>{data.email}</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>T-shirt</span>
                <span className={styles.reviewValue}>{data.tshirtSize}</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>Country</span>
                <span className={styles.reviewValue}>{data.country}</span>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.ghostButton} onClick={handleBack}>
              ← Back
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Creating…" : `Create page and register — €${selectedTier?.price ?? "—"}`}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
