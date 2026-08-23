import type { DonorWallRow, RegistrationRowMatch } from "../services/sheets.js";
import {
  type WhyDonateDonation,
  parseWhyDonateIdsFromCell,
  scoreNameMatch,
  EXCLUDED_AUTO_MARK_PAID_IDS,
} from "./whydonateOrders.js";

export interface SheetWdIndex {
  /** WD id → list of locations */
  locations: Map<number, Array<{ kind: "reg" | "wall"; id: string; status?: string }>>;
  /** All WD ids appearing on paid registrations */
  paidRegIds: Set<number>;
  /** All WD ids on sheet (paid reg, duplicate reg, wall) */
  allSheetIds: Set<number>;
}

export function buildSheetWdIndex(
  registrations: RegistrationRowMatch[],
  wallRows: DonorWallRow[],
): SheetWdIndex {
  const locations = new Map<
    number,
    Array<{ kind: "reg" | "wall"; id: string; status?: string }>
  >();
  const paidRegIds = new Set<number>();
  const allSheetIds = new Set<number>();

  for (const { row } of registrations) {
    const ids = parseWhyDonateIdsFromCell(row[21] as string);
    const pid = row[0] as string;
    const status = (row[13] as string) ?? "";
    for (const wid of ids) {
      allSheetIds.add(wid);
      if (status === "paid") {
        paidRegIds.add(wid);
      }
      const list = locations.get(wid) ?? [];
      list.push({ kind: "reg", id: pid, status });
      locations.set(wid, list);
    }
  }

  for (const wall of wallRows) {
    for (const wid of wall.whyDonateIds) {
      allSheetIds.add(wid);
      const list = locations.get(wid) ?? [];
      list.push({ kind: "wall", id: wall.slug });
      locations.set(wid, list);
    }
  }

  return { locations, paidRegIds, allSheetIds };
}

export interface LinkRecommendation {
  participantId: string;
  fullName: string;
  paidAmount: number;
  wdId: number;
  wdAmount: number;
  wdDonorName: string;
  reason: string;
}

export interface MarkPaidRecommendation {
  participantId: string;
  fullName: string;
  email: string;
  language: string;
  tierPrice: number;
  paidAmount: number;
  wdId: number;
  wdDonorName: string;
  reason: string;
}

export interface ReconciliationReport {
  wdCount: number;
  wdTotalEur: number;
  regPaidSum: number;
  wallSum: number;
  progressTotal: number;
  untracked: WhyDonateDonation[];
  orphanIds: number[];
  doubleAssigned: Array<{
    wdId: number;
    locations: Array<{ kind: "reg" | "wall"; id: string; status?: string }>;
  }>;
  linkRecommendations: LinkRecommendation[];
  markPaidRecommendations: MarkPaidRecommendation[];
  paidWithoutWdCol: Array<{
    participantId: string;
    fullName: string;
    paidAmount: number;
  }>;
}

function tierPriceFromRow(row: string[]): number {
  return Number(row[8]) || 0;
}

function paidAmountFromRow(row: string[]): number {
  const raw = (row[14] as string)?.trim();
  if (!raw) return 0;
  return Number(raw) || 0;
}

