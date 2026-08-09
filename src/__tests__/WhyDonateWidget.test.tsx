import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act, screen } from "@testing-library/react";
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

/** Fire the injected WhyDonate script onload handler (shadow poll starts here). */
function simulateScriptLoad() {
  const script = document.querySelector('script[src*="wp_styling.js"]') as HTMLScriptElement | null;
  expect(script).not.toBeNull();
  act(() => {
    script!.onload?.(new Event("load"));
  });
}

/** Script load + shadow root + poll tick — typical widget-ready path in tests. */
function bootstrapWidget(shortcode: string) {
  simulateScriptLoad();
  act(() => {
    simulateWidgetInit(shortcode);
  });
  act(() => {
    vi.advanceTimersByTime(200);
  });
}

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
      <div id="donation-amount-error-${id}" style="display: none"></div>
      <button type="button" class="wd-part-step-one-next">Next</button>
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

      act(() => { bootstrapWidget(shortcode); });

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

      act(() => { bootstrapWidget(shortcode); });

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

      act(() => { bootstrapWidget(shortcode); });

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

      act(() => {
        simulateScriptLoad();
        simulateWidgetInit(shortcode);
      });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;
      const fname = shadow.getElementById(`donor-fname-${id}`) as HTMLInputElement;

      const events: string[] = [];
      fname.addEventListener("input", () => events.push("input"));
      fname.addEventListener("change", () => events.push("change"));

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(events).toContain("input");
      expect(events).toContain("change");
    });

    it("prefills donor fields when step two becomes visible after hidden prefill failed", async () => {
      const shortcode = "mob01";
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          donorInfo={{ fullName: "Mobile User", email: "mobile@test.com" }}
          onPaymentSuccess={vi.fn()}
          onDetectionFailed={vi.fn()}
        />,
      );

      act(() => { bootstrapWidget(shortcode); });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;
      const stepTwo = shadow.getElementById(`step-two-container-${id}`)!;

      // Simulate mobile: hidden prefill does not stick
      const fname = shadow.getElementById(`donor-fname-${id}`) as HTMLInputElement;
      const lname = shadow.getElementById(`donor-lname-${id}`) as HTMLInputElement;
      const email = shadow.getElementById(`donor-email-${id}`) as HTMLInputElement;
      fname.value = "";
      lname.value = "";
      email.value = "";

      act(() => {
        stepTwo.style.display = "block";
      });

      await act(async () => { await Promise.resolve(); });

      expect(fname).toHaveProperty("value", "Mobile");
      expect(lname).toHaveProperty("value", "User");
      expect(email).toHaveProperty("value", "mobile@test.com");
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

      // Let the poll find the shadow root after script load
      act(() => {
        simulateScriptLoad();
        vi.advanceTimersByTime(200);
      });

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

      act(() => { bootstrapWidget(shortcode); });

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

      act(() => { bootstrapWidget(shortcode); });

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

    it("calls onDetectionFailed after shadow poll timeout", () => {
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

      simulateScriptLoad();
      // Shadow root never appears — 200 poll attempts × 100ms
      act(() => {
        vi.advanceTimersByTime(20_100);
      });

      expect(onDetectionFailed).toHaveBeenCalled();
    });

    it("calls onDetectionFailed when the script never loads", () => {
      const shortcode = "fail2";
      const onDetectionFailed = vi.fn();
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          onPaymentSuccess={vi.fn()}
          onDetectionFailed={onDetectionFailed}
        />,
      );

      act(() => {
        vi.advanceTimersByTime(20_100);
      });

      expect(onDetectionFailed).toHaveBeenCalled();
    });

    it("shows a loading spinner until the widget is ready", () => {
      const shortcode = "spin1";
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          donorInfo={{ fullName: "Spinner Test", email: "spin@test.com" }}
          onPaymentSuccess={vi.fn()}
          onDetectionFailed={vi.fn()}
        />,
      );

      expect(screen.getByText("Loading payment form\u2026")).toBeInTheDocument();

      bootstrapWidget(shortcode);

      expect(screen.queryByText("Loading payment form\u2026")).not.toBeInTheDocument();
    });

    it("calls onDetectionFailed after the post-ready payment detection fallback", () => {
      const shortcode = "fbk01";
      const onDetectionFailed = vi.fn();
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          donorInfo={{ fullName: "Fallback Test", email: "fbk@test.com" }}
          onPaymentSuccess={vi.fn()}
          onDetectionFailed={onDetectionFailed}
        />,
      );

      bootstrapWidget(shortcode);
      expect(onDetectionFailed).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(90_100);
      });

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

      act(() => { bootstrapWidget(shortcode); });

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

      act(() => { bootstrapWidget(shortcode); });

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
      expect(host!.classList.contains("widget-here")).toBe(true);
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

  describe("tier amount gate", () => {
    it("pre-fills tier price and writes sessionStorage immediately", () => {
      const shortcode = "gate1";
      const AMOUNT_KEY = "test:gate1:amount";
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          donationStorageKeys={{ amount: AMOUNT_KEY }}
          minTierAmount={30}
          minTierName="Relay runner"
        />,
      );

      act(() => { bootstrapWidget(shortcode); });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;

      expect(
        (shadow.getElementById(`other-amount-number-${id}`) as HTMLInputElement).value,
      ).toBe("30");
      expect(sessionStorage.getItem(AMOUNT_KEY)).toBe("30");
    });

    it("blocks step-one Next when amount is below minimum", () => {
      const shortcode = "gate2";
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          minTierAmount={30}
          minTierName="Relay runner"
        />,
      );

      act(() => { bootstrapWidget(shortcode); });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;
      const amountInput = shadow.getElementById(
        `other-amount-number-${id}`,
      ) as HTMLInputElement;
      const nextButton = shadow.querySelector(
        ".wd-part-step-one-next",
      ) as HTMLButtonElement;
      const errorEl = shadow.getElementById(`donation-amount-error-${id}`)!;

      amountInput.value = "20";

      const nativeHandler = vi.fn();
      nextButton.addEventListener("click", nativeHandler);

      act(() => {
        nextButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(nativeHandler).not.toHaveBeenCalled();
      expect(errorEl.textContent).toContain("Minimum donation");
      expect(errorEl.style.display).toBe("block");
    });

    it("allows step-one Next when amount meets minimum", () => {
      const shortcode = "gate3";
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          minTierAmount={30}
          minTierName="Relay runner"
        />,
      );

      act(() => { bootstrapWidget(shortcode); });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;
      const amountInput = shadow.getElementById(
        `other-amount-number-${id}`,
      ) as HTMLInputElement;
      const nextButton = shadow.querySelector(
        ".wd-part-step-one-next",
      ) as HTMLButtonElement;
      const errorEl = shadow.getElementById(`donation-amount-error-${id}`)!;

      amountInput.value = "30";

      const nativeHandler = vi.fn();
      nextButton.addEventListener("click", nativeHandler);

      act(() => {
        nextButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(nativeHandler).toHaveBeenCalled();
      expect(errorEl.style.display).toBe("none");
    });

    it("re-applies tier minimum when amount is reset below minimum", async () => {
      const shortcode = "gate5";
      const AMOUNT_KEY = "test:gate5:amount";
      render(
        <WhyDonateWidget
          shortcode={shortcode}
          donationStorageKeys={{ amount: AMOUNT_KEY }}
          minTierAmount={30}
          minTierName="Relay runner"
        />,
      );

      act(() => { bootstrapWidget(shortcode); });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;
      const amountInput = shadow.getElementById(
        `other-amount-number-${id}`,
      ) as HTMLInputElement;

      expect(amountInput.value).toBe("30");

      act(() => {
        amountInput.value = "15";
        shadow.getElementById(`step-one-container-${id}`)!.classList.add("wd-api-loaded");
      });

      await act(async () => { await Promise.resolve(); });

      expect(amountInput.value).toBe("30");
      expect(sessionStorage.getItem(AMOUNT_KEY)).toBe("30");
    });

    it("does not attach gate when minTierAmount is omitted", () => {
      const shortcode = "gate4";
      render(<WhyDonateWidget shortcode={shortcode} />);

      act(() => { bootstrapWidget(shortcode); });

      const host = document.getElementById(`widget-here-${shortcode}`)!;
      const shadow = host.shadowRoot!;
      const id = `${shortcode}-1`;
      const amountInput = shadow.getElementById(
        `other-amount-number-${id}`,
      ) as HTMLInputElement;
      const nextButton = shadow.querySelector(
        ".wd-part-step-one-next",
      ) as HTMLButtonElement;
      const errorEl = shadow.getElementById(`donation-amount-error-${id}`)!;

      amountInput.value = "1";

      const nativeHandler = vi.fn();
      nextButton.addEventListener("click", nativeHandler);

      act(() => {
        nextButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(nativeHandler).toHaveBeenCalled();
      expect(errorEl.textContent).toBe("");
    });
  });
});
