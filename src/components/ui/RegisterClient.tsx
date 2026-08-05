"use client";

import { useState, useEffect, useRef } from "react";
import type { Tier } from "@/data/event";
import { tiers } from "@/data/event";
import { TierGrid } from "@/components/ui/TierGrid";
import { RegistrationForm } from "@/components/ui/RegistrationForm";
import { ConfirmationPanel } from "@/components/ui/ConfirmationPanel";
import type { RegisterResponse } from "./registerTypes";
import styles from "./RegisterClient.module.css";

type TierId = "supporter" | "sprinter" | "relay-runner" | "marathoner" | "ultramarathoner";

export type RegisterStep = "pick-tier" | "registration" | "confirmation";

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

interface RegisterClientProps {
  onStepChange?: (step: RegisterStep) => void;
}

export function RegisterClient({ onStepChange }: RegisterClientProps) {
  const [selectedTierId, setSelectedTierId] = useState<TierId | null>(null);
  const [registrationResult, setRegistrationResult] =
    useState<RegisterResponse | null>(readSavedResult);
  const [isRestoredSession, setIsRestoredSession] = useState(
    () => readSavedResult() !== null,
  );
  const [tokenLoading, setTokenLoading] = useState(false);
  const [paymentJustConfirmed, setPaymentJustConfirmed] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const step: RegisterStep = registrationResult
    ? registrationResult.status === "paid" || paymentJustConfirmed
      ? "confirmation"
      : "registration"
    : selectedTierId
      ? "registration"
      : "pick-tier";

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  useEffect(() => {
    if (selectedTierId) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedTierId]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token || token === registrationResult?.paymentToken) return;

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
    setPaymentJustConfirmed(true);
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
    setPaymentJustConfirmed(false);
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
            participationType={selectedTierId === "supporter" ? "supporter" : "runner"}
          />

          {selectedTier && (
            <div ref={formRef} className={styles.formAnchor}>
              <RegistrationForm
                selectedTier={selectedTier}
                onSuccess={handleRegistrationSuccess}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
