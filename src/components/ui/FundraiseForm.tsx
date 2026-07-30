"use client";

import { useState, useRef } from "react";
import { TierGrid } from "@/components/ui/TierGrid";
import { tiers } from "@/data/event";
import { t } from "@/locales";
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
      errs.displayName = t("fundraise.errorDisplayName");
    }
    if (!data.message.trim()) {
      errs.message = t("fundraise.errorMessageRequired");
    } else if (data.message.trim().length > 500) {
      errs.message = t("fundraise.errorMessageLength");
    }
    const goal = Number(data.goalEur);
    if (!data.goalEur || isNaN(goal) || goal < 10 || goal > 100000 || !Number.isInteger(goal)) {
      errs.goalEur = t("fundraise.errorGoal");
    }
    return errs;
  }

  function validateStep2(): FormErrors {
    const errs: FormErrors = {};
    if (!data.tierId) {
      errs.tierId = t("fundraise.errorTier");
    }
    if (!data.fullName.trim()) {
      errs.fullName = t("fundraise.errorFullName");
    }
    if (!data.email.trim() || !EMAIL_REGEX.test(data.email)) {
      errs.email = t("fundraise.errorEmail");
    }
    if (!data.country.trim()) {
      errs.country = t("fundraise.errorCountry");
    }
    if (!data.gdprConsent) {
      errs.gdprConsent = t("fundraise.errorGdpr");
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
      setErrors((prev) => ({ ...prev, photo: t("fundraise.errorPhoto") }));
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, photo: t("fundraise.errorPhotoType") }));
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
        for (const err of (json.errors ?? []) as { field: string; message: string; code?: string }[]) {
          apiErrors[err.field] = err.code ? t(`errors.${err.code}`) || err.message : err.message;
        }
        setErrors(Object.keys(apiErrors).length > 0 ? apiErrors : { global: t("fundraise.globalError") });
        if (apiErrors.displayName || apiErrors.message || apiErrors.goalEur || apiErrors.photo) {
          setStep(1);
        } else if (Object.keys(apiErrors).length > 0) {
          setStep(2);
        }
        return;
      }

      setResult(json.data);
    } catch {
      setErrors({ global: t("fundraise.networkError") });
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

  const selectedTier = data.tierId ? tiers.find((tier) => tier.id === data.tierId) : null;

  return (
    <section className={styles.section}>
      <div className={styles.stepIndicator}>
        <span className={step >= 1 ? styles.stepActive : styles.stepInactive}>
          {t("fundraise.step1")}
        </span>
        <span className={styles.stepDivider}>→</span>
        <span className={step >= 2 ? styles.stepActive : styles.stepInactive}>
          {t("fundraise.step2")}
        </span>
        <span className={styles.stepDivider}>→</span>
        <span className={step >= 3 ? styles.stepActive : styles.stepInactive}>
          {t("fundraise.step3")}
        </span>
      </div>

      {errors.global && <p className={styles.errorGlobal}>{errors.global}</p>}

      {step === 1 && (
        <div className={styles.card}>
          <h2 className={styles.stepHeading}>{t("fundraise.step1Heading")}</h2>
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
                <span className={styles.photoPlaceholder}>{t("fundraise.photoLabel")}</span>
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
                  {t("fundraise.displayName")}
                </label>
                <input
                  id="fund-name"
                  type="text"
                  className={styles.input}
                  value={data.displayName}
                  onChange={(e) => update({ displayName: e.target.value })}
                  maxLength={50}
                  placeholder={t("fundraise.displayNamePlaceholder")}
                />
                {errors.displayName && <p className={styles.error}>{errors.displayName}</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="fund-message">
                  {t("fundraise.personalMessage")}
                </label>
                <textarea
                  id="fund-message"
                  className={`${styles.input} ${styles.textarea}`}
                  value={data.message}
                  onChange={(e) => update({ message: e.target.value })}
                  maxLength={500}
                  placeholder={t("fundraise.messagePlaceholder")}
                />
                <span className={styles.charCount}>
                  {t("common.charCount", { count: String(data.message.length), max: "500" })}
                </span>
                {errors.message && <p className={styles.error}>{errors.message}</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="fund-goal">
                  {t("fundraise.goalLabel")}
                </label>
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
              {t("fundraise.nextRunner")}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={styles.card}>
          <h2 className={styles.stepHeading}>{t("fundraise.step2Heading")}</h2>

          {errors.tierId && <p className={styles.error}>{errors.tierId}</p>}
          <TierGrid
            selectedTierId={data.tierId}
            onSelectTier={(id) => update({ tierId: id })}
            participationType="runner"
          />

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-name">
                {t("fundraise.fullName")}
              </label>
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
              <label className={styles.label} htmlFor="reg-email">
                {t("fundraise.email")}
              </label>
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
                {t("fundraise.phone")}{" "}
                <span className={styles.optional}>{t("common.optional")}</span>
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
              <label className={styles.label} htmlFor="reg-tshirt">
                {t("fundraise.tshirtSize")}
              </label>
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
              <label className={styles.label} htmlFor="reg-language">
                {t("fundraise.language")}
              </label>
              <select
                id="reg-language"
                className={styles.input}
                value={data.language}
                onChange={(e) => update({ language: e.target.value })}
              >
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="Ukrainian">Ukrainian</option>
                <option value="Dutch">Dutch</option>
                <option value="German">German</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-country">
                {t("fundraise.country")}
              </label>
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
                <strong>{t("fundraise.gdprHeading")}</strong>.{" "}
                {t("fundraise.gdprText")}
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
                <strong>{t("fundraise.commsHeading")}</strong>.{" "}
                {t("fundraise.commsText")}
              </span>
            </label>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.ghostButton} onClick={handleBack}>
              {t("fundraise.back")}
            </button>
            <button type="button" className={styles.primaryButton} onClick={handleNext}>
              {t("fundraise.nextReview")}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={styles.card}>
          <h2 className={styles.stepHeading}>{t("fundraise.step3Heading")}</h2>

          <div className={styles.reviewSection}>
            <h3 className={styles.reviewLabel}>{t("fundraise.reviewPage")}</h3>
            <div className={styles.reviewGrid}>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>{t("fundraise.reviewDisplayName")}</span>
                <span className={styles.reviewValue}>{data.displayName}</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>{t("fundraise.reviewMessage")}</span>
                <span className={styles.reviewValue}>
                  {data.message.slice(0, 80)}{data.message.length > 80 ? "\u2026" : ""}
                </span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>{t("fundraise.reviewGoal")}</span>
                <span className={styles.reviewValue}>
                  €{Number(data.goalEur).toLocaleString("en-GB")}
                </span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>{t("fundraise.reviewPhoto")}</span>
                <span className={styles.reviewValue}>
                  {data.photoFile ? t("fundraise.reviewUploaded") : t("fundraise.reviewNone")}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.reviewSection}>
            <h3 className={styles.reviewLabel}>{t("fundraise.reviewRegistration")}</h3>
            <div className={styles.reviewGrid}>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>{t("fundraise.reviewTier")}</span>
                <span className={styles.reviewValue}>
                  {selectedTier ? `${selectedTier.name} — €${selectedTier.price}` : "—"}
                </span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>{t("fundraise.reviewFullName")}</span>
                <span className={styles.reviewValue}>{data.fullName}</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>{t("fundraise.reviewEmail")}</span>
                <span className={styles.reviewValue}>{data.email}</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>{t("fundraise.reviewTshirt")}</span>
                <span className={styles.reviewValue}>{data.tshirtSize}</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>{t("fundraise.reviewCountry")}</span>
                <span className={styles.reviewValue}>{data.country}</span>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.ghostButton} onClick={handleBack}>
              {t("fundraise.back")}
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? t("fundraise.submitting")
                : t("fundraise.submitButton", { price: String(selectedTier?.price ?? "—") })}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
