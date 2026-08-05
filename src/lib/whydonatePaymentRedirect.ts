export const PAYMENT_AMOUNT_STORAGE_KEY = "r4u:donation-amount";

export interface WhyDonatePaymentReturn {
  isReturn: boolean;
  /**
   * Amount read from the widget's stashed field. Absent (never assumed)
   * when nothing was captured — the confirm-payment call should omit
   * `amount` entirely in that case and let the backend fall back to the
   * amount already on file from registration.
   */
  amount?: number;
}

/** Detect a WhyDonate redirect return. */
export function parseWhyDonatePaymentReturn(): WhyDonatePaymentReturn {
  if (typeof window === "undefined") {
    return { isReturn: false };
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("redirect_status") !== "succeeded") {
    return { isReturn: false };
  }

  let storedAmount = 0;
  try {
    storedAmount = Number(sessionStorage.getItem(PAYMENT_AMOUNT_STORAGE_KEY)) || 0;
  } catch {
    /* storage unavailable */
  }

  return { isReturn: true, amount: storedAmount > 0 ? storedAmount : undefined };
}

export function clearPaymentAmountStorage(): void {
  try {
    sessionStorage.removeItem(PAYMENT_AMOUNT_STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}
