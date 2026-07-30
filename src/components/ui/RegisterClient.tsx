"use client";

import { useState } from "react";
import type { Tier } from "@/data/event";
import { tiers } from "@/data/event";
import { TierGrid } from "@/components/ui/TierGrid";
import { RegistrationForm } from "@/components/ui/RegistrationForm";
import { ConfirmationPanel } from "@/components/ui/ConfirmationPanel";
import type { ParticipationType, RegisterResponse } from "./registerTypes";
import styles from "./RegisterClient.module.css";

type TierId = "supporter" | "champion" | "patron";

const STORAGE_KEY = "r4u:registration";

function readSavedResult(): RegisterResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function RegisterClient() {
  const [selectedTierId, setSelectedTierId] = useState<TierId | null>(null);
  const [participationType, setParticipationType] =
    useState<ParticipationType>("runner");
  const [registrationResult, setRegistrationResult] =
    useState<RegisterResponse | null>(readSavedResult);

  const selectedTier: Tier | null =
    selectedTierId
      ? (tiers.find((t) => t.id === selectedTierId) ?? null)
      : null;

  function handleRegistrationSuccess(result: RegisterResponse) {
    setRegistrationResult(result);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch { /* storage unavailable */ }
  }

  function handlePaymentConfirmed() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* storage unavailable */ }
  }

  return (
    <div className={styles.wrapper}>
      {registrationResult ? (
        <ConfirmationPanel
          result={registrationResult}
          onPaymentConfirmed={handlePaymentConfirmed}
        />
      ) : (
        <>
          <TierGrid
            selectedTierId={selectedTierId}
            onSelectTier={setSelectedTierId}
            participationType={participationType}
          />

          <RegistrationForm
            selectedTier={selectedTier}
            participationType={participationType}
            onParticipationTypeChange={setParticipationType}
            onSuccess={handleRegistrationSuccess}
          />
        </>
      )}
    </div>
  );
}
