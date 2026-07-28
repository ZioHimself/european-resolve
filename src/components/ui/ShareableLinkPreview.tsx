import styles from "./ShareableLinkPreview.module.css";

export function ShareableLinkPreview() {
  return (
    <div className={styles.box}>
      <span className={styles.overline}>Your shareable link</span>
      <div className={styles.row}>
        <span className={styles.url}>european-resolve.org/r4u/your-name-here</span>
        <button
          type="button"
          className={styles.copyButton}
          disabled
          aria-disabled="true"
          aria-label="Copy link"
        >
          <svg
            className={styles.copyIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </button>
      </div>
    </div>
  );
}
