import { useState } from "react";
import type { Tier } from "@/data/event";
import { t } from "@/locales";
import type {
  ParticipationType,
  RegisterResponse,
  ValidationError,
} from "./registerTypes";
import styles from "./RegistrationForm.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface RegistrationFormProps {
  selectedTier: Tier | null;
  participationType: ParticipationType;
  onParticipationTypeChange: (type: ParticipationType) => void;
  onSuccess: (result: RegisterResponse) => void;
}

export function RegistrationForm({
  selectedTier,
  participationType,
  onParticipationTypeChange,
  onSuccess,
}: RegistrationFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tshirtSize, setTshirtSize] = useState("M");
  const [language, setLanguage] = useState("English");
  const [country, setCountry] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [commsOptin, setCommsOptin] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRunner = participationType === "runner";

  function validateForm(): ValidationError[] {
    const errs: ValidationError[] = [];

    if (!fullName.trim()) {
      errs.push({ field: "fullName", message: t("register.errorFullName") });
    }
    if (!email.trim() || !EMAIL_REGEX.test(email)) {
      errs.push({ field: "email", message: t("register.errorEmail") });
    }
    if (isRunner && !tshirtSize) {
      errs.push({ field: "tshirtSize", message: t("register.errorTshirt") });
    }
    if (!country.trim()) {
      errs.push({ field: "country", message: t("register.errorCountry") });
    }
    if (!gdprConsent) {
      errs.push({ field: "gdprConsent", message: t("register.errorGdpr") });
    }

    return errs;
  }

  function fieldError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!selectedTier) return;

    setErrors([]);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          ...(isRunner ? { tshirtSize } : {}),
          language,
          country: country.trim(),
          tierId: selectedTier.id,
          participationType,
          gdprConsent,
          commsOptin,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrors(data.errors ?? [{ field: "_global", message: t("register.failedFallback") }]);
        return;
      }

      onSuccess(data.data as RegisterResponse);
    } catch {
      setErrors([
        { field: "_global", message: t("register.networkError") },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.section}>
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.heading}>{t("register.heading")}</h2>

        <fieldset className={styles.toggleFieldset}>
          <legend className={styles.toggleLegend}>
            {t("register.howParticipate")}
          </legend>
          <div className={styles.toggle}>
            <button
              type="button"
              className={`${styles.toggleOption} ${isRunner ? styles.toggleActive : ""}`}
              onClick={() => onParticipationTypeChange("runner")}
              aria-pressed={isRunner}
            >
              {t("register.runOnDay")}
            </button>
            <button
              type="button"
              className={`${styles.toggleOption} ${!isRunner ? styles.toggleActive : ""}`}
              onClick={() => onParticipationTypeChange("supporter")}
              aria-pressed={!isRunner}
            >
              {t("register.supportAnywhere")}
            </button>
          </div>
        </fieldset>

        {errors.length > 0 && (
          <div className={styles.errorSummary} role="alert">
            <strong>{t("register.errorSummary")}</strong>
            <ul>
              {errors.map((err) => (
                <li key={`${err.field}-${err.message}`}>{err.code ? t(`errors.${err.code}`) || err.message : err.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-name">
              {t("register.fullName")}
            </label>
            <input
              id="reg-name"
              type="text"
              className={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-invalid={!!fieldError("fullName")}
            />
            {fieldError("fullName") && (
              <span className={styles.fieldError}>{fieldError("fullName")}</span>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-email">
              {t("register.email")}
            </label>
            <input
              id="reg-email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!fieldError("email")}
            />
            {fieldError("email") && (
              <span className={styles.fieldError}>{fieldError("email")}</span>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-phone">
              {t("register.phone")}{" "}
              <span className={styles.optional}>{t("register.optional")}</span>
            </label>
            <input
              id="reg-phone"
              type="tel"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {isRunner && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-tshirt">
                {t("register.tshirtSize")}
              </label>
              <select
                id="reg-tshirt"
                className={styles.input}
                value={tshirtSize}
                onChange={(e) => setTshirtSize(e.target.value)}
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-language">
              {t("register.language")}
            </label>
            <select
              id="reg-language"
              className={styles.input}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="French">French</option>
              <option value="Ukrainian">Ukrainian</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-country">
              {t("register.country")}
            </label>
            <input
              id="reg-country"
              type="text"
              className={styles.input}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              aria-invalid={!!fieldError("country")}
            />
            {fieldError("country") && (
              <span className={styles.fieldError}>{fieldError("country")}</span>
            )}
          </div>
        </div>

        <div className={styles.checkboxes}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              aria-invalid={!!fieldError("gdprConsent")}
            />
            <span>
              <strong>{t("register.gdprHeading")}</strong>.{" "}
              {isRunner
                ? t("register.gdprRunner")
                : t("register.gdprSupporter")}
            </span>
          </label>
          {fieldError("gdprConsent") && (
            <span className={styles.fieldError}>
              {fieldError("gdprConsent")}
            </span>
          )}
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={commsOptin}
              onChange={(e) => setCommsOptin(e.target.checked)}
            />
            <span>
              <strong>{t("register.commsHeading")}</strong>.{" "}
              {t("register.commsText")}
            </span>
          </label>
        </div>

        <div className={styles.footer}>
          <span className={styles.total}>
            {selectedTier
              ? t("register.total", { price: String(selectedTier.price) })
              : t("register.totalEmpty")}
          </span>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!selectedTier || isSubmitting}
          >
            {isSubmitting
              ? t("register.submitting")
              : selectedTier
                ? isRunner
                  ? t("register.submitRunner", { price: String(selectedTier.price) })
                  : t("register.submitSupporter", { price: String(selectedTier.price) })
                : t("register.selectTier")}
          </button>
        </div>
      </form>
    </section>
  );
}
