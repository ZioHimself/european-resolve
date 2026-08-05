import { describe, it, expect, beforeEach } from "vitest";
import {
  PAYMENT_AMOUNT_STORAGE_KEY,
  parseWhyDonatePaymentReturn,
  clearPaymentAmountStorage,
} from "@/lib/whydonatePaymentRedirect";

describe("whydonatePaymentRedirect", () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("returns isReturn false without redirect_status", () => {
    expect(parseWhyDonatePaymentReturn(100)).toEqual({
      isReturn: false,
      amount: 0,
      storedAmount: 0,
    });
  });

  it("uses stashed widget amount on redirect return", () => {
    window.history.replaceState({}, "", "?redirect_status=succeeded");
    sessionStorage.setItem(PAYMENT_AMOUNT_STORAGE_KEY, "150");

    expect(parseWhyDonatePaymentReturn(100)).toEqual({
      isReturn: true,
      amount: 150,
      storedAmount: 150,
    });
  });

  it("falls back to tier amount when stash is empty", () => {
    window.history.replaceState({}, "", "?redirect_status=succeeded");

    expect(parseWhyDonatePaymentReturn(100)).toEqual({
      isReturn: true,
      amount: 100,
      storedAmount: 0,
    });
  });

  it("clearPaymentAmountStorage removes the amount key", () => {
    sessionStorage.setItem(PAYMENT_AMOUNT_STORAGE_KEY, "75");
    clearPaymentAmountStorage();
    expect(sessionStorage.getItem(PAYMENT_AMOUNT_STORAGE_KEY)).toBeNull();
  });
});
