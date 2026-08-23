import { config } from "../config.js";

export interface WhyDonateDonation {
  id: number;
  amountEur: number;
  donorName: string;
}

interface WhyDonateApiRow {
  id: number;
  amount: string;
  name: string;
}

function ordersUrl(page: number, limit: number): string {
  const base = config.whydonateOrdersApiBase.replace(/\/$/, "");
  const slug = encodeURIComponent(config.whydonateCampaignSlug);
  return `${base}/donation/orders/fundraising/local/?slug=${slug}&page=${page}&limit=${limit}&language_code=en`;
}

/** Fetch all donation pages from the WhyDonate orders API (source of truth). */
export async function fetchAllWhyDonateDonations(
  limitPerPage = 100,
): Promise<WhyDonateDonation[]> {
  const donations: WhyDonateDonation[] = [];
  let page = 1;
  let apiCount: number | null = null;

  for (;;) {
    const res = await fetch(ordersUrl(page, limitPerPage));
    if (!res.ok) {
      throw new Error(
        `WhyDonate orders API HTTP ${res.status} for page ${page}`,
      );
    }

    const body = (await res.json()) as {
      data?: {
        result?: {
          count?: string;
          result?: WhyDonateApiRow[];
        };
      };
    };

    const result = body.data?.result;
    if (!result?.result) {
      throw new Error(`WhyDonate orders API: missing result on page ${page}`);
    }

    if (apiCount === null) {
      apiCount = Number(result.count);
    }

    for (const row of result.result) {
      donations.push({
        id: row.id,
        amountEur: Number(row.amount),
        donorName: row.name?.trim() ?? "",
      });
    }

    if (result.result.length < limitPerPage) {
      break;
    }
    page += 1;
    if (page > 50) {
      throw new Error("WhyDonate orders API: exceeded max pages (50)");
    }
  }

  const byId = new Map<number, WhyDonateDonation>();
  for (const d of donations) {
    byId.set(d.id, d);
  }

  const unique = [...byId.values()];
  if (apiCount !== null && unique.length !== apiCount) {
    console.warn(
      `[whydonate] API count=${apiCount} unique ids=${unique.length} (using unique)`,
    );
  }

  return unique;
}

export function parseWhyDonateIdsFromCell(value: string | undefined): number[] {
  if (!value?.trim()) return [];
  const ids: number[] = [];
  for (const match of value.matchAll(/\d{6,}/g)) {
    ids.push(Number(match[0]));
  }
  return ids;
}

export function normName(value: string): string {
  return value.trim().toLowerCase();
}

/** Significant tokens from a registration full name (skip very short tokens). */
export function nameParts(fullName: string): string[] {
  return normName(fullName)
    .split(/\s+/)
    .filter((part) => part.length > 2);
}

/**
 * Score donor-name match between registration and WhyDonate donor field.
 * 2 = word-level match (safe for automation), 1 = substring (report only), 0 = no match.
 */
export function scoreNameMatch(
  fullName: string,
  donorName: string,
): { score: number; reason: string } {
  const wd = normName(donorName);
  if (!wd) return { score: 0, reason: "empty-wd-name" };
  if (wd === "anonymous") return { score: 0, reason: "anonymous" };

  const parts = nameParts(fullName);
  if (parts.length === 0) return { score: 0, reason: "no-name-parts" };

  for (const part of parts) {
    if (
      wd === part ||
      wd.startsWith(`${part} `) ||
      wd.endsWith(` ${part}`) ||
      wd.includes(` ${part} `)
    ) {
      return { score: 2, reason: "word-match" };
    }
  }

  for (const part of parts) {
    if (part.length >= 4 && wd.includes(part)) {
      return { score: 1, reason: "substring" };
    }
  }

  return { score: 0, reason: "no-match" };
}

export const EXCLUDED_AUTO_MARK_PAID_IDS = new Set([
  "R4U-0RP0OI", // anna — anonymous WD false positives
  "R4U-24RSMP", // test registration
]);
