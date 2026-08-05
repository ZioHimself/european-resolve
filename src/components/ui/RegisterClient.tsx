"use client";

import { useState, useEffect } from "react";
import type { Tier, TierId } from "@/data/event";
import { tiers } from "@/data/event";
import { TierGrid } from "@/components/ui/TierGrid";
import { RegistrationForm } from "@/components/ui/RegistrationForm";
import { ConfirmationPanel } from "@/components/ui/ConfirmationPanel";
import type { ParticipationType, RegisterResponse } from "./registerTypes";
import styles from "./RegisterClient.module.css";

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
  const [isRestoredSession, setIsRestoredSession] = useState(
    () => readSavedResult() !== null,
  );
  const [tokenLoading, setTokenLoading] = useState(false);

  useEffect(() => {
    if (registrationResult) return;

    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    setTokenLoading(true);

    fetch(`${apiUrl}/api/register/by-token/${encodeURIComponent(token)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.data) {
          setRegistrationResult(data.data as RegisterResponse);
        }
      })
      .catch(() => {})
      .finally(() => setTokenLoading(false));
  }, [registrationResult]);

  const selectedTier: Tier | null =
    selectedTierId
      ? (tiers.find((t) => t.id === selectedTierId) ?? null)
      : null;

  function handleRegistrationSuccess(result: RegisterResponse) {
    setRegistrationResult(result);
    setIsRestoredSession(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch { /* storage unavailable */ }
  }

  function handlePaymentConfirmed() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* storage unavailable */ }
  }

  function handleStartOver() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* storage unavailable */ }
    setRegistrationResult(null);
    setSelectedTierId(null);
  }

  if (tokenLoading) {
    return <div className={styles.wrapper} />;
  }

  return (
    <div className={styles.wrapper}>
      {registrationResult ? (
        <ConfirmationPanel
          result={registrationResult}
          isRestoredSession={isRestoredSession}
          onPaymentConfirmed={handlePaymentConfirmed}
          onStartOver={handleStartOver}
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
