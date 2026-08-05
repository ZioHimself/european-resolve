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
    expect(parseWhyDonatePaymentReturn()).toEqual({
      isReturn: false,
    });
  });

  it("uses the stashed widget amount on redirect return", () => {
    window.history.replaceState({}, "", "?redirect_status=succeeded");
    sessionStorage.setItem(PAYMENT_AMOUNT_STORAGE_KEY, "150");

    expect(parseWhyDonatePaymentReturn()).toEqual({
      isReturn: true,
      amount: 150,
    });
  });

  it("leaves amount undefined when nothing was stashed — never assumes a value", () => {
    window.history.replaceState({}, "", "?redirect_status=succeeded");

    const result = parseWhyDonatePaymentReturn();
    expect(result.isReturn).toBe(true);
    expect(result.amount).toBeUndefined();
  });

  it("clearPaymentAmountStorage removes the amount key", () => {
    sessionStorage.setItem(PAYMENT_AMOUNT_STORAGE_KEY, "75");
    clearPaymentAmountStorage();
    expect(sessionStorage.getItem(PAYMENT_AMOUNT_STORAGE_KEY)).toBeNull();
  });
});
