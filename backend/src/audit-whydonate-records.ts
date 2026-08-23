/**
 * Per-record WhyDonate audit: each WD payment → sheet location + amount check.
 *
 * Usage:
 *   npm run audit-whydonate-records
 *   npm run audit-whydonate-records -- --full
 */

import { fetchAllWhyDonateDonations } from "./lib/whydonateOrders.js";
import {
  buildPerWdAuditReport,
  printPerWdAuditReport,
} from "./lib/whydonateReconcile.js";
import { SheetsService } from "./services/sheets.js";

async function main(): Promise<void> {
  const full = process.argv.includes("--full");

  console.log("Fetching WhyDonate donations…");
  const donations = await fetchAllWhyDonateDonations();
  console.log(`Loaded ${donations.length} WhyDonate donation(s).\n`);

  const sheets = new SheetsService();
  const registrations = await sheets.listRegistrationRows();
  const wallRows = await sheets.listDonorWallRows();

  const report = buildPerWdAuditReport(donations, registrations, wallRows);
  printPerWdAuditReport(report, { full });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
