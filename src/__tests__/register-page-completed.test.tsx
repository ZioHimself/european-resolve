import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/components/ui/Breadcrumbs", () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs" />,
}));

import RegisterPage from "@/app/events/2026-run-for-ukraine/register/page";

afterEach(() => {
  cleanup();
});

describe("RegisterPage", () => {
  it("shows closed banner", () => {
    render(<RegisterPage />);

    expect(screen.getByText("Registration is closed")).toBeInTheDocument();
    expect(screen.getByText("See the event results →")).toBeInTheDocument();
  });
});
