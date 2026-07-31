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

function prefillDonorFields(
  shadow: ShadowRoot,
  id: string,
  info: { fullName: string; email: string },
): void {
  const parts = info.fullName.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  const fields: [string, string][] = [
    [`donor-fname-${id}`, firstName],
    [`donor-lname-${id}`, lastName],
    [`donor-email-${id}`, info.email],
  ];

  for (const [fieldId, value] of fields) {
    const input = shadow.getElementById(fieldId) as HTMLInputElement | null;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
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

      // Pre-fill donor fields (once)
      if (donorInfo && !prefillDoneRef.current) {
        prefillDoneRef.current = true;
        prefillDonorFields(shadow, id, donorInfo);
      }

      if (!onPaymentSuccess || detectionDoneRef.current) return;

      // Check if already at step 4 (redirect return case)
      const stepFour = shadow.getElementById(`step-four-container-${id}`);
      if (stepFour && stepFour.style.display !== "none" && stepFour.style.display !== "") {
        detectionDoneRef.current = true;
        const amount = readAmount(shadow, id);
        onPaymentSuccess(amount);
        return;
      }

      observer = new MutationObserver(() => {
        if (detectionDoneRef.current) return;
        const el = shadow.getElementById(`step-four-container-${id}`);
        if (el && el.style.display !== "none" && el.style.display !== "") {
          detectionDoneRef.current = true;
          observer?.disconnect();
          observer = null;
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
