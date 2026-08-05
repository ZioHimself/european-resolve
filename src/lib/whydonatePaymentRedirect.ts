export const PAYMENT_AMOUNT_STORAGE_KEY = "r4u:donation-amount";

export interface WhyDonatePaymentReturn {
  isReturn: boolean;
  /** Widget amount if stashed, otherwise fallbackTierAmountEur. */
  amount: number;
  /** Raw value from sessionStorage before fallback. */
  storedAmount: number;
}

/** Detect Stripe redirect return and resolve amount for confirm-payment. */
export function parseWhyDonatePaymentReturn(
  fallbackTierAmountEur: number,
): WhyDonatePaymentReturn {
  if (typeof window === "undefined") {
    return { isReturn: false, amount: 0, storedAmount: 0 };
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("redirect_status") !== "succeeded") {
    return { isReturn: false, amount: 0, storedAmount: 0 };
  }

  let storedAmount = 0;
  try {
    storedAmount = Number(sessionStorage.getItem(PAYMENT_AMOUNT_STORAGE_KEY)) || 0;
  } catch {
    /* storage unavailable */
  }

  const amount = storedAmount > 0 ? storedAmount : fallbackTierAmountEur;
  return { isReturn: true, amount, storedAmount };
}

export function clearPaymentAmountStorage(): void {
  try {
    sessionStorage.removeItem(PAYMENT_AMOUNT_STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}
