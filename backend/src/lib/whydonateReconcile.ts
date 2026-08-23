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

export type WdRecordVerdict =
  | "ok"
  | "missing"
  | "pending_reg"
  | "paid_amount_mismatch"
  | "double_count";

export interface WdSheetLocation {
  kind: "reg" | "wall";
  refId: string;
  displayName: string;
  regStatus?: string;
  rowPaidAmountEur: number;
  rowWdIds: number[];
  rowWdSumEur: number;
}

export interface WdRecordAuditRow {
  wdId: number;
  wdAmountEur: number;
  donorName: string;
  locations: WdSheetLocation[];
  verdict: WdRecordVerdict;
  detail: string;
}

export interface PhantomPaidRow {
  participantId: string;
  fullName: string;
  paidAmountEur: number;
  colV: string;
}

export interface MultiWdRowMismatch {
  participantId: string;
  fullName: string;
  paidAmountEur: number;
  wdIds: number[];
  wdSumEur: number;
  deltaEur: number;
}

export interface PerWdAuditReport {
  wdCount: number;
  wdTotalEur: number;
  progressTotalEur: number;
  regPaidSumEur: number;
  wallSumEur: number;
  gapEur: number;
  /** WD amounts with no sheet reference */
  missingWdEur: number;
  missingCount: number;
  /** paid_amount on paid rows with empty col V (excludes €0) */
  phantomProgressEur: number;
  phantomCount: number;
  /** WD ids referenced on sheet but absent from API */
  orphanIds: number[];
  multiWdRowMismatches: MultiWdRowMismatch[];
  phantomPaidRows: PhantomPaidRow[];
  records: WdRecordAuditRow[];
}

function sumWdAmounts(
  ids: number[],
  wdById: Map<number, WhyDonateDonation>,
): number {
  let sum = 0;
  for (const id of ids) {
    const d = wdById.get(id);
    if (d) sum += d.amountEur;
  }
  return sum;
}

function buildLocationFromReg(
  row: string[],
  wdById: Map<number, WhyDonateDonation>,
): WdSheetLocation {
  const rowWdIds = parseWhyDonateIdsFromCell(row[21] as string);
  return {
    kind: "reg",
    refId: row[0] as string,
    displayName: row[1] as string,
    regStatus: (row[13] as string) ?? "",
    rowPaidAmountEur: paidAmountFromRow(row),
    rowWdIds,
    rowWdSumEur: sumWdAmounts(rowWdIds, wdById),
  };
}

