import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, act } from "@testing-library/react";
import { ConfirmationPanel } from "@/components/ui/ConfirmationPanel";
import type { RegisterResponse } from "@/components/ui/registerTypes";

vi.mock("@/components/ui/WhyDonateWidget", () => ({
  WhyDonateWidget: (props: {
    onPaymentSuccess?: (amount: number) => void;
  }) => (
    <button
      type="button"
      data-testid="mock-pay"
      onClick={() => props.onPaymentSuccess?.(100)}
    >
      Pay
    </button>
  ),
}));

const registrationResult: RegisterResponse = {
  participantId: "R-TEST",
  fullName: "Test User",
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  tierId: "sprinter",
  tierName: "Sprinter",
  participationType: "runner",
  amountEur: 15,
  rewards: ["Running", "Sticker pack"],
  paymentToken: "PAY_TOKEN",
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ConfirmationPanel effective tier display", () => {
  it("shows effective tier from confirm-payment API, not registration selection", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            confirmed: true,
            participantId: "R-TEST",
            tierName: "Ultramarathoner",
            amountEur: 100,
            rewards: [
              "Running",
              "Sticker pack",
              "Silk scarf by a Ukrainian designer brand",
              "Traditional Ukrainian meal",
              "5 raffle tickets",
            ],
          },
        }),
        { status: 200 },
      ),
    );

    render(<ConfirmationPanel result={registrationResult} />);

    await act(async () => {
      screen.getByTestId("mock-pay").click();
    });

    await waitFor(() => {
      expect(screen.getByText("Ultramarathoner")).toBeInTheDocument();
    });

    expect(screen.queryByText("Sprinter")).not.toBeInTheDocument();
    expect(screen.getByText("€100")).toBeInTheDocument();
    expect(screen.getByText("5 raffle tickets")).toBeInTheDocument();
  });
});
