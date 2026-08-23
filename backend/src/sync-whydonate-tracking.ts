/**
 * WhyDonate → sheet reconciliation and processing.
 *
 * Default: audit report only (no writes).
 *
 * Apply flags (combine as needed):
 *   --apply-links    col V on paid rows (strong name + exact paid_amount)
 *   --apply-pending  mark paid pending rows with WD evidence
 *   --apply          both link and pending
 *
 *   --send           payment confirmation email when a row is newly marked paid
 *                    (skipped if the registration was already paid)
 *   --id R4U-...     limit to one participant
 *
 * Usage:
 *   npm run sync-whydonate-tracking
 *   npm run sync-whydonate-tracking -- --apply --send
 *   npm run sync-whydonate-tracking -- --apply-links --send
 *   npm run process-wd-pending -- --apply --send   (pending only; alias)
 */

import { runWhydonateSync } from "./lib/whydonateSync.js";

runWhydonateSync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