export function buildPerWdAuditReport(
  donations: WhyDonateDonation[],
  registrations: RegistrationRowMatch[],
  wallRows: DonorWallRow[],
): PerWdAuditReport {
  const wdById = new Map(donations.map((d) => [d.id, d]));
  const index = buildSheetWdIndex(registrations, wallRows);

  const regByPid = new Map<string, string[]>();
  for (const { row } of registrations) {
    regByPid.set(row[0] as string, row);
  }

  const multiWdRowMismatches: MultiWdRowMismatch[] = [];
  const seenMismatchPid = new Set<string>();

  for (const { row } of registrations) {
    const status = (row[13] as string) ?? "";
    if (status !== "paid") continue;
    const paid = paidAmountFromRow(row);
    const wdIds = parseWhyDonateIdsFromCell(row[21] as string);
    if (wdIds.length === 0) continue;
    const wdSum = sumWdAmounts(wdIds, wdById);
    const pid = row[0] as string;
    if (Math.abs(paid - wdSum) > 0.01 && !seenMismatchPid.has(pid)) {
      seenMismatchPid.add(pid);
      multiWdRowMismatches.push({
        participantId: pid,
        fullName: row[1] as string,
        paidAmountEur: paid,
        wdIds,
        wdSumEur: wdSum,
        deltaEur: paid - wdSum,
      });
    }
  }

  const phantomPaidRows: PhantomPaidRow[] = [];
  let phantomProgressEur = 0;
  let regPaidSumEur = 0;

  for (const { row } of registrations) {
    const status = (row[13] as string) ?? "";
    if (status !== "paid") continue;
    const paid = paidAmountFromRow(row);
    regPaidSumEur += paid;
    const colV = (row[21] as string)?.trim() ?? "";
    if (!colV || !/\d{6,}/.test(colV)) {
      phantomPaidRows.push({
        participantId: row[0] as string,
        fullName: row[1] as string,
        paidAmountEur: paid,
        colV,
      });
      if (paid > 0) phantomProgressEur += paid;
    }
  }

  const wallSumEur = wallRows.reduce((sum, w) => sum + w.amountEur, 0);
  const progressTotalEur = regPaidSumEur + wallSumEur;
  const wdTotalEur = donations.reduce((sum, d) => sum + d.amountEur, 0);

  const records: WdRecordAuditRow[] = [];

  for (const d of donations) {
    const locs = index.locations.get(d.id) ?? [];
    const locations: WdSheetLocation[] = [];

    for (const loc of locs) {
      if (loc.kind === "reg") {
        const row = regByPid.get(loc.id);
        if (row) {
          locations.push(buildLocationFromReg(row, wdById));
        }
      } else {
        const wall =
          wallRows.find((w) => w.whyDonateIds.includes(d.id)) ??
          wallRows.find((w) => w.slug === loc.id);
        if (wall) {
          locations.push({
            kind: "wall",
            refId: wall.slug,
            displayName: wall.donorName,
            rowPaidAmountEur: wall.amountEur,
            rowWdIds: wall.whyDonateIds,
            rowWdSumEur: sumWdAmounts(wall.whyDonateIds, wdById),
          });
        }
      }
    }

    let verdict: WdRecordVerdict;
    let detail: string;

    if (locations.length === 0) {
      verdict = "missing";
      detail = "not on registration col V or donor wall col F";
    } else {
      const onPaidReg = locations.some(
        (l) => l.kind === "reg" && l.regStatus === "paid",
      );
      const onWall = locations.some((l) => l.kind === "wall");
      const onPendingReg = locations.some(
        (l) => l.kind === "reg" && l.regStatus === "pending",
      );

      if (onPaidReg && onWall) {
        verdict = "double_count";
        detail = "WD id on paid registration and donor wall";
      } else if (onPendingReg && !onPaidReg) {
        verdict = "pending_reg";
        detail = "on pending registration only";
      } else if (onPaidReg) {
        const regLoc = locations.find((l) => l.kind === "reg")!;
        if (Math.abs(regLoc.rowPaidAmountEur - regLoc.rowWdSumEur) > 0.01) {
          verdict = "paid_amount_mismatch";
          detail = `row paid_amount EUR ${regLoc.rowPaidAmountEur.toFixed(0)} vs sum(WD on row) EUR ${regLoc.rowWdSumEur.toFixed(0)}`;
        } else if (
          regLoc.rowWdIds.length === 1 &&
          Math.abs(regLoc.rowPaidAmountEur - d.amountEur) > 0.01
        ) {
          verdict = "paid_amount_mismatch";
          detail = `row paid_amount EUR ${regLoc.rowPaidAmountEur.toFixed(0)} vs this WD EUR ${d.amountEur.toFixed(0)}`;
        } else {
          verdict = "ok";
          detail =
            regLoc.rowWdIds.length > 1
              ? `aggregate row (${regLoc.rowWdIds.length} WD ids, sums match)`
              : "paid registration, amounts match";
        }
      } else if (onWall) {
        const wallLoc = locations.find((l) => l.kind === "wall")!;
        if (Math.abs(wallLoc.rowPaidAmountEur - d.amountEur) > 0.01) {
          verdict = "paid_amount_mismatch";
          detail = `wall EUR ${wallLoc.rowPaidAmountEur.toFixed(0)} vs WD EUR ${d.amountEur.toFixed(0)}`;
        } else {
          verdict = "ok";
          detail = "donor wall, amount matches";
        }
      } else {
        verdict = "pending_reg";
        detail = "registration not paid";
      }
    }

    records.push({
      wdId: d.id,
      wdAmountEur: d.amountEur,
      donorName: d.donorName,
      locations,
      verdict,
      detail,
    });
  }

  records.sort((a, b) => {
    const order: Record<WdRecordVerdict, number> = {
      missing: 0,
      paid_amount_mismatch: 1,
      double_count: 2,
      pending_reg: 3,
      ok: 4,
    };
    const oa = order[a.verdict];
    const ob = order[b.verdict];
    if (oa !== ob) return oa - ob;
    return a.wdId - b.wdId;
  });

  const missing = records.filter((r) => r.verdict === "missing");
  const missingWdEur = missing.reduce((s, r) => s + r.wdAmountEur, 0);
  const orphanIds = [...index.allSheetIds].filter((id) => !wdById.has(id));

  return {
    wdCount: donations.length,
    wdTotalEur,
    progressTotalEur,
    regPaidSumEur,
    wallSumEur,
    gapEur: progressTotalEur - wdTotalEur,
    missingWdEur,
    missingCount: missing.length,
    phantomProgressEur,
    phantomCount: phantomPaidRows.filter((p) => p.paidAmountEur > 0).length,
    orphanIds,
    multiWdRowMismatches,
    phantomPaidRows,
    records,
  };
}

