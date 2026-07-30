import { useState } from "react";
import type { Tier } from "@/data/event";
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
      errs.push({ field: "fullName", message: "Full name is required" });
    }
    if (!email.trim() || !EMAIL_REGEX.test(email)) {
      errs.push({
        field: "email",
        message: "Valid email address is required",
      });
    }
    if (isRunner && !tshirtSize) {
      errs.push({ field: "tshirtSize", message: "T-shirt size is required" });
    }
    if (!country.trim()) {
      errs.push({ field: "country", message: "Country is required" });
    }
    if (!gdprConsent) {
      errs.push({
        field: "gdprConsent",
        message: "GDPR consent is required to register",
      });
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
        setErrors(data.errors ?? [{ field: "_global", message: "Registration failed. Please try again." }]);
        return;
      }

      onSuccess(data.data as RegisterResponse);
    } catch {
      setErrors([
        {
          field: "_global",
          message:
            "Could not connect to the registration server. Please try again later.",
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.section}>
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.heading}>Your details</h2>

        <fieldset className={styles.toggleFieldset}>
          <legend className={styles.toggleLegend}>
            How will you participate?
          </legend>
          <div className={styles.toggle}>
            <button
              type="button"
              className={`${styles.toggleOption} ${isRunner ? styles.toggleActive : ""}`}
              onClick={() => onParticipationTypeChange("runner")}
              aria-pressed={isRunner}
            >
              I&apos;ll run on the day
            </button>
            <button
              type="button"
              className={`${styles.toggleOption} ${!isRunner ? styles.toggleActive : ""}`}
              onClick={() => onParticipationTypeChange("supporter")}
              aria-pressed={!isRunner}
            >
              I&apos;ll support from anywhere
            </button>
          </div>
        </fieldset>

        {errors.length > 0 && (
          <div className={styles.errorSummary} role="alert">
            <strong>Please fix the following:</strong>
            <ul>
              {errors.map((err) => (
                <li key={`${err.field}-${err.message}`}>{err.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-name">
              Full name
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
              Email
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
              Phone <span className={styles.optional}>(optional)</span>
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
                T-shirt size
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
              Language
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
              Country
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
              <strong>GDPR consent (required)</strong>. I agree to my data being
              processed for the purpose of{" "}
              {isRunner
                ? "race registration and safety"
                : "event registration and donation tracking"}
              , in line with the privacy notice.
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
              <strong>Ongoing communications (optional)</strong>. Send me news
              about future editions and the beneficiary&apos;s work. I can
              unsubscribe at any time.
            </span>
          </label>
        </div>

        <div className={styles.footer}>
          <span className={styles.total}>
            Total: {selectedTier ? `€${selectedTier.price}` : "€—"}
          </span>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!selectedTier || isSubmitting}
          >
            {isSubmitting
              ? "Registering..."
              : selectedTier
                ? isRunner
                  ? `Register — €${selectedTier.price}`
                  : `Support — €${selectedTier.price}`
                : "Select a tier to register"}
          </button>
        </div>
      </form>
    </section>
  );
}
