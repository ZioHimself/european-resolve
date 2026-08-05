import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
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
