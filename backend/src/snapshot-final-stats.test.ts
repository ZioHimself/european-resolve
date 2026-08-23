import { describe, expect, it, vi } from "vitest";
import {
  applyFinalStatsPatch,
  buildSnapshot,
  parseChargingStations,
  runSnapshot,
} from "./snapshot-final-stats.js";

const mockProgress = {
  totalRaisedEur: 4520,
  participantCount: 87,
  donorCount: 112,
};

const eventFixture = `export const eventDetails = {
  postEvent: {
    thankYouMessage: "Thank you everyone!",
    impactStatement: "Every euro went to Hurkit.",
    galleryFolderId: "",
    finalStats: {
      raised: 0,
      participants: 0,
      donors: 0,
      chargingStations: 0,
    },
  },
};`;

describe("buildSnapshot", () => {
  it("maps getProgress fields to finalStats shape", () => {
    expect(buildSnapshot(mockProgress)).toEqual({
      raised: 4520,
      participants: 87,
      donors: 112,
    });
  });

  it("includes chargingStations only when flag value is provided", () => {
    expect(buildSnapshot(mockProgress, 5)).toEqual({
      raised: 4520,
      participants: 87,
      donors: 112,
      chargingStations: 5,
    });
    expect(buildSnapshot(mockProgress)).not.toHaveProperty("chargingStations");
  });

  it("never derives chargingStations from raised total", () => {
    const snapshot = buildSnapshot({ ...mockProgress, totalRaisedEur: 99999 });
    expect(snapshot).not.toHaveProperty("chargingStations");
    expect(snapshot.raised).toBe(99999);
  });
});

describe("parseChargingStations", () => {
  it("parses --charging-stations N from argv", () => {
    expect(parseChargingStations(["--charging-stations", "5"])).toBe(5);
    expect(parseChargingStations(["node", "script.ts"])).toBeUndefined();
  });

  it("rejects invalid charging-stations values", () => {
    expect(() => parseChargingStations(["--charging-stations"])).toThrow(
      "--charging-stations requires a numeric argument",
    );
    expect(() => parseChargingStations(["--charging-stations", "x"])).toThrow(
      "--charging-stations must be a non-negative integer",
    );
  });
});

describe("applyFinalStatsPatch", () => {
  it("replaces only finalStats raised, participants, and donors", () => {
    const patched = applyFinalStatsPatch(eventFixture, {
      raised: 4520,
      participants: 87,
      donors: 112,
    });

    expect(patched).toContain("raised: 4520");
    expect(patched).toContain("participants: 87");
    expect(patched).toContain("donors: 112");
    expect(patched).toContain("chargingStations: 0");
    expect(patched).toContain('thankYouMessage: "Thank you everyone!"');
    expect(patched).toContain(
      'impactStatement: "Every euro went to Hurkit."',
    );
    expect(patched).toContain('galleryFolderId: ""');
  });
});

describe("runSnapshot", () => {
  it("prints JSON to stdout without --apply", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const sheets = {
      getProgress: vi.fn().mockResolvedValue(mockProgress),
    };

    await runSnapshot(["--charging-stations", "5"], sheets);

    expect(sheets.getProgress).toHaveBeenCalledOnce();
    expect(logSpy).toHaveBeenCalledWith(
      JSON.stringify(
        {
          raised: 4520,
          participants: 87,
          donors: 112,
          chargingStations: 5,
        },
        null,
        2,
      ),
    );

    logSpy.mockRestore();
  });

  it("propagates getProgress rejection for non-zero exit handling", async () => {
    const sheets = {
      getProgress: vi.fn().mockRejectedValue(new Error("Sheets unavailable")),
    };

    await expect(runSnapshot([], sheets)).rejects.toThrow("Sheets unavailable");
  });
});
