/**
 * Process pending registrations with WhyDonate payment evidence.
 *
 * Alias for sync-whydonate-tracking with --apply-pending (see lib/whydonateSync.ts).
 *
 * Usage:
 *   npm run process-wd-pending
 *   npm run process-wd-pending -- --apply
 *   npm run process-wd-pending -- --apply --send
 *   npm run process-wd-pending -- --apply --send --id R4U-33OMOB
 */

import { runWhydonateSync } from "./lib/whydonateSync.js";

const argv = [...process.argv];
if (
  argv.includes("--apply") &&
  !argv.includes("--apply-links") &&
  !argv.includes("--apply-pending")
) {
  argv.push("--apply-pending");
}

runWhydonateSync(argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
