import styles from "./ShareableLinkPreview.module.css";

export function ShareableLinkPreview() {
  return (
    <div className={styles.box}>
      <span className={styles.overline}>Your shareable link</span>
      <div className={styles.row}>
        <span className={styles.url}>uidrun.eu/p/your-name-here</span>
        <button
          type="button"
          className={styles.copyButton}
          disabled
          aria-disabled="true"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
