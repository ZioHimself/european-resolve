import { ShareableLinkPreview } from "@/components/ui/ShareableLinkPreview";
import styles from "./FundraiseForm.module.css";

export function FundraiseForm() {
  return (
    <section className={styles.section}>
      <div className={styles.banner}>
        Registration opens soon. This is a preview of the fundraising
        experience.
      </div>

      <div className={styles.formLayout}>
        <div className={styles.photoUpload} aria-hidden="true">
          <span className={styles.photoPlaceholder}>Photo</span>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="fund-name">
              Display name
            </label>
            <input
              id="fund-name"
              type="text"
              className={styles.input}
              aria-disabled="true"
              readOnly
              tabIndex={-1}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="fund-message">
              Personal message
            </label>
            <textarea
              id="fund-message"
              className={`${styles.input} ${styles.textarea}`}
              aria-disabled="true"
              readOnly
              tabIndex={-1}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="fund-goal">
              Personal goal (€)
            </label>
            <input
              id="fund-goal"
              type="text"
              className={styles.input}
              aria-disabled="true"
              readOnly
              tabIndex={-1}
            />
          </div>
        </div>
      </div>

      <ShareableLinkPreview />

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.ghostButton}
          disabled
          aria-disabled="true"
        >
          Save draft
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          disabled
          aria-disabled="true"
        >
          Publish page →
        </button>
      </div>
    </section>
  );
}
