/**
 * WhyDonate → sheet reconciliation (safe for periodic runs).
 *
 * Default: audit report only (no writes).
 * --apply-links: set col V on paid registrations with strong name match +
 *   exact paid_amount to an untracked WhyDonate id.
 *
 * Usage:
 *   npm run sync-whydonate-tracking
 *   npm run sync-whydonate-tracking -- --apply-links
 */

import { setTimeout as sleep } from "node:timers/promises";
import { fetchAllWhyDonateDonations } from "./lib/whydonateOrders.js";
import {
  buildReconciliationReport,
  printReconciliationReport,
} from "./lib/whydonateReconcile.js";
import { SheetsService } from "./services/sheets.js";

const WRITE_DELAY_MS = 1200;

async function main(): Promise<void> {
  const applyLinks = process.argv.includes("--apply-links");

  console.log("Fetching WhyDonate donations…");
  const donations = await fetchAllWhyDonateDonations();
  console.log(`Loaded ${donations.length} WhyDonate donation(s).`);

  const sheets = new SheetsService();
  const registrations = await sheets.listRegistrationRows();
  const wallRows = await sheets.listDonorWallRows();

  const report = buildReconciliationReport(
    donations,
    registrations,
    wallRows,
  );
  printReconciliationReport(report);

  if (!applyLinks) {
    console.log("\nDry run — no sheet changes. Pass --apply-links to apply col V links.");
    return;
  }

  if (report.linkRecommendations.length === 0) {
    console.log("\nNo link recommendations to apply.");
    return;
  }

  console.log(`\nApplying ${report.linkRecommendations.length} col V link(s)…`);

  for (const link of report.linkRecommendations) {
    const result = await sheets.setRegistrationWhyDonateIds(
      link.participantId,
      [link.wdId],
      true,
    );
    if (!result.success) {
      console.error(`  FAIL ${link.participantId}: ${result.error}`);
    } else {
      console.log(
        `  LINK ${link.participantId} <- WD ${link.wdId} (${link.wdDonorName})`,
      );
    }
    await sleep(WRITE_DELAY_MS);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
