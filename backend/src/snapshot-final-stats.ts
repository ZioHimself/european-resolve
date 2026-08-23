/**
 * Ops snapshot: read reconciled totals from Google Sheets for event.ts finalStats.
 *
 * Run only after `npm run audit-whydonate-records` is clean (reconciliation gate).
 *
 * participants counts all registration rows (paid and pending), matching live
 * /api/progress via SheetsService.getProgress(). It is not paid-only headcount.
 *
 * Usage:
 *   npm run snapshot-final-stats
 *   npm run snapshot-final-stats -- --charging-stations 12
 *   npm run snapshot-final-stats -- --apply
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SheetsService } from "./services/sheets.js";

export type FinalStatsSnapshot = {
  raised: number;
  participants: number;
  donors: number;
  chargingStations?: number;
};

export type ProgressData = {
  totalRaisedEur: number;
  participantCount: number;
  donorCount: number;
};

export function buildSnapshot(
  progress: ProgressData,
  chargingStations?: number,
): FinalStatsSnapshot {
  const snapshot: FinalStatsSnapshot = {
    raised: progress.totalRaisedEur,
    participants: progress.participantCount,
    donors: progress.donorCount,
  };

  if (chargingStations !== undefined) {
    snapshot.chargingStations = chargingStations;
  }

  return snapshot;
}

export function applyFinalStatsPatch(
  content: string,
  snapshot: Pick<FinalStatsSnapshot, "raised" | "participants" | "donors">,
): string {
  let result = content;

  result = result.replace(
    /(finalStats:\s*\{[\s\S]*?raised:\s*)\d+/,
    `$1${snapshot.raised}`,
  );
  result = result.replace(
    /(finalStats:\s*\{[\s\S]*?participants:\s*)\d+/,
    `$1${snapshot.participants}`,
  );
  result = result.replace(
    /(finalStats:\s*\{[\s\S]*?donors:\s*)\d+/,
    `$1${snapshot.donors}`,
  );

  return result;
}

export function parseChargingStations(argv: string[]): number | undefined {
  const idx = argv.indexOf("--charging-stations");
  if (idx === -1) {
    return undefined;
  }

  const raw = argv[idx + 1];
  if (!raw) {
    throw new Error("--charging-stations requires a numeric argument");
  }

  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("--charging-stations must be a non-negative integer");
  }

  return value;
}

type ProgressReader = {
  getProgress: () => Promise<ProgressData>;
};

export async function runSnapshot(
  argv: string[],
  sheets: ProgressReader,
): Promise<FinalStatsSnapshot> {
  const apply = argv.includes("--apply");
  const chargingStations = parseChargingStations(argv);
  const progress = await sheets.getProgress();
  const snapshot = buildSnapshot(progress, chargingStations);

  if (apply) {
    const scriptDir = dirname(fileURLToPath(import.meta.url));
    const eventPath = join(scriptDir, "../../src/data/event.ts");
    const content = readFileSync(eventPath, "utf8");
    const patched = applyFinalStatsPatch(content, snapshot);
    writeFileSync(eventPath, patched, "utf8");
    console.warn(
      "Patched finalStats.raised, .participants, .donors in src/data/event.ts.",
    );
    console.warn(
      "Update thankYouMessage and impactStatement manually before closure commit.",
    );
  } else {
    console.log(JSON.stringify(snapshot, null, 2));
  }

  return snapshot;
}

async function main(): Promise<void> {
  const sheets = new SheetsService();
  await runSnapshot(process.argv, sheets);
}

const isMainModule =
  typeof process.argv[1] === "string" &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMainModule) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
