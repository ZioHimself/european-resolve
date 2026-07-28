import type { Tier } from "@/data/event";
import { FeeBreakdownBar } from "@/components/ui/FeeBreakdownBar";
import styles from "./TierCard.module.css";

interface TierCardProps {
  tier: Tier;
  isSelected: boolean;
  onSelect: () => void;
}

export function TierCard({ tier, isSelected, onSelect }: TierCardProps) {
  return (
    <article
      className={`${styles.card} ${tier.highlighted ? styles.highlighted : ""} ${isSelected ? styles.selected : ""}`}
    >
      {tier.highlighted && <span className={styles.badge}>Most chosen</span>}
      <span className={styles.overline}>{tier.name}</span>
      <p className={styles.price}>€{tier.price}</p>
      <FeeBreakdownBar
        causeFee={tier.causeFee}
        logisticsFee={tier.logisticsFee}
      />
      <ul className={styles.rewards}>
        {tier.rewards.map((reward) => (
          <li key={reward} className={styles.reward}>
            <span className={styles.check}>✓</span> {reward}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={styles.selectButton}
        onClick={onSelect}
        aria-pressed={isSelected}
      >
        {isSelected ? "Selected" : "Select"}
      </button>
    </article>
  );
}
