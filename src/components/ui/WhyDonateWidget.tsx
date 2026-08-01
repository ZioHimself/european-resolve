"use client";

import { useEffect, useRef } from "react";

interface WhyDonateWidgetProps {
  shortcode: string;
  lang?: string;
  onPaymentSuccess?: (amount: number) => void;
  onDetectionFailed?: () => void;
  donorInfo?: { fullName: string; email: string };
}

function readAmount(shadow: ShadowRoot, id: string): number {
  const input = shadow.getElementById(
    `other-amount-number-${id}`,
  ) as HTMLInputElement | null;
  return parseFloat(input?.value || "0");
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

export function WhyDonateWidget({
  shortcode,
  lang = "auto",
  onPaymentSuccess,
  onDetectionFailed,
  donorInfo,
}: WhyDonateWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefillDoneRef = useRef(false);
  const detectionDoneRef = useRef(false);
  const donorInfoRef = useRef(donorInfo);
  donorInfoRef.current = donorInfo;

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
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!shortcode || (!onPaymentSuccess && !donorInfo)) return;

    let observer: MutationObserver | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const id = `${shortcode}-1`;

    function handleShadowRoot(shadow: ShadowRoot) {
      if (cancelled) return;

      const currentDonorInfo = donorInfoRef.current;

      // Pre-fill donor fields — attempt immediately, retry on DOM changes
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
        // Check if already at step 4 (redirect return case)
        const stepFour = shadow.getElementById(`step-four-container-${id}`);
        if (stepFour && stepFour.style.display !== "none" && stepFour.style.display !== "") {
          detectionDoneRef.current = true;
          const amount = readAmount(shadow, id);
          onPaymentSuccess(amount);
          if (!needsPrefillRetry) return;
        }
      }

      observer = new MutationObserver(() => {
        const info = donorInfoRef.current;
        // Retry prefill when the widget renders new steps
        if (info && !prefillDoneRef.current) {
          const filled = prefillDonorFields(shadow, id, info);
          if (filled) {
            prefillDoneRef.current = true;
          }
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
          const amount = readAmount(shadow, id);
          onPaymentSuccess(amount);
        }
      });

      observer.observe(shadow, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
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
    };
  }, [shortcode, onPaymentSuccess, onDetectionFailed, donorInfo]);

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
