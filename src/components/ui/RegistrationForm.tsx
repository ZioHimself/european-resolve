import styles from "./RegistrationForm.module.css";

export function RegistrationForm() {
  return (
    <section className={styles.section}>
      <div className={styles.banner}>
        Registration opens soon. This is a preview of the registration
        experience.
      </div>

      <h2 className={styles.heading}>Your details</h2>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-name">
            Full name
          </label>
          <input
            id="reg-name"
            type="text"
            className={styles.input}
            aria-disabled="true"
            readOnly
            tabIndex={-1}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-email">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            className={styles.input}
            aria-disabled="true"
            readOnly
            tabIndex={-1}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-phone">
            Phone
          </label>
          <input
            id="reg-phone"
            type="tel"
            className={styles.input}
            aria-disabled="true"
            readOnly
            tabIndex={-1}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-tshirt">
            T-shirt size
          </label>
          <select
            id="reg-tshirt"
            className={styles.input}
            aria-disabled="true"
            tabIndex={-1}
          >
            <option>XS</option>
            <option>S</option>
            <option>M</option>
            <option>L</option>
            <option>XL</option>
            <option>XXL</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-language">
            Language
          </label>
          <select
            id="reg-language"
            className={styles.input}
            aria-disabled="true"
            tabIndex={-1}
          >
            <option>English</option>
            <option>French</option>
            <option>Ukrainian</option>
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
            aria-disabled="true"
            readOnly
            tabIndex={-1}
          />
        </div>
      </div>

      <div className={styles.checkboxes}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            aria-disabled="true"
            tabIndex={-1}
            className={styles.checkbox}
          />
          <span>
            <strong>GDPR consent (required)</strong>. I agree to my data being
            processed for the purpose of race registration and safety, in line
            with the privacy notice.
          </span>
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            aria-disabled="true"
            tabIndex={-1}
            className={styles.checkbox}
          />
          <span>
            <strong>Ongoing communications (optional)</strong>. Send me news
            about future editions and the beneficiary&apos;s work. I can
            unsubscribe at any time.
          </span>
        </label>
      </div>

      <div className={styles.footer}>
        <span className={styles.total}>Total: €&mdash;</span>
        <button
          type="button"
          className={styles.submitButton}
          disabled
          aria-disabled="true"
        >
          Continue to payment →
        </button>
      </div>
    </section>
  );
}
