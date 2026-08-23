/**
 * Process pending registrations with WhyDonate payment evidence.
 *
 * Default: report MARK PAID recommendations (no writes).
 * --apply: mark paid + set col V for recommended rows.
 * --send: also send payment confirmation email (requires --apply).
 *
 * Only high-confidence matches: pending row already has WD on col V, or
 * strong word-level name match with WD amount >= tier minimum.
 *
 * Usage:
 *   npm run process-wd-pending
 *   npm run process-wd-pending -- --apply
 *   npm run process-wd-pending -- --apply --send
 *   npm run process-wd-pending -- --apply --send --id R4U-33OMOB
 */

import { setTimeout as sleep } from "node:timers/promises";
import type { Language } from "./types.js";
import { fetchAllWhyDonateDonations } from "./lib/whydonateOrders.js";
import {
  buildReconciliationReport,
  printReconciliationReport,
} from "./lib/whydonateReconcile.js";
import { SheetsService } from "./services/sheets.js";
import { sendPaymentConfirmationEmail } from "./services/email.js";

const WRITE_DELAY_MS = 1500;

function parseParticipantFilter(argv: string[]): string | null {
  const idx = argv.indexOf("--id");
  if (idx === -1 || !argv[idx + 1]) return null;
  return argv[idx + 1].trim();
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const send = process.argv.includes("--send");
  const onlyId = parseParticipantFilter(process.argv);

  if (send && !apply) {
    console.error("--send requires --apply");
    process.exit(1);
  }

  console.log("Fetching WhyDonate donations…");
  const donations = await fetchAllWhyDonateDonations();

  const sheets = new SheetsService();
  const registrations = await sheets.listRegistrationRows();
  const wallRows = await sheets.listDonorWallRows();

  const report = buildReconciliationReport(
    donations,
    registrations,
    wallRows,
  );

  let toProcess = report.markPaidRecommendations;
  if (onlyId) {
    toProcess = toProcess.filter((m) => m.participantId === onlyId);
    if (toProcess.length === 0) {
      console.log(`No MARK PAID recommendation for ${onlyId}.`);
      printReconciliationReport(report);
      process.exit(0);
    }
  }

  console.log("\n=== MARK PAID queue ===");
  for (const m of toProcess) {
    console.log(
      `  ${m.participantId} | ${m.fullName.slice(0, 28)} | EUR ${m.paidAmount.toFixed(0)} | WD ${m.wdId} | ${m.reason}`,
    );
  }

  if (!apply) {
    printReconciliationReport(report);
    console.log(
      "\nDry run — no sheet changes. Pass --apply (and optionally --send) to process.",
    );
    return;
  }

  console.log(`\nProcessing ${toProcess.length} registration(s)…`);

  for (const item of toProcess) {
    const result = await sheets.markPaidByParticipantId(
      item.participantId,
      item.paidAmount,
      item.wdId,
    );

    if (!result.success) {
      console.error(`  FAIL ${item.participantId}: ${result.error}`);
      await sleep(WRITE_DELAY_MS);
      continue;
    }

    console.log(
      `  MARK PAID ${item.participantId} EUR ${item.paidAmount.toFixed(0)} WD ${item.wdId}`,
    );

    if (send && !result.alreadyPaid) {
      try {
        await sendPaymentConfirmationEmail(
          {
            name: result.firstName,
            email: result.email,
            participantId: result.participantId,
            tierName: result.tierName,
            amountEur: result.amountEur,
            rewards: result.rewards,
          },
          result.language as Language,
        );
        console.log(`  EMAIL sent to ${result.email}`);
      } catch (err) {
        console.error(`  EMAIL failed for ${item.participantId}:`, err);
      }
    } else if (result.alreadyPaid) {
      console.log(`  (already paid — WD col updated if needed)`);
    }

    await sleep(WRITE_DELAY_MS);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
