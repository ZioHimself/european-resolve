import type { Tier } from "@/data/event";
import { t } from "@/locales";
import type { ParticipationType } from "./registerTypes";
import styles from "./TierCard.module.css";

const RUNNER_ONLY_REWARDS = new Set([
  "Running",
  "Running t-shirt",
]);

interface TierCardProps {
  tier: Tier;
  isSelected: boolean;
  hasSelection: boolean;
  onSelect: () => void;
  participationType: ParticipationType;
}

export function TierCard({
  tier,
  isSelected,
  hasSelection,
  onSelect,
  participationType,
}: TierCardProps) {
  const visibleRewards =
    participationType === "runner"
      ? tier.rewards
      : tier.rewards.filter((r) => !RUNNER_ONLY_REWARDS.has(r));

  return (
    <article
      className={`${styles.card} ${tier.highlighted && !hasSelection ? styles.highlighted : ""} ${isSelected ? styles.selected : ""}`}
    >
      {tier.highlighted && (
        <span className={styles.badge}>{t("tierCard.badge")}</span>
      )}
      <span className={styles.overline}>{tier.name}</span>
      <p className={styles.tagline}>{tier.tagline}</p>
      <p className={styles.price}>
        €{tier.price}
        {tier.id === "supporter" && (
          <span className={styles.priceNote}> or more</span>
        )}
      </p>
      {/*<FeeBreakdownBar
        causeFee={tier.causeFee}
        logisticsFee={tier.logisticsFee}
      />*/}
      <button
        type="button"
        className={styles.selectButton}
        onClick={onSelect}
        aria-pressed={isSelected}
      >
        {isSelected
          ? t("tierCard.selected")
          : t("tierCard.select", { tierName: tier.name })}
      </button>
      <hr className={styles.divider} />
      <ul className={styles.rewards}>
        {visibleRewards.map((reward) => (
          <li key={reward} className={styles.reward}>
            <span className={styles.check}>✓</span> {reward}
          </li>
        ))}
      </ul>
    </article>
  );
}
