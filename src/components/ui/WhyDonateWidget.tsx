"use client";

import { useEffect, useRef } from "react";
import { regFlowLog } from "@/lib/registrationFlowLog";

type DonorInfo =
  | { firstName: string; lastName: string; email: string }
  | { fullName: string; email: string };

export interface DonationStorageKeys {
  amount: string;
  donor?: string;
  message?: string;
}

interface WhyDonateWidgetProps {
  shortcode: string;
  lang?: string;
  onPaymentSuccess?: (
    amount: number,
    details?: { donorName?: string; message?: string },
  ) => void;
  onDetectionFailed?: () => void;
  donorInfo?: DonorInfo;
  /** Persist amount/name/message to sessionStorage as the donor fills the form. */
  donationStorageKeys?: DonationStorageKeys;
  /** Registration flows only — omit for visitor/donor-wall embeds (D-04) */
  minTierAmount?: number;
  minTierName?: string;
}

function normalizeDonorInfo(
  info: DonorInfo,
): { firstName: string; lastName: string; email: string } {
  if ("fullName" in info) {
    const parts = info.fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" "),
      email: info.email,
    };
  }
  return info;
}

function readAmount(shadow: ShadowRoot, id: string): number {
  const input = shadow.getElementById(
    `other-amount-number-${id}`,
  ) as HTMLInputElement | null;
  return parseFloat(input?.value || "0");
}

function readDonorName(shadow: ShadowRoot, id: string): string | undefined {
  // Respect the anonymous donation checkbox if the widget has one
  const anonCheckbox = shadow.getElementById(`donate-anonymously-${id}`) as HTMLInputElement | null
    ?? shadow.querySelector(`[id*="anonymous"][id*="${id}"]`) as HTMLInputElement | null;
  if (anonCheckbox?.checked) return undefined;

  const fname = (shadow.getElementById(`donor-fname-${id}`) as HTMLInputElement | null)?.value?.trim() ?? "";
  const lname = (shadow.getElementById(`donor-lname-${id}`) as HTMLInputElement | null)?.value?.trim() ?? "";
  const full = [fname, lname].filter(Boolean).join(" ");
  return full || undefined;
}

function readDonorMessage(shadow: ShadowRoot, id: string): string | undefined {
  const message =
    (shadow.getElementById(`public-message-${id}`) as HTMLTextAreaElement | null)?.value?.trim() ??
    "";
  return message || undefined;
}

function readDonationDetails(shadow: ShadowRoot, id: string) {
  return {
    amount: readAmount(shadow, id),
    donorName: readDonorName(shadow, id),
    message: readDonorMessage(shadow, id),
  };
}

function persistDonationDetails(keys: DonationStorageKeys, shadow: ShadowRoot, id: string) {
  try {
    const { amount, donorName, message } = readDonationDetails(shadow, id);
    if (amount > 0) sessionStorage.setItem(keys.amount, String(amount));
    if (keys.donor) {
      if (donorName) sessionStorage.setItem(keys.donor, donorName);
      else sessionStorage.removeItem(keys.donor);
    }
    if (keys.message) {
      if (message) sessionStorage.setItem(keys.message, message);
      else sessionStorage.removeItem(keys.message);
    }
  } catch {
    /* storage unavailable */
  }
}

