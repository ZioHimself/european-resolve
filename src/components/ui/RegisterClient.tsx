"use client";

import { useState } from "react";
import type { Tier } from "@/data/event";
import { tiers } from "@/data/event";
import { TierGrid } from "@/components/ui/TierGrid";
import { RegistrationForm } from "@/components/ui/RegistrationForm";
import { ConfirmationPanel } from "@/components/ui/ConfirmationPanel";
import type { RegisterResponse } from "./registerTypes";
import styles from "./RegisterClient.module.css";

type TierId = "supporter" | "champion" | "patron";

export function RegisterClient() {
  const [selectedTierId, setSelectedTierId] = useState<TierId | null>(null);
  const [registrationResult, setRegistrationResult] =
    useState<RegisterResponse | null>(null);

  const selectedTier: Tier | null =
    selectedTierId
      ? (tiers.find((t) => t.id === selectedTierId) ?? null)
      : null;

  return (
    <div className={styles.wrapper}>
      <TierGrid
        selectedTierId={selectedTierId}
        onSelectTier={setSelectedTierId}
      />

      <p className={styles.paymentNotice}>
        All tiers are paid via Monobank jar (Visa/Mastercard only). Bancontact
        and bank transfers are not supported.
      </p>

      {registrationResult ? (
        <ConfirmationPanel result={registrationResult} />
      ) : (
        <RegistrationForm
          selectedTier={selectedTier}
          onSuccess={setRegistrationResult}
        />
      )}
    </div>
  );
}
