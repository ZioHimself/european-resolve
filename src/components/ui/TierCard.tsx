import type { Tier } from "@/data/event";
import { FeeBreakdownBar } from "@/components/ui/FeeBreakdownBar";
import type { ParticipationType } from "./registerTypes";
import styles from "./TierCard.module.css";

const RUNNER_ONLY_REWARDS = new Set([
  "Race bib",
  "Finisher medal",
  "Technical race t-shirt",
  "Finisher pack",
  "Reserved starting corral",
  "Post-race reception invite",
  "Embroidered finisher hoodie",
]);

interface TierCardProps {
  tier: Tier;
  isSelected: boolean;
  onSelect: () => void;
  participationType: ParticipationType;
}

export function TierCard({
  tier,
  isSelected,
  onSelect,
  participationType,
}: TierCardProps) {
  const visibleRewards =
    participationType === "runner"
      ? tier.rewards
      : tier.rewards.filter((r) => !RUNNER_ONLY_REWARDS.has(r));

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
        {visibleRewards.map((reward) => (
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