function formatSheetRef(loc: WdSheetLocation): string {
  if (loc.kind === "reg") {
    return `${loc.refId} | ${loc.displayName.slice(0, 24)} | ${loc.regStatus} | paid EUR ${loc.rowPaidAmountEur.toFixed(0)} | colV ${loc.rowWdIds.join(",")}`;
  }
  return `wall:${loc.refId} | ${loc.displayName.slice(0, 24)} | EUR ${loc.rowPaidAmountEur.toFixed(0)} | WD ${loc.rowWdIds.join(",")}`;
}

export function printPerWdAuditReport(
  report: PerWdAuditReport,
  options?: { full?: boolean },
): void {
  const full = options?.full ?? false;

  console.log("=== PER-WD AUDIT SUMMARY ===");
  console.log(
    `WhyDonate API: ${report.wdCount} records, EUR ${report.wdTotalEur.toFixed(0)}`,
  );
  console.log(
    `Progress (paid_amount + wall): EUR ${report.progressTotalEur.toFixed(0)} (reg ${report.regPaidSumEur.toFixed(0)} + wall ${report.wallSumEur.toFixed(0)})`,
  );
  console.log(`Gap (progress − WD): EUR ${report.gapEur.toFixed(0)}`);

  console.log("\n=== GAP BRIDGE ===");
  const missingRecords = report.records.filter((r) => r.verdict === "missing");
  const phantomWithAmount = report.phantomPaidRows.filter(
    (p) => p.paidAmountEur > 0,
  );

  console.log(
    `Missing from sheet (WD not on col V/F): ${report.missingCount} records, EUR ${report.missingWdEur.toFixed(0)}`,
  );
  console.log(
    `Phantom progress (paid, no col V): ${phantomWithAmount.length} rows, EUR ${report.phantomProgressEur.toFixed(0)}`,
  );

  /** WD exists but paid_amount does not include it (pair phantom rows by amount greedily). */
  const phantomPool = phantomWithAmount.map((p) => ({
    ...p,
    used: false,
  }));
  let wdAbsentFromProgressEur = 0;
  const wdAbsentList: string[] = [];
  for (const r of missingRecords) {
    const phantomIdx = phantomPool.findIndex(
      (p) =>
        !p.used && Math.abs(p.paidAmountEur - r.wdAmountEur) < 0.01,
    );
    if (phantomIdx >= 0) {
      phantomPool[phantomIdx].used = true;
      continue;
    }
    wdAbsentFromProgressEur += r.wdAmountEur;
    wdAbsentList.push(
      `WD ${r.wdId} EUR ${r.wdAmountEur.toFixed(0)} ${r.donorName}`,
    );
  }

  const phantomFalseRows = phantomPool.filter((p) => !p.used);
  const phantomFalseEur = phantomFalseRows.reduce(
    (s, p) => s + p.paidAmountEur,
    0,
  );

  console.log(
    `WD money not in progress (no phantom paid_amount match): EUR ${wdAbsentFromProgressEur.toFixed(0)}`,
  );
  for (const line of wdAbsentList) {
    console.log(`  ${line}`);
  }
  console.log(
    `Phantom paid_amount with no matching missing WD: EUR ${phantomFalseEur.toFixed(0)}`,
  );
  for (const p of phantomFalseRows) {
    console.log(
      `  ${p.participantId} | EUR ${p.paidAmountEur.toFixed(0)} | ${p.fullName.slice(0, 35)}`,
    );
  }
  const phantomBacking = phantomPool.filter((p) => p.used);
  if (phantomBacking.length > 0) {
    console.log(
      `Phantom rows backing missing WD by amount (in progress, col V empty): EUR ${phantomBacking.reduce((s, p) => s + p.paidAmountEur, 0).toFixed(0)}`,
    );
    for (const p of phantomBacking) {
      console.log(
        `  ${p.participantId} | EUR ${p.paidAmountEur.toFixed(0)} | ${p.fullName.slice(0, 35)}`,
      );
    }
  }
  console.log(
    `Net gap (phantom false − WD absent): EUR ${(phantomFalseEur - wdAbsentFromProgressEur).toFixed(0)} (should match gap above)`,
  );

  const byVerdict = new Map<WdRecordVerdict, WdRecordAuditRow[]>();
  for (const r of report.records) {
    const list = byVerdict.get(r.verdict) ?? [];
    list.push(r);
    byVerdict.set(r.verdict, list);
  }

  console.log("\n=== BY VERDICT ===");
  for (const verdict of [
    "missing",
    "paid_amount_mismatch",
    "double_count",
    "pending_reg",
    "ok",
  ] as WdRecordVerdict[]) {
    const list = byVerdict.get(verdict) ?? [];
    const sum = list.reduce((s, r) => s + r.wdAmountEur, 0);
    console.log(`  ${verdict}: ${list.length} records, EUR ${sum.toFixed(0)}`);
  }

  if (report.orphanIds.length > 0) {
    console.log("\n=== ORPHAN WD REFS (on sheet, not in API) ===");
    for (const id of report.orphanIds) {
      console.log(`  ${id}`);
    }
  }

  if (report.multiWdRowMismatches.length > 0) {
    console.log("\n=== MULTI-WD ROW paid_amount ≠ sum(WD) ===");
    for (const m of report.multiWdRowMismatches) {
      console.log(
        `  ${m.participantId} | ${m.fullName.slice(0, 28)} | paid EUR ${m.paidAmountEur.toFixed(0)} | sum(WD) EUR ${m.wdSumEur.toFixed(0)} | delta EUR ${m.deltaEur.toFixed(0)} | ids ${m.wdIds.join(",")}`,
      );
    }
  }

  if (report.phantomPaidRows.some((p) => p.paidAmountEur > 0)) {
    console.log("\n=== PHANTOM PAID (in progress, no col V) ===");
    for (const p of report.phantomPaidRows) {
      if (p.paidAmountEur <= 0) continue;
      console.log(
        `  ${p.participantId} | EUR ${p.paidAmountEur.toFixed(0)} | ${p.fullName.slice(0, 35)}`,
      );
    }
  }

  const issueVerdicts: WdRecordVerdict[] = [
    "missing",
    "paid_amount_mismatch",
    "double_count",
    "pending_reg",
  ];

  console.log("\n=== ISSUE RECORDS (WD → sheet) ===");
  for (const verdict of issueVerdicts) {
    const list = byVerdict.get(verdict) ?? [];
    if (list.length === 0) continue;
    console.log(`\n-- ${verdict} (${list.length}) --`);
    for (const r of list) {
      console.log(
        `  WD ${r.wdId} | EUR ${r.wdAmountEur.toFixed(0)} | ${r.donorName.slice(0, 20)} | ${r.detail}`,
      );
      for (const loc of r.locations) {
        console.log(`    → ${formatSheetRef(loc)}`);
      }
    }
  }

  if (full) {
    const ok = byVerdict.get("ok") ?? [];
    console.log(`\n=== OK RECORDS (${ok.length}) ===`);
    for (const r of ok) {
      const loc = r.locations[0];
      const ref = loc ? formatSheetRef(loc) : "";
      console.log(
        `  WD ${r.wdId} | EUR ${r.wdAmountEur.toFixed(0)} | ${r.donorName.slice(0, 20)} | ${ref}`,
      );
    }
  } else {
    const okCount = (byVerdict.get("ok") ?? []).length;
    console.log(
      `\n(${okCount} OK records omitted — pass --full to list every WD record)`,
    );
  }
}
