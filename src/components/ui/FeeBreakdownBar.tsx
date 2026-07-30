import { t } from "@/locales";
import styles from "./FeeBreakdownBar.module.css";

export function FeeBreakdownBar({
  causeFee,
  logisticsFee,
}: {
  causeFee: number;
  logisticsFee: number;
}) {
  const total = causeFee + logisticsFee;
  const causePercent = (causeFee / total) * 100;
  const logisticsPercent = (logisticsFee / total) * 100;

  return (
    <div className={styles.container}>
      <span className={styles.overline}>{t("feeBreakdown.overline")}</span>
      <div className={styles.bar}>
        <div
          className={styles.causeSegment}
          style={{ width: `${causePercent}%` }}
        />
        <div
          className={styles.logisticsSegment}
          style={{ width: `${logisticsPercent}%` }}
        />
      </div>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.dotCause} />
          €{causeFee} {t("feeBreakdown.cause")}
        </span>
        <span className={styles.legendItem}>
          <span className={styles.dotLogistics} />
          €{logisticsFee} {t("feeBreakdown.logistics")}
        </span>
      </div>
    </div>
  );
}
