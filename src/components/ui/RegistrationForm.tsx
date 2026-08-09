import { useState } from "react";
import type { Tier } from "@/data/event";
import { t } from "@/locales";
import { useLocale } from "@/components/ui/LocaleProvider";
import type { RegisterResponse, ValidationError } from "./registerTypes";
import styles from "./RegistrationForm.module.css";
import { redactEmail, regFlowLog } from "@/lib/registrationFlowLog";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const LOCALE_TO_LANGUAGE: Record<string, string> = {
  en: "English",
  fr: "French",
  uk: "Ukrainian",
  nl: "Dutch",
  de: "German",
};

interface RegistrationFormProps {
  selectedTier: Tier;
  onSuccess: (result: RegisterResponse) => void;
}

export function RegistrationForm({
  selectedTier,
  onSuccess,
}: RegistrationFormProps) {
  const { locale } = useLocale();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [socksSize, setSocksSize] = useState("36-39");
  const [tshirtSize, setTshirtSize] = useState("M");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [commsOptin, setCommsOptin] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSupporter = selectedTier.id === "supporter";
  const isRunner = !isSupporter;
  const needsSocksSize = selectedTier.id === "relay-runner";
  const needsTshirtSize = selectedTier.id === "marathoner";
  const participationType = isSupporter ? "supporter" : "runner";

  function validateForm(): ValidationError[] {
    const errs: ValidationError[] = [];

    if (!firstName.trim()) {
      errs.push({ field: "firstName", message: t("register.errorFirstName") });
    }
    if (!lastName.trim()) {
      errs.push({ field: "lastName", message: t("register.errorLastName") });
    }
    if (!email.trim() || !EMAIL_REGEX.test(email)) {
      errs.push({ field: "email", message: t("register.errorEmail") });
    }
    if (needsSocksSize && !socksSize) {
      errs.push({ field: "socksSize", message: t("register.errorSocks") });
    }
    if (needsTshirtSize && !tshirtSize) {
      errs.push({ field: "tshirtSize", message: t("register.errorTshirt") });
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
      regFlowLog.registrationFormWarn("client validation failed", {
        tierId: selectedTier.id,
        fields: validationErrors.map((err) => err.field),
      });
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsSubmitting(true);
    regFlowLog.registrationForm("submitting registration", {
      tierId: selectedTier.id,
      participationType,
      email: redactEmail(email),
    });

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          ...(needsTshirtSize ? { tshirtSize } : {}),
          ...(needsSocksSize ? { socksSize } : {}),
          language: LOCALE_TO_LANGUAGE[locale] ?? "English",
          tierId: selectedTier.id,
          participationType,
          gdprConsent,
          commsOptin,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        regFlowLog.registrationFormWarn("registration API rejected", {
          status: res.status,
          errors: data.errors?.map((err: ValidationError) => err.field ?? err.code),
        });
        setErrors(data.errors ?? [{ field: "_global", message: t("register.failedFallback") }]);
        return;
      }

      regFlowLog.registrationForm("registration API accepted", {
        participantId: data.data?.participantId,
        tierId: data.data?.tierId,
        amountEur: data.data?.amountEur,
      });
      onSuccess(data.data as RegisterResponse);
    } catch {
      regFlowLog.registrationFormError("registration API network error");
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
        <p className={styles.description}>
          {isSupporter
            ? t("register.descriptionSupporter")
            : t("register.descriptionRunner")}
        </p>

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
            <label className={styles.label} htmlFor="reg-first-name">
              {t("register.firstName")}
            </label>
            <input
              id="reg-first-name"
              type="text"
              className={styles.input}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              aria-invalid={!!fieldError("firstName")}
            />
            {fieldError("firstName") && (
              <span className={styles.fieldError}>{fieldError("firstName")}</span>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-last-name">
              {t("register.lastName")}
            </label>
            <input
              id="reg-last-name"
              type="text"
              className={styles.input}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              aria-invalid={!!fieldError("lastName")}
            />
            {fieldError("lastName") && (
              <span className={styles.fieldError}>{fieldError("lastName")}</span>
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
          {needsSocksSize && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-socks">
                {t("register.socksSize")}
              </label>
              <select
                id="reg-socks"
                className={styles.input}
                value={socksSize}
                onChange={(e) => setSocksSize(e.target.value)}
                aria-invalid={!!fieldError("socksSize")}
              >
                <option value="36-39">36–39</option>
                <option value="40-42">40–42</option>
                <option value="43-46">43–46</option>
              </select>
              {fieldError("socksSize") && (
                <span className={styles.fieldError}>{fieldError("socksSize")}</span>
              )}
            </div>
          )}
          {needsTshirtSize && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-tshirt">
                {t("register.tshirtSize")}
              </label>
              <select
                id="reg-tshirt"
                className={styles.input}
                value={tshirtSize}
                onChange={(e) => setTshirtSize(e.target.value)}
                aria-invalid={!!fieldError("tshirtSize")}
              >
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
              {fieldError("tshirtSize") && (
                <span className={styles.fieldError}>{fieldError("tshirtSize")}</span>
              )}
            </div>
          )}
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
                : t("register.gdprSupporter")}{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy →
              </a>
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
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? t("register.submitting") : t("register.continue")}
          </button>
        </div>
      </form>
    </section>
  );
}
