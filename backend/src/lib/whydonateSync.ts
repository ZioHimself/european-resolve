import { setTimeout as sleep } from "node:timers/promises";
import type { Language } from "../types.js";
import { fetchAllWhyDonateDonations } from "./whydonateOrders.js";
import {
  buildReconciliationReport,
  printReconciliationReport,
  type LinkRecommendation,
  type MarkPaidRecommendation,
} from "./whydonateReconcile.js";
import { SheetsService } from "../services/sheets.js";
import { sendPaymentConfirmationEmail } from "../services/email.js";

const WRITE_DELAY_MS = 1200;

export interface WhydonateSyncOptions {
  applyLinks: boolean;
  applyPending: boolean;
  send: boolean;
  onlyId: string | null;
}

export function parseWhydonateSyncOptions(argv: string[]): WhydonateSyncOptions {
  const send = argv.includes("--send");
  const applyAll = argv.includes("--apply");
  const applyLinks = applyAll || argv.includes("--apply-links");
  const applyPending = applyAll || argv.includes("--apply-pending");

  const idIdx = argv.indexOf("--id");
  const onlyId =
    idIdx !== -1 && argv[idIdx + 1] ? argv[idIdx + 1].trim() : null;

  return { applyLinks, applyPending, send, onlyId };
}

async function sendConfirmation(
  result: {
    firstName: string;
    email: string;
    participantId: string;
    tierName: string;
    amountEur: number;
    rewards: string[];
    language: string;
  },
): Promise<void> {
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
}

async function applyLink(
  sheets: SheetsService,
  link: LinkRecommendation,
  send: boolean,
): Promise<void> {
  const result = await sheets.markPaidByParticipantId(
    link.participantId,
    link.paidAmount,
    link.wdId,
  );

  if (!result.success) {
    console.error(`  FAIL LINK ${link.participantId}: ${result.error}`);
    return;
  }

  console.log(
    `  LINK ${link.participantId} <- WD ${link.wdId} (${link.wdDonorName})${result.alreadyPaid ? " (already paid)" : ""}`,
  );

  if (send && !result.alreadyPaid) {
    try {
      await sendConfirmation(result);
    } catch (err) {
      console.error(`  EMAIL failed for ${link.participantId}:`, err);
    }
  } else if (send && result.alreadyPaid) {
    console.log(`  (already paid — confirmation email skipped)`);
  }
}

async function applyMarkPaid(
  sheets: SheetsService,
  item: MarkPaidRecommendation,
  send: boolean,
): Promise<void> {
  const result = await sheets.markPaidByParticipantId(
    item.participantId,
    item.paidAmount,
    item.wdId,
  );

  if (!result.success) {
    console.error(`  FAIL MARK PAID ${item.participantId}: ${result.error}`);
    return;
  }

  console.log(
    `  MARK PAID ${item.participantId} EUR ${item.paidAmount.toFixed(0)} WD ${item.wdId}${result.alreadyPaid ? " (already paid)" : ""}`,
  );

  if (send && !result.alreadyPaid) {
    try {
      await sendConfirmation(result);
    } catch (err) {
      console.error(`  EMAIL failed for ${item.participantId}:`, err);
    }
  } else if (send && result.alreadyPaid) {
    console.log(`  (already paid — confirmation email skipped)`);
  }
}

export async function runWhydonateSync(argv: string[]): Promise<void> {
  const options = parseWhydonateSyncOptions(argv);

  if (
    options.send &&
    !options.applyLinks &&
    !options.applyPending
  ) {
    console.error(
      "--send requires --apply, --apply-links, or --apply-pending",
    );
    process.exit(1);
  }

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

  let links = report.linkRecommendations;
  let pending = report.markPaidRecommendations;

  if (options.onlyId) {
    links = links.filter((l) => l.participantId === options.onlyId);
    pending = pending.filter((m) => m.participantId === options.onlyId);
    if (
      options.applyLinks &&
      links.length === 0 &&
      options.applyPending &&
      pending.length === 0
    ) {
      console.log(`No link or MARK PAID recommendation for ${options.onlyId}.`);
      return;
    }
    if (options.applyLinks && !options.applyPending && links.length === 0) {
      console.log(`No link recommendation for ${options.onlyId}.`);
    }
    if (options.applyPending && !options.applyLinks && pending.length === 0) {
      console.log(`No MARK PAID recommendation for ${options.onlyId}.`);
    }
  }

  if (!options.applyLinks && !options.applyPending) {
    console.log(
      "\nDry run — no sheet changes. Pass --apply-links, --apply-pending, or --apply (both). Add --send for confirmation emails.",
    );
    return;
  }

  if (options.applyLinks) {
    if (links.length === 0) {
      console.log("\nNo link recommendations to apply.");
    } else {
      console.log(`\nApplying ${links.length} col V link(s)…`);
      for (const link of links) {
        await applyLink(sheets, link, options.send);
        await sleep(WRITE_DELAY_MS);
      }
    }
  }

  if (options.applyPending) {
    if (pending.length === 0) {
      console.log("\nNo MARK PAID recommendations to apply.");
    } else {
      console.log(`\nProcessing ${pending.length} pending registration(s)…`);
      for (const item of pending) {
        console.log(
          `  queue: ${item.participantId} | ${item.fullName.slice(0, 28)} | EUR ${item.paidAmount.toFixed(0)} | WD ${item.wdId} | ${item.reason}`,
        );
        await applyMarkPaid(sheets, item, options.send);
        await sleep(WRITE_DELAY_MS);
      }
    }
  }

  console.log("Done.");
}
