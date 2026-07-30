import { tiers } from "@/data/event";
import { TierCard } from "@/components/ui/TierCard";
import type { ParticipationType } from "./registerTypes";
import styles from "./TierGrid.module.css";

type TierId = "supporter" | "champion" | "patron";

interface TierGridProps {
  selectedTierId: TierId | null;
  onSelectTier: (id: TierId) => void;
  participationType: ParticipationType;
}

export function TierGrid({
  selectedTierId,
  onSelectTier,
  participationType,
}: TierGridProps) {
  return (
    <div className={styles.grid}>
      {tiers.map((tier) => (
        <TierCard
          key={tier.id}
          tier={tier}
          isSelected={tier.id === selectedTierId}
          onSelect={() => onSelectTier(tier.id)}
          participationType={participationType}
        />
      ))}
    </div>
  );
}
