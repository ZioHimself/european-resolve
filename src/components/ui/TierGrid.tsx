import { tiers } from "@/data/event";
import { TierCard } from "@/components/ui/TierCard";
import styles from "./TierGrid.module.css";

export function TierGrid() {
  return (
    <div className={styles.grid}>
      {tiers.map((tier) => (
        <TierCard key={tier.id} tier={tier} />
      ))}
    </div>
  );
}
