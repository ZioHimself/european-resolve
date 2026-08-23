import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

const mockUseEventStatus = vi.fn<() => "active" | "completed">();
const mockGetSearchParam = vi.fn<(key: string) => string | null>();

vi.mock("@/hooks/useEventStatus", () => ({
  useEventStatus: () => mockUseEventStatus(),
  getEventStatus: () => mockUseEventStatus(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => mockGetSearchParam(key),
  }),
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
  mockGetSearchParam.mockReset();
});

describe("RegisterPage — completed mode token exception", () => {
  it("shows closed banner when completed and no token", () => {
    mockUseEventStatus.mockReturnValue("completed");
    mockGetSearchParam.mockReturnValue(null);

    render(<RegisterPage />);

    expect(screen.getByText("Registration is closed")).toBeInTheDocument();
    expect(screen.queryByTestId("register-client")).not.toBeInTheDocument();
  });

  it("shows RegisterClient when completed and token is present", () => {
    mockUseEventStatus.mockReturnValue("completed");
    mockGetSearchParam.mockImplementation((key) =>
      key === "token" ? "abc" : null,
    );

    render(<RegisterPage />);

    expect(screen.getByTestId("register-client")).toBeInTheDocument();
    expect(screen.queryByText("Registration is closed")).not.toBeInTheDocument();
  });

  it("shows RegisterClient when active regardless of token", () => {
    mockUseEventStatus.mockReturnValue("active");
    mockGetSearchParam.mockReturnValue(null);

    render(<RegisterPage />);

    expect(screen.getByTestId("register-client")).toBeInTheDocument();
    expect(screen.queryByText("Registration is closed")).not.toBeInTheDocument();
  });
});
