import { tiers } from "@/data/event";
import { TierCard } from "@/components/ui/TierCard";
import styles from "./TierGrid.module.css";

type TierId = "supporter" | "champion" | "patron";

interface TierGridProps {
  selectedTierId: TierId | null;
  onSelectTier: (id: TierId) => void;
}

export function TierGrid({ selectedTierId, onSelectTier }: TierGridProps) {
  return (
    <div className={styles.grid}>
      {tiers.map((tier) => (
        <TierCard
          key={tier.id}
          tier={tier}
          isSelected={tier.id === selectedTierId}
          onSelect={() => onSelectTier(tier.id)}
        />
      ))}
    </div>
  );
}
