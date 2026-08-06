import { tiers } from "@/data/event";
import { TierCard } from "@/components/ui/TierCard";
import styles from "./TierGrid.module.css";

type TierId = "supporter" | "sprinter" | "relay-runner" | "marathoner" | "ultramarathoner";

interface TierGridProps {
  selectedTierId: TierId | null;
  onSelectTier: (id: TierId) => void;
}

export function TierGrid({
  selectedTierId,
  onSelectTier,
}: TierGridProps) {
  return (
    <div className={styles.grid}>
      {tiers.map((tier) => (
        <TierCard
          key={tier.id}
          tier={tier}
          isSelected={tier.id === selectedTierId}
          hasSelection={selectedTierId !== null}
          onSelect={() => onSelectTier(tier.id)}
        />
      ))}
    </div>
  );
}
