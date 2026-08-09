"use client";

import { useState, useEffect, useRef } from "react";
import type { Tier } from "@/data/event";
import { tiers } from "@/data/event";
import { TierGrid } from "@/components/ui/TierGrid";
import { RegistrationForm } from "@/components/ui/RegistrationForm";
import { ConfirmationPanel } from "@/components/ui/ConfirmationPanel";
import { t } from "@/locales";
import type { RegisterResponse } from "./registerTypes";
import styles from "./RegisterClient.module.css";
import { regFlowLog, tokenHint } from "@/lib/registrationFlowLog";

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

// A payment provider redirect (e.g. scanning a QR code with a different
// device) can land here with no `token` and no session on this device at
// all — there's no way to know which registration it belongs to. Show a
// generic thank-you instead of the tier grid.
function hasOrphanedPaymentReturn(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect_status") === "succeeded" && !params.get("token");
}

function scrollToFormAnchor(el: HTMLElement | null): void {
  if (!el || typeof el.scrollIntoView !== "function") return;
  // `auto` is more reliable on mobile than `smooth`, which some browsers
  // block when the scroll isn't in the same turn as the tap.
  el.scrollIntoView({ behavior: "auto", block: "start" });
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
  const [paymentReceivedElsewhere] = useState(hasOrphanedPaymentReturn);
  const formRef = useRef<HTMLDivElement>(null);

  const step: RegisterStep = registrationResult
    ? registrationResult.status === "paid" || paymentJustConfirmed
      ? "confirmation"
      : "registration"
    : paymentReceivedElsewhere
      ? "confirmation"
      : selectedTierId
        ? "registration"
        : "pick-tier";

  useEffect(() => {
    onStepChange?.(step);
    regFlowLog.registerClient("step changed", { step });
  }, [step, onStepChange]);

  useEffect(() => {
    regFlowLog.registerClient("mounted", {
      step,
      hasRestoredSession: isRestoredSession,
      hasRegistrationResult: registrationResult !== null,
      paymentReceivedElsewhere,
      participantId: registrationResult?.participantId,
      paymentToken: registrationResult
        ? tokenHint(registrationResult.paymentToken)
        : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- log initial mount only
  }, []);

  useEffect(() => {
    if (!selectedTierId) return;
    const frame = requestAnimationFrame(() => {
      scrollToFormAnchor(formRef.current);
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedTierId]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token || token === registrationResult?.paymentToken) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    setTokenLoading(true);
    regFlowLog.registerClient("fetching registration by URL token", {
      token: tokenHint(token),
    });

    fetch(`${apiUrl}/api/register/by-token/${encodeURIComponent(token)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.data) {
          regFlowLog.registerClient("registration loaded from URL token", {
            participantId: data.data.participantId,
            tierId: data.data.tierId,
            token: tokenHint(data.data.paymentToken ?? token),
          });
          setRegistrationResult(data.data as RegisterResponse);
        } else {
          regFlowLog.registerClientWarn("URL token lookup returned no registration");
        }
      })
      .catch(() => {
        regFlowLog.registerClientWarn("URL token lookup failed");
      })
      .finally(() => setTokenLoading(false));
  }, [registrationResult]);

  const selectedTier: Tier | null =
    selectedTierId
      ? (tiers.find((t) => t.id === selectedTierId) ?? null)
      : null;

  function handleRegistrationSuccess(result: RegisterResponse) {
    regFlowLog.registerClient("registration API success", {
      participantId: result.participantId,
      tierId: result.tierId,
      tierName: result.tierName,
      amountEur: result.amountEur,
      paymentToken: tokenHint(result.paymentToken),
    });
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
    regFlowLog.registerClient("start over");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* storage unavailable */ }
    setRegistrationResult(null);
    setSelectedTierId(null);
    setPaymentJustConfirmed(false);
  }

  function handleSelectTier(id: TierId) {
    regFlowLog.registerClient("tier selected", { tierId: id });
    setSelectedTierId(id);
    onStepChange?.("registration");
  }

  function handleChangeTier() {
    regFlowLog.registerClient("tier selection cleared");
    setSelectedTierId(null);
    onStepChange?.("pick-tier");
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
      ) : paymentReceivedElsewhere ? (
        <section className={styles.paymentReceivedPanel}>
          <div className={styles.paymentReceivedIcon} aria-hidden="true">
            ✓
          </div>
          <h2 className={styles.paymentReceivedHeading}>
            {t("register.paymentReceivedHeading")}
          </h2>
          <p className={styles.paymentReceivedMessage}>
            {t("register.paymentReceivedMessage")}
          </p>
        </section>
      ) : (
        <>
          {!selectedTier ? (
            <TierGrid
              selectedTierId={selectedTierId}
              onSelectTier={handleSelectTier}
            />
          ) : (
            <div ref={formRef} className={styles.formAnchor}>
              <div className={styles.selectedTierBar}>
                <p className={styles.selectedTierLabel}>
                  {selectedTier.name} · €{selectedTier.price}
                  {selectedTier.id === "supporter" && (
                    <span className={styles.selectedTierNote}> or more</span>
                  )}
                </p>
                <button
                  type="button"
                  className={styles.changeTierButton}
                  onClick={handleChangeTier}
                >
                  {t("register.changeTier")}
                </button>
              </div>
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
