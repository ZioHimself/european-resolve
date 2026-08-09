import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { RegisterClient } from "@/components/ui/RegisterClient";

vi.mock("@/components/ui/ConfirmationPanel", () => ({
  ConfirmationPanel: (props: {
    result: { paymentToken: string; tierName: string; participantId: string };
  }) => (
    <div data-testid="confirmation-panel">
      <span data-testid="conf-token">{props.result.paymentToken}</span>
      <span data-testid="conf-tier">{props.result.tierName}</span>
      <span data-testid="conf-participant">{props.result.participantId}</span>
    </div>
  ),
}));

const STORAGE_KEY = "r4u:registration";

const staleResult = {
  participantId: "R-OLD",
  fullName: "Old Person",
  firstName: "Old",
  lastName: "Person",
  email: "old@test.com",
  tierId: "sprinter",
  tierName: "Sprinter",
  participationType: "runner",
  amountEur: 15,
  rewards: ["Running", "Sticker pack"],
  paymentToken: "OLD_TOKEN",
};

const freshResult = {
  participantId: "R-NEW",
  fullName: "New Person",
  firstName: "New",
  lastName: "Person",
  email: "new@test.com",
  tierId: "ultramarathoner",
  tierName: "Ultramarathoner",
  participationType: "runner",
  amountEur: 100,
  rewards: [
    "Running",
    "Sticker pack",
    "Silk scarf by a Ukrainian designer brand",
    "Traditional Ukrainian meal",
    "5 raffle tickets",
  ],
  paymentToken: "NEW_TOKEN",
};

function mockFetchByToken(data: Record<string, unknown>) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify({ success: true, data }), { status: 200 }),
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("RegisterClient — URL token vs cached session", () => {
  // Regression: a stale registration cached in sessionStorage (e.g. from an
  // earlier, abandoned registration attempt in the same tab) used to make
  // the component skip the token fetch entirely, silently showing the old
  // cached registration instead of whatever the URL's token pointed to.
  it("fetches by token and shows the token's registration when a different registration is cached", async () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(staleResult));
    window.history.replaceState({}, "", "?token=NEW_TOKEN");
    const fetchSpy = mockFetchByToken(freshResult);

    render(<RegisterClient />);

    await waitFor(() => {
      expect(screen.getByTestId("conf-token")).toHaveTextContent("NEW_TOKEN");
    });

    expect(screen.getByTestId("conf-tier")).toHaveTextContent("Ultramarathoner");
    expect(screen.getByTestId("conf-participant")).toHaveTextContent("R-NEW");
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/register/by-token/NEW_TOKEN"),
    );
  });

  it("does not refetch when the URL token matches the cached registration", () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(staleResult));
    window.history.replaceState({}, "", "?token=OLD_TOKEN");
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<RegisterClient />);

    expect(screen.getByTestId("conf-token")).toHaveTextContent("OLD_TOKEN");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows the cached registration as-is when there is no token in the URL", () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(staleResult));
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<RegisterClient />);

    expect(screen.getByTestId("conf-token")).toHaveTextContent("OLD_TOKEN");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("RegisterClient — payment redirect on an unrelated device", () => {
  // Regression: a payment provider can redirect back with
  // redirect_status=succeeded on a *different* device than the one that
  // started registration (e.g. scanning a QR code with a phone) — no
  // token, no cached session, so there's no way to know which registration
  // it belongs to. It used to fall through to the tier grid, which reads
  // as if nothing happened.
  it("shows a generic thank-you instead of the tier grid when redirected with no token and no cached session", () => {
    window.history.replaceState(
      {},
      "",
      "?payment_intent=pi_123&payment_intent_client_secret=pi_123_secret_abc&redirect_status=succeeded",
    );

    render(<RegisterClient />);

    expect(
      screen.getByText("Thank you, your payment was received!"),
    ).toBeInTheDocument();
    expect(screen.getByText("We will keep you posted via email.")).toBeInTheDocument();
    expect(screen.queryByTestId("confirmation-panel")).not.toBeInTheDocument();
  });

  it("shows the tier grid as normal when there is no redirect_status in the URL", () => {
    render(<RegisterClient />);

    expect(
      screen.queryByText("Thank you, your payment was received!"),
    ).not.toBeInTheDocument();
  });
});

describe("RegisterClient — tier selection", () => {
  it("notifies parent of step change when a tier is selected", async () => {
    const onStepChange = vi.fn();
    render(<RegisterClient onStepChange={onStepChange} />);

    expect(onStepChange).toHaveBeenCalledWith("pick-tier");

    fireEvent.click(screen.getByRole("button", { name: "Select Sprinter" }));

    await waitFor(() => {
      expect(onStepChange).toHaveBeenCalledWith("registration");
    });

    expect(screen.getByRole("heading", { name: "Your details" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Select Supporter" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change tier" })).toBeInTheDocument();
  });
});
