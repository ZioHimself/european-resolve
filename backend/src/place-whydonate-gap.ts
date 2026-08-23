/**
 * Place untracked WhyDonate payments: top-ups on existing paid rows + new paid registrations.
 *
 * Usage:
 *   npm run place-whydonate-gap          # dry run
 *   npm run place-whydonate-gap -- --apply
 */

import { setTimeout as sleep } from "node:timers/promises";
import { fetchAllWhyDonateDonations } from "./lib/whydonateOrders.js";
import { buildSheetWdIndex } from "./lib/whydonateReconcile.js";
import { SheetsService } from "./services/sheets.js";

const WRITE_DELAY_MS = 1200;

interface TopUpAction {
  participantId: string;
  label: string;
  newPaidAmount: number;
  wdId: number;
}

interface LinkAction {
  participantId: string;
  label: string;
  wdId: number;
}

interface CreateAction {
  wdId: number;
  donorName: string;
  amountEur: number;
}

const TOP_UPS: TopUpAction[] = [
  {
    participantId: "R4U-346VXU",
    label: "Antoine Delers +€6",
    newPaidAmount: 21,
    wdId: 1992502,
  },
  {
    participantId: "R4U-329NUV",
    label: "Anastasiia Babych +€6",
    newPaidAmount: 51,
    wdId: 1992733,
  },
  {
    participantId: "R4U-2S0GMJ",
    label: "Svitlana Bielobabko +€6",
    newPaidAmount: 21,
    wdId: 1992753,
  },
  {
    participantId: "R4U-2LSHYP",
    label: "Olena Pokidailo +€12",
    newPaidAmount: 27,
    wdId: 1992447,
  },
];

const LINKS: LinkAction[] = [
  {
    participantId: "R4U-3736GC",
    label: "Andrea Sanchez (joao cluster)",
    wdId: 1992474,
  },
];

const CREATES: CreateAction[] = [
  { wdId: 1991764, donorName: "Elena", amountEur: 30 },
  { wdId: 1991840, donorName: "Tykhon", amountEur: 15 },
  { wdId: 1992661, donorName: "Ruben", amountEur: 15 },
  { wdId: 1992662, donorName: "Philip", amountEur: 50 },
  { wdId: 1992678, donorName: "Oksana", amountEur: 6 },
  { wdId: 1992756, donorName: "Kateryna", amountEur: 50 },
  { wdId: 1992496, donorName: "Anonymous", amountEur: 60 },
  { wdId: 1992396, donorName: "Anonymous", amountEur: 15 },
  { wdId: 1992425, donorName: "Anonymous", amountEur: 15 },
];

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");

  const donations = await fetchAllWhyDonateDonations();
  const wdById = new Map(donations.map((d) => [d.id, d]));
  const sheets = new SheetsService();
  const index = buildSheetWdIndex(
    await sheets.listRegistrationRows(),
    await sheets.listDonorWallRows(),
  );

  console.log("=== PLANNED ACTIONS ===\n");

  for (const action of TOP_UPS) {
    const wd = wdById.get(action.wdId);
    const onSheet = index.allSheetIds.has(action.wdId);
    console.log(
      `TOP-UP ${action.participantId} | ${action.label} | WD ${action.wdId} EUR ${wd?.amountEur ?? "?"} ${wd?.donorName ?? ""}${onSheet ? " (already on sheet)" : ""}`,
    );
  }

  for (const action of LINKS) {
    const wd = wdById.get(action.wdId);
    const onSheet = index.allSheetIds.has(action.wdId);
    console.log(
      `LINK ${action.participantId} | ${action.label} | WD ${action.wdId} EUR ${wd?.amountEur ?? "?"}${onSheet ? " (already on sheet)" : ""}`,
    );
  }

  for (const action of CREATES) {
    const wd = wdById.get(action.wdId);
    const onSheet = index.allSheetIds.has(action.wdId);
    console.log(
      `CREATE | ${action.donorName} EUR ${action.amountEur} | WD ${action.wdId}${onSheet ? " (already on sheet — skip)" : ""}`,
    );
    if (!wd) console.log("  WARN: WD id not in API");
  }

  if (!apply) {
    console.log("\nDry run — pass --apply to write.");
    return;
  }

  console.log("\n=== APPLYING ===\n");

  for (const action of TOP_UPS) {
    if (index.allSheetIds.has(action.wdId)) {
      console.log(`SKIP top-up WD ${action.wdId} already on sheet`);
      continue;
    }
    const result = await sheets.adjustPaidAmountAndWhyDonate(
      action.participantId,
      action.newPaidAmount,
      action.wdId,
    );
    if (!result.success) {
      console.error(`FAIL ${action.participantId}: ${result.error}`);
    } else {
      console.log(`OK TOP-UP ${action.participantId} -> EUR ${action.newPaidAmount} WD ${action.wdId}`);
    }
    await sleep(WRITE_DELAY_MS);
  }

  for (const action of LINKS) {
    if (index.allSheetIds.has(action.wdId)) {
      console.log(`SKIP link WD ${action.wdId} already on sheet`);
      continue;
    }
    const result = await sheets.setRegistrationWhyDonateIds(
      action.participantId,
      [action.wdId],
      true,
    );
    if (!result.success) {
      console.error(`FAIL LINK ${action.participantId}: ${result.error}`);
    } else {
      console.log(`OK LINK ${action.participantId} <- WD ${action.wdId}`);
    }
    await sleep(WRITE_DELAY_MS);
  }

  for (const action of CREATES) {
    if (index.allSheetIds.has(action.wdId)) {
      console.log(`SKIP create WD ${action.wdId} already on sheet`);
      continue;
    }
    const wd = wdById.get(action.wdId);
    if (!wd) {
      console.error(`FAIL CREATE WD ${action.wdId}: not in API`);
      continue;
    }
    const amount = wd.amountEur;
    const donorName = wd.donorName || action.donorName;
    const result = await sheets.recordWhyDonatePaidRegistration(
      donorName,
      amount,
      action.wdId,
    );
    console.log(
      `OK CREATE ${result.participantId} | ${result.fullName} | EUR ${amount} | WD ${action.wdId}`,
    );
    await sleep(WRITE_DELAY_MS);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
