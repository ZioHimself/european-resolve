import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { WhyDonateWidget } from "@/components/ui/WhyDonateWidget";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  document.body.innerHTML = "";
  document.head.querySelectorAll('link[href*="wdplugin"]').forEach((el) => el.remove());
  document.querySelectorAll('script[src*="wp_styling"]').forEach((el) => el.remove());
  sessionStorage.clear();
});

/**
 * Simulates the Whydonate plugin creating a shadow root with form inputs.
 * The real widget uses IDs in the pattern: `{field}-{shortcode}-1`
 */
function simulateWidgetInit(shortcode: string) {
  const host = document.getElementById(`widget-here-${shortcode}`);
  if (!host || host.shadowRoot) return;

  const shadow = host.attachShadow({ mode: "open" });
  const id = `${shortcode}-1`;

  shadow.innerHTML = `
    <div id="step-one-container-${id}" style="display: block">
      <input id="other-amount-number-${id}" type="number" placeholder="0" />
    </div>
    <div id="step-two-container-${id}" style="display: none">
      <input id="donor-fname-${id}" type="text" placeholder=" " />
      <input id="donor-lname-${id}" type="text" placeholder=" " />
      <input id="donor-email-${id}" type="text" placeholder=" " />
      <textarea id="public-message-${id}"></textarea>
      <input id="anonymous-toggle-${id}" type="checkbox" />
    </div>
    <div id="step-three-container-${id}" style="display: none"></div>
    <div id="step-four-container-${id}" style="display: none"></div>
  `;
}

