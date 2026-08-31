import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

const mockUseEventStatus = vi.fn<() => "active" | "completed">();

vi.mock("@/hooks/useEventStatus", () => ({
  useEventStatus: () => mockUseEventStatus(),
  getEventStatus: () => mockUseEventStatus(),
}));

vi.mock("@/components/ui/RegisterClient", () => ({
  RegisterClient: () => <div data-testid="register-client" />,
}));

vi.mock("@/components/ui/Breadcrumbs", () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs" />,
}));

vi.mock("@/components/ui/StockWarningBanner", () => ({
  StockWarningBanner: () => null,
}));

import RegisterPage from "@/app/events/2026-run-for-ukraine/register/page";

afterEach(() => {
  cleanup();
  mockUseEventStatus.mockReset();
});

describe("RegisterPage — completed mode", () => {
  it("shows closed banner when completed", () => {
    mockUseEventStatus.mockReturnValue("completed");

    render(<RegisterPage />);

    expect(screen.getByText("Registration is closed")).toBeInTheDocument();
    expect(screen.queryByTestId("register-client")).not.toBeInTheDocument();
  });

  it("shows RegisterClient when active", () => {
    mockUseEventStatus.mockReturnValue("active");

    render(<RegisterPage />);

    expect(screen.getByTestId("register-client")).toBeInTheDocument();
    expect(screen.queryByText("Registration is closed")).not.toBeInTheDocument();
  });
});
