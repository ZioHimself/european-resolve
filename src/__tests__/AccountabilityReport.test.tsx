import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

const { mockEventDetails } = vi.hoisted(() => ({
  mockEventDetails: {
    beneficiary: {
      name: "Hurkit",
      url: "https://hurkit.org",
      mission: "Charging stations",
    },
    postEvent: {
      thankYouMessage: "Thank you everyone!",
      impactStatement: "Mock impact statement for test",
      galleryDriveUrl: "",
      finalStats: {
        raised: 1500,
        participants: 42,
        donors: 10,
        chargingStations: 0,
      },
    },
  },
}));

vi.mock("@/data/event", () => ({
  eventDetails: mockEventDetails,
}));

import { AccountabilityReport } from "@/components/ui/AccountabilityReport";

afterEach(() => {
  cleanup();
  mockEventDetails.postEvent.finalStats.chargingStations = 0;
});

describe("AccountabilityReport — D-19 charging stations stat", () => {
  it("hides charging-stations stat when chargingStations is 0", () => {
    mockEventDetails.postEvent.finalStats.chargingStations = 0;

    render(<AccountabilityReport />);

    expect(screen.getByText("Total raised")).toBeInTheDocument();
    expect(
      screen.getByText("Mock impact statement for test"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Hurkit will confirm how many stations/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Charging stations funded"),
    ).not.toBeInTheDocument();
  });

  it("shows charging-stations stat when chargingStations is greater than 0", () => {
    mockEventDetails.postEvent.finalStats.chargingStations = 5;

    render(<AccountabilityReport />);

    expect(screen.getByText("Charging stations funded")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Total raised")).toBeInTheDocument();
    expect(
      screen.queryByText(/Hurkit will confirm how many stations/i),
    ).not.toBeInTheDocument();
  });
});
