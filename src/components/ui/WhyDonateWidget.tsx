"use client";

import { useEffect, useRef } from "react";

export interface DonationStorageKeys {
  amount: string;
  donor: string;
  message: string;
}

interface WhyDonateWidgetProps {
  shortcode: string;
  lang?: string;
  onPaymentSuccess?: (
    amount: number,
    details?: { donorName?: string; message?: string },
  ) => void;
  onDetectionFailed?: () => void;
  donorInfo?: { fullName: string; email: string };
  /** Persist amount/name/message to sessionStorage as the donor fills the form. */
  donationStorageKeys?: DonationStorageKeys;
}

function readAmount(shadow: ShadowRoot, id: string): number {
  const input = shadow.getElementById(
    `other-amount-number-${id}`,
  ) as HTMLInputElement | null;
  return parseFloat(input?.value || "0");
}

function readDonorName(shadow: ShadowRoot, id: string): string | undefined {
  const anonCheckbox = shadow.getElementById(
    `anonymous-toggle-${id}`,
  ) as HTMLInputElement | null;
  if (anonCheckbox?.checked) return undefined;

  const fname =
    (shadow.getElementById(`donor-fname-${id}`) as HTMLInputElement | null)?.value?.trim() ?? "";
  const lname =
    (shadow.getElementById(`donor-lname-${id}`) as HTMLInputElement | null)?.value?.trim() ?? "";
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
    if (donorName) sessionStorage.setItem(keys.donor, donorName);
    else sessionStorage.removeItem(keys.donor);
    if (message) sessionStorage.setItem(keys.message, message);
    else sessionStorage.removeItem(keys.message);
  } catch {
    /* storage unavailable */
  }
}

const nativeInputValueSetter =
  typeof window !== "undefined"
    ? Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set
    : undefined;

function setInputValue(input: HTMLInputElement, value: string): void {
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, value);
  } else {
    input.value = value;
  }
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function prefillDonorFields(
  shadow: ShadowRoot,
  id: string,
  info: { fullName: string; email: string },
): boolean {
  const parts = info.fullName.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  const fields: [string, string][] = [
    [`donor-fname-${id}`, firstName],
    [`donor-lname-${id}`, lastName],
    [`donor-email-${id}`, info.email],
  ];

  let filledCount = 0;
  for (const [fieldId, value] of fields) {
    const input = shadow.getElementById(fieldId) as HTMLInputElement | null;
    if (input) {
      setInputValue(input, value);
      filledCount++;
    }
  }

  return filledCount > 0;
}

function attachDonationPersistence(
  shadow: ShadowRoot,
  id: string,
  keys: DonationStorageKeys,
): () => void {
  const fieldIds = [
    `other-amount-number-${id}`,
    `donor-fname-${id}`,
    `donor-lname-${id}`,
    `public-message-${id}`,
    `anonymous-toggle-${id}`,
  ];

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

export function WhyDonateWidget({
  shortcode,
  lang = "auto",
  onPaymentSuccess,
  onDetectionFailed,
  donorInfo,
  donationStorageKeys,
}: WhyDonateWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefillDoneRef = useRef(false);
  const detectionDoneRef = useRef(false);
  const donorInfoRef = useRef(donorInfo);
  const storageKeysRef = useRef(donationStorageKeys);
  donorInfoRef.current = donorInfo;
  storageKeysRef.current = donationStorageKeys;

  useEffect(() => {
    const el = containerRef.current?.querySelector(".widget-here") as HTMLElement | null;
    if (!el) return;

    if (el.shadowRoot) return;

    el.setAttribute("value", "donation-widget");
    delete el.dataset.initialized;

    if (!document.querySelector('link[href*="wdplugin-style.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://plugin.whydonate.com/wdplugin-style.css";
      document.head.appendChild(link);
    }

    const existing = document.querySelector('script[src*="wp_styling.js"]');
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = "https://plugin.whydonate.com/wp_styling.js";
    script.type = "text/javascript";
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!shortcode || (!onPaymentSuccess && !donorInfo && !donationStorageKeys)) return;

    let observer: MutationObserver | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let detachPersistence: (() => void) | null = null;
    let cancelled = false;

    const id = `${shortcode}-1`;

    function firePaymentSuccess(shadow: ShadowRoot) {
      if (!onPaymentSuccess) return;
      const details = readDonationDetails(shadow, id);
      console.log("[WhyDonateWidget] payment detected", details);
      onPaymentSuccess(details.amount, {
        donorName: details.donorName,
        message: details.message,
      });
    }

    function handleShadowRoot(shadow: ShadowRoot) {
      if (cancelled) return;

      const keys = storageKeysRef.current;
      if (keys) {
        detachPersistence?.();
        detachPersistence = attachDonationPersistence(shadow, id, keys);
      }

      const currentDonorInfo = donorInfoRef.current;

      if (currentDonorInfo && !prefillDoneRef.current) {
        const filled = prefillDonorFields(shadow, id, currentDonorInfo);
        if (filled) {
          prefillDoneRef.current = true;
        }
      }

      const needsPaymentDetection = onPaymentSuccess && !detectionDoneRef.current;
      const needsPrefillRetry = currentDonorInfo && !prefillDoneRef.current;

      if (!needsPaymentDetection && !needsPrefillRetry) return;

      if (needsPaymentDetection) {
        const stepFour = shadow.getElementById(`step-four-container-${id}`);
        if (stepFour && stepFour.style.display !== "none" && stepFour.style.display !== "") {
          detectionDoneRef.current = true;
          firePaymentSuccess(shadow);
          if (!needsPrefillRetry) return;
        }
      }

      observer = new MutationObserver(() => {
        const info = donorInfoRef.current;
        if (info && !prefillDoneRef.current) {
          const filled = prefillDonorFields(shadow, id, info);
          if (filled) {
            prefillDoneRef.current = true;
          }
        }

        if (keys) {
          persistDonationDetails(keys, shadow, id);
        }

        if (!onPaymentSuccess || detectionDoneRef.current) {
          if (prefillDoneRef.current) {
            observer?.disconnect();
            observer = null;
          }
          return;
        }
        const el = shadow.getElementById(`step-four-container-${id}`);
        if (el && el.style.display !== "none" && el.style.display !== "") {
          detectionDoneRef.current = true;
          if (prefillDoneRef.current || !donorInfoRef.current) {
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
        onDetectionFailed?.();
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
    };
  }, [shortcode, onPaymentSuccess, onDetectionFailed, donorInfo, donationStorageKeys]);

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