describe("WhyDonateWidget", () => {
  describe("donor info prefill", () => {
    it("populates first name, last name, and email from donorInfo", () => {
      const shortcode = "nudW7";
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          donorInfo={{ fullName: "Jane Doe", email: "jane@example.com" }}
          onPaymentSuccess={vi.fn()}
          onDetectionFailed={vi.fn()}
        />,
      );

      act(() => { simulateWidgetInit(shortcode); });
      act(() => { vi.advanceTimersByTime(200); });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;

      expect(shadow.getElementById(`donor-fname-${id}`) as HTMLInputElement).toHaveProperty("value", "Jane");
      expect(shadow.getElementById(`donor-lname-${id}`) as HTMLInputElement).toHaveProperty("value", "Doe");
      expect(shadow.getElementById(`donor-email-${id}`) as HTMLInputElement).toHaveProperty("value", "jane@example.com");
    });

    it("works with any shortcode (integration survives shortcode change)", () => {
      const shortcode = "xYz99";
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          donorInfo={{ fullName: "Max Mustermann", email: "max@test.de" }}
          onPaymentSuccess={vi.fn()}
          onDetectionFailed={vi.fn()}
        />,
      );

      act(() => { simulateWidgetInit(shortcode); });
      act(() => { vi.advanceTimersByTime(200); });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;

      expect(shadow.getElementById(`donor-fname-${id}`) as HTMLInputElement).toHaveProperty("value", "Max");
      expect(shadow.getElementById(`donor-lname-${id}`) as HTMLInputElement).toHaveProperty("value", "Mustermann");
      expect(shadow.getElementById(`donor-email-${id}`) as HTMLInputElement).toHaveProperty("value", "max@test.de");
    });

    it("handles multi-word last names correctly", () => {
      const shortcode = "abc12";
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          donorInfo={{ fullName: "Jean Claude Van Damme", email: "jcvd@example.com" }}
          onPaymentSuccess={vi.fn()}
          onDetectionFailed={vi.fn()}
        />,
      );

      act(() => { simulateWidgetInit(shortcode); });
      act(() => { vi.advanceTimersByTime(200); });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;

      expect(shadow.getElementById(`donor-fname-${id}`) as HTMLInputElement).toHaveProperty("value", "Jean");
      expect(shadow.getElementById(`donor-lname-${id}`) as HTMLInputElement).toHaveProperty("value", "Claude Van Damme");
    });

    it("dispatches input and change events on each field", () => {
      const shortcode = "evtA1";
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          donorInfo={{ fullName: "Test User", email: "t@t.com" }}
          onPaymentSuccess={vi.fn()}
          onDetectionFailed={vi.fn()}
        />,
      );

      act(() => { simulateWidgetInit(shortcode); });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;
      const fname = shadow.getElementById(`donor-fname-${id}`) as HTMLInputElement;

      const events: string[] = [];
      fname.addEventListener("input", () => events.push("input"));
      fname.addEventListener("change", () => events.push("change"));

      act(() => { vi.advanceTimersByTime(200); });

      expect(events).toContain("input");
      expect(events).toContain("change");
    });

    it("retries prefill via MutationObserver when fields appear later", async () => {
      const shortcode = "late1";
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          donorInfo={{ fullName: "Late Arrival", email: "late@test.com" }}
          onPaymentSuccess={vi.fn()}
          onDetectionFailed={vi.fn()}
        />,
      );

      // Create shadow root WITHOUT the donor fields initially
      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.attachShadow({ mode: "open" });
      const id = `${shortcode}-1`;
      shadow.innerHTML = `
        <div id="step-one-container-${id}" style="display: block">
          <input id="other-amount-number-${id}" type="number" />
        </div>
        <div id="step-two-container-${id}" style="display: none"></div>
        <div id="step-four-container-${id}" style="display: none"></div>
      `;

      // Let the poll find the shadow root
      act(() => { vi.advanceTimersByTime(200); });

      // Fields don't exist yet — prefill should not mark as done
      expect(shadow.getElementById(`donor-fname-${id}`)).toBeNull();

      // Now simulate the widget rendering the donor fields (step 2 content)
      const stepTwo = shadow.getElementById(`step-two-container-${id}`)!;
      act(() => {
        stepTwo.innerHTML = `
          <input id="donor-fname-${id}" type="text" />
          <input id="donor-lname-${id}" type="text" />
          <input id="donor-email-${id}" type="text" />
        `;
      });

      // Allow MutationObserver to fire
      await act(async () => { await Promise.resolve(); });

      expect(shadow.getElementById(`donor-fname-${id}`) as HTMLInputElement).toHaveProperty("value", "Late");
      expect(shadow.getElementById(`donor-lname-${id}`) as HTMLInputElement).toHaveProperty("value", "Arrival");
      expect(shadow.getElementById(`donor-email-${id}`) as HTMLInputElement).toHaveProperty("value", "late@test.com");
    });

    it("does not prefill when donorInfo is undefined", () => {
      const shortcode = "noInf";
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          onPaymentSuccess={vi.fn()}
          onDetectionFailed={vi.fn()}
        />,
      );

      act(() => { simulateWidgetInit(shortcode); });
      act(() => { vi.advanceTimersByTime(200); });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;

      expect(shadow.getElementById(`donor-fname-${id}`) as HTMLInputElement).toHaveProperty("value", "");
      expect(shadow.getElementById(`donor-lname-${id}`) as HTMLInputElement).toHaveProperty("value", "");
      expect(shadow.getElementById(`donor-email-${id}`) as HTMLInputElement).toHaveProperty("value", "");
    });
  });

  describe("payment detection", () => {
    it("calls onPaymentSuccess when step-four becomes visible", async () => {
      const shortcode = "pay01";
      const onPaymentSuccess = vi.fn();
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          donorInfo={{ fullName: "Payer Test", email: "pay@test.com" }}
          onPaymentSuccess={onPaymentSuccess}
          onDetectionFailed={vi.fn()}
        />,
      );

      act(() => { simulateWidgetInit(shortcode); });
      act(() => { vi.advanceTimersByTime(200); });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;

      // Set an amount and reveal step four
      const amountInput = shadow.getElementById(`other-amount-number-${id}`) as HTMLInputElement;
      amountInput.value = "25";

      act(() => {
        const stepFour = shadow.getElementById(`step-four-container-${id}`)!;
        stepFour.style.display = "block";
      });

      // MutationObserver callbacks are async in jsdom
      await act(async () => { await Promise.resolve(); });

      expect(onPaymentSuccess).toHaveBeenCalledWith(25, {
        donorName: "Payer Test",
        message: undefined,
      });
    });

    it("calls onDetectionFailed after poll timeout", () => {
      const shortcode = "fail1";
      const onDetectionFailed = vi.fn();
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          donorInfo={{ fullName: "Test", email: "t@t.com" }}
          onPaymentSuccess={vi.fn()}
          onDetectionFailed={onDetectionFailed}
        />,
      );

      // Don't simulate widget init — shadow root never appears
      act(() => { vi.advanceTimersByTime(3100); });

      expect(onDetectionFailed).toHaveBeenCalled();
    });

    it("reports the amount actually in the field at payment success, not an earlier value the donor changed their mind about", async () => {
      // Regression for a real incident: donor picked €15, changed the field
      // to €5, and paid €5 — but €15 was recorded as paid and emailed as a
      // receipt. The widget must never report a stale first-entered amount.
      const shortcode = "chng1";
      const onPaymentSuccess = vi.fn();
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          donorInfo={{ fullName: "Amount Changer", email: "changer@test.com" }}
          onPaymentSuccess={onPaymentSuccess}
          onDetectionFailed={vi.fn()}
        />,
      );

      act(() => { simulateWidgetInit(shortcode); });
      act(() => { vi.advanceTimersByTime(200); });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;
      const amountInput = shadow.getElementById(`other-amount-number-${id}`) as HTMLInputElement;

      // Donor first enters €15 ...
      act(() => {
        amountInput.value = "15";
        amountInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      // ... then changes their mind and pays €5 instead.
      act(() => {
        amountInput.value = "5";
        amountInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      act(() => {
        const stepFour = shadow.getElementById(`step-four-container-${id}`)!;
        stepFour.style.display = "block";
      });

      await act(async () => { await Promise.resolve(); });

      expect(onPaymentSuccess).toHaveBeenCalledTimes(1);
      expect(onPaymentSuccess).not.toHaveBeenCalledWith(15, expect.anything());
      expect(onPaymentSuccess).toHaveBeenCalledWith(5, expect.anything());
    });

    it("persists the changed amount to sessionStorage, not the first value entered — this is what a real redirect return would read", () => {
      // If WhyDonate takes the donor through an actual page redirect for
      // payment, onPaymentSuccess never fires on this page load — the app
      // relies entirely on whatever was last persisted to sessionStorage
      // before navigation. That stash must reflect the final amount too.
      const shortcode = "chng2";
      const AMOUNT_KEY = "test:chng2:amount";
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          donationStorageKeys={{ amount: AMOUNT_KEY }}
        />,
      );

      act(() => { simulateWidgetInit(shortcode); });
      act(() => { vi.advanceTimersByTime(200); });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;
      const amountInput = shadow.getElementById(`other-amount-number-${id}`) as HTMLInputElement;

      act(() => {
        amountInput.value = "15";
        amountInput.dispatchEvent(new Event("input", { bubbles: true }));
      });
      expect(sessionStorage.getItem(AMOUNT_KEY)).toBe("15");

      act(() => {
        amountInput.value = "5";
        amountInput.dispatchEvent(new Event("input", { bubbles: true }));
      });

      expect(sessionStorage.getItem(AMOUNT_KEY)).toBe("5");
      expect(sessionStorage.getItem(AMOUNT_KEY)).not.toBe("15");
    });
  });

  describe("widget element structure", () => {
    it("renders container with correct id and data attributes", () => {
      const shortcode = "struct";
      render(<WhyDonateWidget shortcode={shortcode} />);

      const host = document.getElementById(`widget-here-${shortcode}`);
      expect(host).not.toBeNull();
      expect(host!.className).toBe("widget-here");
      expect(host!.getAttribute("data-shortcode")).toBe(shortcode);
      expect(host!.getAttribute("data-lang")).toBe("auto");
    });

    it("uses custom lang when provided", () => {
      const shortcode = "langT";
      render(<WhyDonateWidget shortcode={shortcode} lang="nl" />);

      const host = document.getElementById(`widget-here-${shortcode}`);
      expect(host!.getAttribute("data-lang")).toBe("nl");
    });
  });
});