export function buildReconciliationReport(
  donations: WhyDonateDonation[],
  registrations: RegistrationRowMatch[],
  wallRows: DonorWallRow[],
): ReconciliationReport {
  const wdById = new Map(donations.map((d) => [d.id, d]));
  const index = buildSheetWdIndex(registrations, wallRows);

  let regPaidSum = 0;
  const paidWithoutWdCol: ReconciliationReport["paidWithoutWdCol"] = [];

  for (const { row } of registrations) {
    const status = (row[13] as string) ?? "";
    if (status !== "paid") continue;
    const paid = paidAmountFromRow(row);
    regPaidSum += paid;
    const wdCell = (row[21] as string)?.trim() ?? "";
    if (!wdCell || !/\d{6,}/.test(wdCell)) {
      paidWithoutWdCol.push({
        participantId: row[0] as string,
        fullName: row[1] as string,
        paidAmount: paid,
      });
    }
  }

  const wallSum = wallRows.reduce((sum, w) => sum + w.amountEur, 0);
  const wdTotalEur = donations.reduce((sum, d) => sum + d.amountEur, 0);

  const untracked = donations.filter((d) => !index.allSheetIds.has(d.id));
  const orphanIds = [...index.allSheetIds].filter((id) => !wdById.has(id));

  const doubleAssigned: ReconciliationReport["doubleAssigned"] = [];
  for (const [wdId, locs] of index.locations) {
    const onPaidReg = locs.some((l) => l.kind === "reg" && l.status === "paid");
    const onWall = locs.some((l) => l.kind === "wall");
    if (onPaidReg && onWall) {
      doubleAssigned.push({ wdId, locations: locs });
    }
  }

  const linkRecommendations: LinkRecommendation[] = [];
  const markPaidRecommendations: MarkPaidRecommendation[] = [];
  const assignedWd = new Set<number>();

  // Paid rows missing col V: link untracked WD with strong name + exact paid_amount
  for (const { row } of registrations) {
    const status = (row[13] as string) ?? "";
    if (status !== "paid") continue;

    const paidAmount = paidAmountFromRow(row);
    if (paidAmount <= 0) continue;

    const existingIds = parseWhyDonateIdsFromCell(row[21] as string);
    if (existingIds.length > 0) continue;

    const fullName = row[1] as string;
    let best: LinkRecommendation | null = null;

    for (const d of untracked) {
      if (assignedWd.has(d.id) || index.paidRegIds.has(d.id)) continue;
      if (Math.abs(d.amountEur - paidAmount) > 0.01) continue;
      const { score, reason } = scoreNameMatch(fullName, d.donorName);
      if (score < 2) continue;
      best = {
        participantId: row[0] as string,
        fullName,
        paidAmount,
        wdId: d.id,
        wdAmount: d.amountEur,
        wdDonorName: d.donorName,
        reason: reason,
      };
      break;
    }

    if (best) {
      linkRecommendations.push(best);
      assignedWd.add(best.wdId);
    }
  }

  // Pending: WD already on col V
  for (const { row } of registrations) {
    const status = (row[13] as string) ?? "";
    if (status !== "pending") continue;

    const pid = row[0] as string;
    const colIds = parseWhyDonateIdsFromCell(row[21] as string);
    if (colIds.length === 1) {
      const wid = colIds[0];
      const d = wdById.get(wid);
      if (d && !assignedWd.has(wid)) {
        markPaidRecommendations.push({
          participantId: pid,
          fullName: row[1] as string,
          email: row[2] as string,
          language: (row[5] as string) ?? "English",
          tierPrice: tierPriceFromRow(row),
          paidAmount: d.amountEur,
          wdId: wid,
          wdDonorName: d.donorName,
          reason: "pending with WD on col V",
        });
        assignedWd.add(wid);
      }
    }
  }

  // Pending: strong name match, WD >= tier, untracked
  for (const { row } of registrations) {
    const status = (row[13] as string) ?? "";
    if (status !== "pending") continue;

    const pid = row[0] as string;
    if (EXCLUDED_AUTO_MARK_PAID_IDS.has(pid)) continue;
    if (markPaidRecommendations.some((m) => m.participantId === pid)) continue;

    const tierPrice = tierPriceFromRow(row);
    const fullName = row[1] as string;

    let best: MarkPaidRecommendation | null = null;
    let bestScore = 0;

    for (const d of untracked) {
      if (assignedWd.has(d.id) || index.paidRegIds.has(d.id)) continue;
      const { score } = scoreNameMatch(fullName, d.donorName);
      if (score < 2) continue;
      if (d.amountEur < tierPrice) continue;
      if (score > bestScore || (score === bestScore && d.amountEur > (best?.paidAmount ?? 0))) {
        bestScore = score;
        best = {
          participantId: pid,
          fullName,
          email: row[2] as string,
          language: (row[5] as string) ?? "English",
          tierPrice,
          paidAmount: d.amountEur,
          wdId: d.id,
          wdDonorName: d.donorName,
          reason: "name match, WD >= tier",
        };
      }
    }

    if (best) {
      markPaidRecommendations.push(best);
      assignedWd.add(best.wdId);
    }
  }

  return {
    wdCount: donations.length,
    wdTotalEur: wdTotalEur,
    regPaidSum,
    wallSum,
    progressTotal: regPaidSum + wallSum,
    untracked,
    orphanIds,
    doubleAssigned,
    linkRecommendations,
    markPaidRecommendations: markPaidRecommendations.filter(
      (m) => !EXCLUDED_AUTO_MARK_PAID_IDS.has(m.participantId),
    ),
    paidWithoutWdCol,
  };
}

export function printReconciliationReport(report: ReconciliationReport): void {
  console.log("=== TOTALS ===");
  console.log(
    `WhyDonate API: ${report.wdCount} donations, EUR ${report.wdTotalEur.toFixed(0)}`,
  );
  console.log(
    `Progress (paid_amount + wall): EUR ${report.progressTotal.toFixed(0)} (reg ${report.regPaidSum.toFixed(0)} + wall ${report.wallSum.toFixed(0)})`,
  );
  console.log(
    `Gap (progress - WD): EUR ${(report.progressTotal - report.wdTotalEur).toFixed(0)}`,
  );

  const untrackedSum = report.untracked.reduce((s, d) => s + d.amountEur, 0);
  console.log("\n=== TRACEABILITY ===");
  console.log(
    `Untracked WD: ${report.untracked.length} ids, EUR ${untrackedSum.toFixed(0)}`,
  );
  console.log(`Orphan WD refs on sheet: ${report.orphanIds.length}`);

  if (report.untracked.length > 0) {
    console.log("\n=== UNTRACKED WD ===");
    for (const d of report.untracked) {
      console.log(`  ${d.id} EUR ${d.amountEur.toFixed(0)} ${d.donorName}`);
    }
  }

  if (report.doubleAssigned.length > 0) {
    console.log("\n=== DOUBLE-ASSIGNED (paid reg + wall) ===");
    for (const item of report.doubleAssigned) {
      console.log(`  ${item.wdId}: ${JSON.stringify(item.locations)}`);
    }
  }

  if (report.linkRecommendations.length > 0) {
    console.log("\n=== LINK col V (paid, strong match) ===");
    for (const l of report.linkRecommendations) {
      console.log(
        `  ${l.participantId} | ${l.fullName.slice(0, 28)} | EUR ${l.paidAmount.toFixed(0)} | WD ${l.wdId} (${l.wdDonorName})`,
      );
    }
  }

  if (report.markPaidRecommendations.length > 0) {
    console.log("\n=== MARK PAID (pending + WD evidence) ===");
    for (const m of report.markPaidRecommendations) {
      console.log(
        `  ${m.participantId} | ${m.fullName.slice(0, 28)} | EUR ${m.paidAmount.toFixed(0)} | WD ${m.wdId} (${m.wdDonorName}) | ${m.reason}`,
      );
    }
  }

  if (report.paidWithoutWdCol.length > 0) {
    console.log("\n=== PAID WITHOUT WD col ===");
    for (const p of report.paidWithoutWdCol) {
      console.log(
        `  ${p.participantId} | EUR ${p.paidAmount.toFixed(0)} | ${p.fullName.slice(0, 35)}`,
      );
    }
  }
}