function getNativeValueSetter(
  input: HTMLInputElement | HTMLTextAreaElement,
): ((value: string) => void) | undefined {
  const proto =
    input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  return setter ? (value: string) => setter.call(input, value) : undefined;
}

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const setNativeValue = getNativeValueSetter(input);
  if (setNativeValue) {
    setNativeValue(value);
  } else {
    input.value = value;
  }
  // InputEvent keeps floating labels and widget validation in sync on mobile;
  // a plain Event("input") is ignored by some browsers inside shadow DOM.
  try {
    input.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: value,
        inputType: "insertFromPaste",
      }),
    );
  } catch {
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function isContainerVisible(el: HTMLElement | null): boolean {
  if (!el) return false;
  const display = el.style.display;
  return display !== "none" && display !== "";
}

function donorFieldsExist(shadow: ShadowRoot, id: string): boolean {
  return Boolean(
    shadow.getElementById(`donor-fname-${id}`) &&
      shadow.getElementById(`donor-lname-${id}`) &&
      shadow.getElementById(`donor-email-${id}`),
  );
}

function needsDonorPrefill(
  shadow: ShadowRoot,
  id: string,
  info: DonorInfo,
): boolean {
  if (!donorFieldsExist(shadow, id)) return false;
  const expected = normalizeDonorInfo(info);
  const fname =
    (shadow.getElementById(`donor-fname-${id}`) as HTMLInputElement | null)?.value ??
    "";
  const lname =
    (shadow.getElementById(`donor-lname-${id}`) as HTMLInputElement | null)?.value ??
    "";
  const email =
    (shadow.getElementById(`donor-email-${id}`) as HTMLInputElement | null)?.value ??
    "";
  return (
    fname !== expected.firstName ||
    lname !== expected.lastName ||
    email !== expected.email
  );
}

function ensureMinTierAmount(
  shadow: ShadowRoot,
  id: string,
  minAmount: number,
  keys?: DonationStorageKeys,
): void {
  const amountInput = shadow.getElementById(
    `other-amount-number-${id}`,
  ) as HTMLInputElement | null;
  if (!amountInput) return;
  if (readAmount(shadow, id) >= minAmount) return;
  setInputValue(amountInput, String(minAmount));
  if (keys) persistDonationDetails(keys, shadow, id);
}

function prefillDonorFields(
  shadow: ShadowRoot,
  id: string,
  info: DonorInfo,
): boolean {
  const { firstName, lastName, email } = normalizeDonorInfo(info);

  const fields: [string, string][] = [
    [`donor-fname-${id}`, firstName],
    [`donor-lname-${id}`, lastName],
    [`donor-email-${id}`, email],
  ];

  let filledCount = 0;
  for (const [fieldId, value] of fields) {
    const input = shadow.getElementById(fieldId) as HTMLInputElement | null;
    if (!input) return false;
    setInputValue(input, value);
    filledCount++;
  }

  return filledCount === fields.length;
}

function attachDonationPersistence(
  shadow: ShadowRoot,
  id: string,
  keys: DonationStorageKeys,
): () => void {
  const fieldIds = [`other-amount-number-${id}`];
  if (keys.donor) {
    fieldIds.push(`donor-fname-${id}`, `donor-lname-${id}`, `donate-anonymously-${id}`);
  }
  if (keys.message) {
    fieldIds.push(`public-message-${id}`);
  }

  const persist = () => persistDonationDetails(keys, shadow, id);

  for (const fieldId of fieldIds) {
    const el = shadow.getElementById(fieldId);
    el?.addEventListener("input", persist);
    el?.addEventListener("change", persist);
  }

  persist();

  return () => {
    for (const fieldId of fieldIds) {
      const el = shadow.getElementById(fieldId);
      el?.removeEventListener("input", persist);
      el?.removeEventListener("change", persist);
    }
  };
}

function readDonorPrefillState(
  shadow: ShadowRoot,
  id: string,
  info: DonorInfo,
): Record<string, boolean | string> {
  const expected = normalizeDonorInfo(info);
  const fname =
    (shadow.getElementById(`donor-fname-${id}`) as HTMLInputElement | null)?.value ??
    "";
  const lname =
    (shadow.getElementById(`donor-lname-${id}`) as HTMLInputElement | null)?.value ??
    "";
  const email =
    (shadow.getElementById(`donor-email-${id}`) as HTMLInputElement | null)?.value ??
    "";
  return {
    fieldsPresent: donorFieldsExist(shadow, id),
    fnameMatch: fname === expected.firstName,
    lnameMatch: lname === expected.lastName,
    emailMatch: email === expected.email,
    stepTwoVisible: isContainerVisible(shadow.getElementById(`step-two-container-${id}`)),
  };
}

function readWidgetStepState(shadow: ShadowRoot, id: string) {
  const stepIds = ["one", "two", "three", "four"] as const;
  const steps: Record<string, string> = {};
  for (const step of stepIds) {
    const el = shadow.getElementById(`step-${step}-container-${id}`);
    if (!el) {
      steps[step] = "missing";
      continue;
    }
    steps[step] = el.style.display === "none" ? "hidden" : "visible";
  }
  return steps;
}

function attachTierAmountGate(
  shadow: ShadowRoot,
  id: string,
  minAmount: number,
  tierName: string,
): () => void {
  const nextButton = shadow.querySelector(".wd-part-step-one-next");
  if (!nextButton) {
    return () => {};
  }

  const handler = (event: Event) => {
    const amount = readAmount(shadow, id);
    const errorEl = shadow.getElementById(`donation-amount-error-${id}`);

    if (amount < minAmount) {
      event.preventDefault();
      event.stopImmediatePropagation();
      regFlowLog.whyDonateWarn("step-one blocked by tier minimum gate", {
        amount,
        minAmount,
        tierName,
      });

      if (errorEl) {
        errorEl.textContent = `Minimum donation for ${tierName} is €${minAmount}. Please enter at least this amount to continue.`;
        errorEl.style.display = "block";
      }
      return;
    }

    regFlowLog.whyDonate("step-one allowed by tier minimum gate", {
      amount,
      minAmount,
    });

    if (errorEl) {
      errorEl.textContent = "";
      errorEl.style.display = "none";
    }
  };

  nextButton.addEventListener("click", handler, true);

  return () => {
    nextButton.removeEventListener("click", handler, true);
  };
}

export function WhyDonateWidget({
  shortcode,
  lang = "auto",
  onPaymentSuccess,
  onDetectionFailed,
  donorInfo,
  donationStorageKeys,
  minTierAmount,
  minTierName,
}: WhyDonateWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const detectionDoneRef = useRef(false);
  const donorInfoRef = useRef(donorInfo);
  const storageKeysRef = useRef(donationStorageKeys);
  const minTierAmountRef = useRef(minTierAmount);
  const minTierNameRef = useRef(minTierName);
  const onPaymentSuccessRef = useRef(onPaymentSuccess);
  const onDetectionFailedRef = useRef(onDetectionFailed);
  donorInfoRef.current = donorInfo;
  storageKeysRef.current = donationStorageKeys;
  minTierAmountRef.current = minTierAmount;
  minTierNameRef.current = minTierName;
  onPaymentSuccessRef.current = onPaymentSuccess;
  onDetectionFailedRef.current = onDetectionFailed;

  useEffect(() => {
    const el = containerRef.current?.querySelector(".widget-here") as HTMLElement | null;
    if (!el) return;

    // Already initialized with a shadow root — nothing to do
    if (el.shadowRoot) return;

    el.setAttribute("value", "donation-widget");
    delete el.dataset.initialized;

    if (!document.querySelector('link[href*="wdplugin-style.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://plugin.whydonate.com/wdplugin-style.css";
      document.head.appendChild(link);
    }

    // The WhyDonate script only scans for .widget-here elements once on
    // load, so if it already ran before this div existed, we must force
    // a re-scan by removing and re-adding the script tag (browser cache
    // prevents a network re-fetch).
    const existing = document.querySelector('script[src*="wp_styling.js"]');
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = "https://plugin.whydonate.com/wp_styling.js";
    script.type = "text/javascript";
    script.onload = () => {
      regFlowLog.whyDonate("widget script loaded", { shortcode });
    };
    script.onerror = () => {
      regFlowLog.whyDonateWarn("widget script failed to load", { shortcode });
    };
    document.body.appendChild(script);
    regFlowLog.whyDonate("widget script injected", { shortcode, lang });
  }, []);

  useEffect(() => {
    const hasTierGate =
      minTierAmount != null && minTierAmount > 0 && Boolean(minTierName);
    if (
      !shortcode ||
      (!onPaymentSuccess && !donorInfo && !donationStorageKeys && !hasTierGate)
    )
      return;

    let observer: MutationObserver | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let detachPersistence: (() => void) | null = null;
    let detachGate: (() => void) | null = null;
    let cancelled = false;

    const id = `${shortcode}-1`;

    function firePaymentSuccess(shadow: ShadowRoot) {
      const onSuccess = onPaymentSuccessRef.current;
      if (!onSuccess) return;
      const details = readDonationDetails(shadow, id);
      regFlowLog.whyDonate("payment detected", {
        amount: details.amount,
        hasDonorName: Boolean(details.donorName),
        hasMessage: Boolean(details.message),
        steps: readWidgetStepState(shadow, id),
      });
      onSuccess(details.amount, {
        donorName: details.donorName,
        message: details.message,
      });
    }

    function tryPrefillDonorFields(shadow: ShadowRoot): boolean {
      const info = donorInfoRef.current;
      if (!info) return true;
      if (!donorFieldsExist(shadow, id)) return false;
      if (!needsDonorPrefill(shadow, id, info)) return true;

      const stepTwo = shadow.getElementById(`step-two-container-${id}`);
      const stepTwoVisible = isContainerVisible(stepTwo);

      if (!stepTwoVisible) {
        prefillDonorFields(shadow, id, info);
        // Values set on hidden fields may not stick on mobile; keep retrying
        // until the details step is visible and values are confirmed.
        return !needsDonorPrefill(shadow, id, info);
      }

      const filled = prefillDonorFields(shadow, id, info);
      regFlowLog.whyDonate(
        filled ? "donor prefill applied" : "donor prefill incomplete",
        readDonorPrefillState(shadow, id, info),
      );
      return filled;
    }

    function handleShadowRoot(shadow: ShadowRoot) {
      if (cancelled) return;

      regFlowLog.whyDonate("shadow root ready", {
        shortcode,
        widgetId: id,
        steps: readWidgetStepState(shadow, id),
        minTierAmount: minTierAmountRef.current,
      });

      const keys = storageKeysRef.current;
      if (keys) {
        detachPersistence?.();
        detachPersistence = attachDonationPersistence(shadow, id, keys);
      }

      const tierMin = minTierAmountRef.current;
      const tierName = minTierNameRef.current;
      if (tierMin != null && tierMin > 0 && tierName) {
        const before = readAmount(shadow, id);
        ensureMinTierAmount(shadow, id, tierMin, keys);
        const after = readAmount(shadow, id);
        if (after !== before) {
          regFlowLog.whyDonate("tier minimum amount enforced", {
            before,
            after,
            minAmount: tierMin,
          });
        }
        detachGate?.();
        detachGate = attachTierAmountGate(shadow, id, tierMin, tierName);
      }

      tryPrefillDonorFields(shadow);

      const currentDonorInfo = donorInfoRef.current;
      const donorPrefillSettled =
        !currentDonorInfo || !needsDonorPrefill(shadow, id, currentDonorInfo);
      const needsPaymentDetection =
        onPaymentSuccessRef.current && !detectionDoneRef.current;
      const needsPrefillRetry = currentDonorInfo && !donorPrefillSettled;
      const needsGateRetry =
        tierMin != null && tierMin > 0 && tierName && !shadow.querySelector(".wd-part-step-one-next");
      const needsTierAmountWatch =
        tierMin != null && tierMin > 0 && Boolean(tierName);

      if (!needsPaymentDetection && !needsPrefillRetry && !needsGateRetry && !needsTierAmountWatch) return;

      if (needsPaymentDetection) {
        const stepFour = shadow.getElementById(`step-four-container-${id}`);
        regFlowLog.whyDonate("checking step-four on mount", {
          found: !!stepFour,
          display: stepFour?.style.display,
        });
        if (stepFour && stepFour.style.display !== "none" && stepFour.style.display !== "") {
          detectionDoneRef.current = true;
          firePaymentSuccess(shadow);
          if (!needsPrefillRetry) return;
        }
      }

      observer = new MutationObserver(() => {
        const info = donorInfoRef.current;
        tryPrefillDonorFields(shadow);

        if (keys) {
          persistDonationDetails(keys, shadow, id);
        }

        const currentTierMin = minTierAmountRef.current;
        const currentTierName = minTierNameRef.current;
        if (currentTierMin != null && currentTierMin > 0 && currentTierName) {
          ensureMinTierAmount(shadow, id, currentTierMin, keys);
          if (shadow.querySelector(".wd-part-step-one-next")) {
            detachGate?.();
            detachGate = attachTierAmountGate(
              shadow,
              id,
              currentTierMin,
              currentTierName,
            );
          }
        }

        const prefillSettled =
          !info || !needsDonorPrefill(shadow, id, info);
        const tierWatchActive =
          minTierAmountRef.current != null &&
          minTierAmountRef.current > 0 &&
          Boolean(minTierNameRef.current);
        if (!onPaymentSuccessRef.current || detectionDoneRef.current) {
          if (prefillSettled && !tierWatchActive) {
            observer?.disconnect();
            observer = null;
          }
          return;
        }
        const el = shadow.getElementById(`step-four-container-${id}`);
        if (el && el.style.display !== "none" && el.style.display !== "") {
          detectionDoneRef.current = true;
          if (prefillSettled && !tierWatchActive) {
            observer?.disconnect();
            observer = null;
          }
          firePaymentSuccess(shadow);
        }
      });

      observer.observe(shadow, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class", "data-wd-visible"],
      });
    }

    // Poll for shadow root (widget script loads asynchronously)
    let attempts = 0;
    const maxAttempts = 30;
    pollTimer = setInterval(() => {
      if (cancelled) {
        if (pollTimer) clearInterval(pollTimer);
        return;
      }

      const host = document.getElementById(`widget-here-${shortcode}`);
      if (host?.shadowRoot) {
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = null;
        handleShadowRoot(host.shadowRoot);
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = null;
        regFlowLog.whyDonateWarn("shadow root poll timed out", {
          shortcode,
          attempts: maxAttempts,
        });
        onDetectionFailedRef.current?.();
      }
    }, 100);

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      detachPersistence?.();
      detachGate?.();
    };
  }, [shortcode, minTierAmount, minTierName]);

  return (
    <div ref={containerRef}>
      <div
        id={`widget-here-${shortcode}`}
        className="widget-here"
        data-shortcode={shortcode}
        data-lang={lang}
      />
    </div>
  );
}
