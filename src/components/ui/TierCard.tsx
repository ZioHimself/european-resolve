import type { Tier } from "@/data/event";
import { t } from "@/locales";
import styles from "./TierCard.module.css";

interface TierCardProps {
  tier: Tier;
  isSelected: boolean;
  hasSelection: boolean;
  onSelect: () => void;
}

function splitRewards(value: string): string[] {
  return value
    .split("·")
    .map((reward) => reward.trim())
    .filter(Boolean);
}

export function TierCard({
  tier,
  isSelected,
  hasSelection,
  onSelect,
}: TierCardProps) {
  const visibleRewards = splitRewards(t(`tierCard.rewards.${tier.id}`));

  return (
    <article
      className={`${styles.card} ${tier.highlighted && !hasSelection ? styles.highlighted : ""} ${isSelected ? styles.selected : ""}`}
    >
      {tier.highlighted && (
        <span className={styles.badge}>{t("tierCard.badge")}</span>
      )}
      <span className={styles.overline}>{tier.name}</span>
      <p className={styles.tagline}>{t(`tierCard.tagline.${tier.id}`)}</p>
      <p className={styles.price}>
        €{tier.price}
        {tier.id === "supporter" && (
          <span className={styles.priceNote}> or more</span>
        )}
      </p>
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
