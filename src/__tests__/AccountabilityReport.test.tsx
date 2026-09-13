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
        chargingStations: 8,
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
  mockEventDetails.postEvent.finalStats.chargingStations = 8;
});

describe("AccountabilityReport — D-19 charging stations stat", () => {
  it("shows deployment update with three recipient units and stat card at 8", () => {
    mockEventDetails.postEvent.finalStats.chargingStations = 8;

    render(<AccountabilityReport />);

    expect(screen.getByText("Total raised")).toBeInTheDocument();
    expect(screen.getByText("Charging stations funded")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(
      screen.getByText(/Every euro raised went directly to Hurkit/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Deployment update · 12 September 2026/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Purchased for the 54th Separate Mechanised Brigade/i)).toBeInTheDocument();
    expect(screen.getByText(/Deliveries and unit reports are still in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Oukitel BP3000E/i)).toBeInTheDocument();
    expect(screen.getByText(/EcoFlow DELTA 3 Max/i)).toBeInTheDocument();
    expect(
      screen.getByText(/13th Khartiia Operational Brigade/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/30th Prince Konstanty Ostrogski Mechanized Brigade/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/air defence units that work on Shahed drone interception/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Reports from the units expected as deliveries complete/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Rewards and merchandise")).toBeInTheDocument();
    expect(
      screen.getByText(/Plenty of dog tags and other merchandise remain from the event/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Ukrainian Solidarity Café/i }),
    ).toHaveAttribute(
      "href",
      "https://maps.app.goo.gl/2sfQGd6XfAESa6nT9",
    );
    expect(
      screen.getByRole("link", { name: "olena.kuzhym@european-resolve.org" }),
    ).toHaveAttribute("href", "mailto:olena.kuzhym@european-resolve.org");
    expect(screen.getByText(/contact Olena/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Two more units in progress/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Final station count expected next week/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Hurkit will confirm how many stations/i),
    ).not.toBeInTheDocument();
  });

  it("hides charging-stations stat when chargingStations is 0 but keeps deployment section", () => {
    mockEventDetails.postEvent.finalStats.chargingStations = 0;

    render(<AccountabilityReport />);

    expect(screen.getByText("Total raised")).toBeInTheDocument();
    expect(
      screen.queryByText("Charging stations funded"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Deployment update · 12 September 2026/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/13th Khartiia Operational Brigade/i),
    ).toBeInTheDocument();
  });
});
