import { randomBytes } from "node:crypto";
import { google, type sheets_v4 } from "googleapis";
import { config } from "../config.js";
import { getTierPrice, TIER_DATA, filterRewards } from "../tiers.js";
import type {
  RegisterRequest,
  FundraiserCreateRequest,
  FundraiserUpdateRequest,
  DonorWallEntry,
  ParticipationType,
  TierId,
} from "../types.js";

export interface ExistingRegistration {
  participantId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  tierId: string;
  amountEur: number;
  paymentToken: string;
  participationType: string;
  status: string;
}

export interface FundraiserRow {
  slug: string;
  displayName: string;
  message: string;
  goalEur: number;
  photoFileId: string;
  editToken: string;
  status: "draft" | "published";
  createdAt: string;
}

const SHEET_NAME = "Registrations";
const FUNDRAISER_SHEET = "Fundraisers";
const DONOR_WALL_SHEET = "Donor Wall";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// Custom epoch keeps the encoded number small (and not recognizable as a
// raw Unix timestamp) for the lifetime of this campaign.
const PARTICIPANT_ID_EPOCH = Date.UTC(2026, 7, 1); // 1 August 2026 UTC

/**
 * Base-36 centiseconds since a campaign-specific epoch, not a row count —
 * avoids a read before every write and doesn't reveal the total number of
 * entries. Six digits covers ~252 days from the epoch (until ~9 April 2027),
 * well past this event. Collisions need two submissions within the same
 * 10ms window; this is a human-facing reference number only, never used to
 * look anything up.
 */
function generateParticipantId(): string {
  const centiseconds = Math.floor((Date.now() - PARTICIPANT_ID_EPOCH) / 10);
  const base36 = centiseconds.toString(36).toUpperCase();
  return `R4U-${base36.padStart(6, "0").slice(-6)}`;
}

export class SheetsService {
  private sheets: sheets_v4.Sheets;

  constructor() {
    const auth = new google.auth.GoogleAuth({ scopes: SCOPES });
    this.sheets = google.sheets({ version: "v4", auth });
  }

  async findByToken(token: string): Promise<ExistingRegistration | null> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${SHEET_NAME}!A:U`,
    });

    const rows = res.data.values;
    if (!rows || rows.length <= 1) return null;

    const normalised = token.toUpperCase().trim();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[12] === normalised) {
        return {
          participantId: row[0] as string,
          fullName: row[1] as string,
          email: row[2] as string,
          tierId: row[7] as string,
          amountEur: Number(row[8]),
          paymentToken: (row[12] as string) ?? "",
          participationType: (row[16] as string) ?? "runner",
          status: (row[13] as string) ?? "pending",
          firstName: (row[19] as string) ?? "",
          lastName: (row[20] as string) ?? "",
        };
      }
    }

    return null;
  }

  async appendRegistration(
    data: RegisterRequest,
    fundraiserSlug?: string,
  ): Promise<{ participantId: string; paymentToken: string }> {
    const participantId = generateParticipantId();
    const paymentToken = randomBytes(4).toString("hex").toUpperCase();
    const fullName = `${data.firstName} ${data.lastName}`.trim();

    const row = [
      participantId,
      fullName,
      data.email,
      data.phone ?? "",
      data.tshirtSize ?? "",
      data.language,
      data.country ?? "",
      data.tierId,
      String(getTierPrice(data.tierId)),
      String(data.gdprConsent),
      String(data.commsOptin ?? false),
      new Date().toISOString(),
      paymentToken,
      "pending",
      "",
      "",
      data.participationType,
      fundraiserSlug ?? "",
      data.socksSize ?? "",
      data.firstName,
      data.lastName,
    ];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });

    return { participantId, paymentToken };
  }

  async confirmPayment(
    token: string,
    donatedAmount?: number,
    email?: string,
    firstName?: string,
    lastName?: string,
  ): Promise<
    | {
        success: true;
        participantId: string;
        fullName: string;
        email: string;
        language: string;
        tierName: string;
        amountEur?: number;
        rewards: string[];
      }
    | { success: false; error: string }
  > {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${SHEET_NAME}!A:S`,
    });

    const rows = res.data.values ?? [];

    // 1. Exact match — the token the frontend already holds from registering.
    const normalisedToken = token.toUpperCase().trim();
    let matchIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][12] === normalisedToken) {
        matchIndex = i;
        break;
      }
    }

    // 2. Fallback — same email, still pending, and the amount matches one of
    // their attempts. No webhook exists today, so this only matters if the
    // token ever fails to resolve; picks the most recent matching attempt.
    if (matchIndex === -1 && email && donatedAmount) {
      const normalisedEmail = email.toLowerCase().trim();
      for (let i = rows.length - 1; i >= 1; i--) {
        const row = rows[i];
        if (
          row[2]?.toLowerCase().trim() === normalisedEmail &&
          row[13] === "pending" &&
          Number(row[8]) === donatedAmount
        ) {
          matchIndex = i;
          break;
        }
      }
    }

    // 3. Nothing on file at all — record the payment anyway rather than
    // losing it (e.g. a donation with no prior registration attempt). No
    // tier is guessed from the amount; it's left unset.
    if (matchIndex === -1) {
      if (!email || !donatedAmount) {
        return { success: false, error: "invalid_token" };
      }
      return this.createPaidRegistration(email, firstName ?? "", lastName ?? "", donatedAmount);
    }

    const row = rows[matchIndex];

    if (row[13] === "paid") {
      return { success: false, error: "already_confirmed" };
    }

    // The amount actually paid can differ from what was registered for
    // (e.g. the donor lowers it in the widget before paying) — never
    // substitute the registered tier price as if it were the paid amount.
    // Leave it blank rather than assume; it's simply excluded from the
    // public raised total until reconciled.
    const recordedAmount =
      donatedAmount != null && donatedAmount > 0 ? donatedAmount : undefined;

    const rowNumber = matchIndex + 1;
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: `${SHEET_NAME}!M${rowNumber}:P${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            "",
            "paid",
            recordedAmount != null ? String(recordedAmount) : "",
            new Date().toISOString(),
          ],
        ],
      },
    });

    // Tier is whatever was selected at registration, regardless of how much
    // was actually paid — paying more than the selected tier's price never
    // upgrades it.
    const tierId = row[7] as string;
    const tier = TIER_DATA[tierId as TierId];
    const participationType = (row[16] as ParticipationType) ?? "runner";

    const fundraiserSlug = (row[17] as string) ?? "";
    if (fundraiserSlug) {
      await this.publishFundraiserBySlug(fundraiserSlug);
    }

    return {
      success: true,
      participantId: row[0] as string,
      fullName: row[1] as string,
      email: row[2] as string,
      language: (row[5] as string) ?? "English",
      tierName: tier?.name ?? (row[7] as string),
      amountEur: recordedAmount,
      rewards: tier ? filterRewards(tier.rewards, participationType) : [],
    };
  }

  /**
   * A payment that matches no pending registration at all (e.g. a donation
   * made with no prior form submission). Recorded directly as paid so the
   * money is never silently dropped. No tier is guessed from the amount —
   * there was no selection to honour, so it's simply left unset.
   */
  private async createPaidRegistration(
    email: string,
    firstName: string,
    lastName: string,
    amount: number,
  ): Promise<{
    success: true;
    participantId: string;
    fullName: string;
    email: string;
    language: string;
    tierName: string;
    amountEur: number;
    rewards: string[];
  }> {
    const participantId = generateParticipantId();
    const now = new Date().toISOString();
    const fullName = `${firstName} ${lastName}`.trim();

    const row = [
      participantId,
      fullName,
      email,
      "",
      "",
      "English",
      "",
      "",
      String(amount),
      "true",
      "false",
      now,
      "",
      "paid",
      String(amount),
      now,
      "",
      "",
      "",
      firstName,
      lastName,
    ];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });

    return {
      success: true,
      participantId,
      fullName,
      email,
      language: "English",
      tierName: "",
      amountEur: amount,
      rewards: [],
    };
  }

  async generateSlug(displayName: string): Promise<string> {
    const base = displayName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${FUNDRAISER_SHEET}!A:A`,
    });

    const rows = res.data.values ?? [];
    const existing = new Set(rows.map((r) => r[0]));

    if (!existing.has(base)) return base;

    let counter = 2;
    while (existing.has(`${base}-${counter}`)) {
      counter++;
    }
    return `${base}-${counter}`;
  }

  async createFundraiser(
    data: FundraiserCreateRequest,
    photoFileId: string | null,
  ): Promise<{ slug: string; editToken: string }> {
    const slug = await this.generateSlug(data.displayName);
    const editToken = randomBytes(8).toString("hex");

    const row = [
      slug,
      data.displayName,
      data.message,
      String(data.goalEur),
      photoFileId ?? "",
      editToken,
      "draft",
      new Date().toISOString(),
    ];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: `${FUNDRAISER_SHEET}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });

    return { slug, editToken };
  }

  async getFundraiser(slug: string): Promise<FundraiserRow | null> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${FUNDRAISER_SHEET}!A:H`,
    });

    const rows = res.data.values;
    if (!rows || rows.length <= 1) return null;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === slug) {
        return {
          slug: row[0] as string,
          displayName: row[1] as string,
          message: row[2] as string,
          goalEur: Number(row[3]),
          photoFileId: (row[4] as string) ?? "",
          editToken: row[5] as string,
          status: (row[6] as "draft" | "published") ?? "draft",
          createdAt: row[7] as string,
        };
      }
    }

    return null;
  }

  async updateFundraiser(
    slug: string,
    editToken: string,
    updates: Partial<FundraiserUpdateRequest>,
    photoFileId?: string,
  ): Promise<FundraiserRow | null> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${FUNDRAISER_SHEET}!A:H`,
    });

    const rows = res.data.values;
    if (!rows || rows.length <= 1) return null;

    let matchIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === slug) {
        matchIndex = i;
        break;
      }
    }

    if (matchIndex === -1) return null;

    const row = rows[matchIndex];
    if (row[5] !== editToken) return null;

    const updatedRow = [
      row[0],
      updates.displayName ?? row[1],
      updates.message ?? row[2],
      updates.goalEur !== undefined ? String(updates.goalEur) : row[3],
      photoFileId ?? row[4],
      row[5],
      updates.status ?? row[6],
      row[7],
    ];

    const rowNumber = matchIndex + 1;
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: `${FUNDRAISER_SHEET}!A${rowNumber}:H${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [updatedRow] },
    });

    return {
      slug: updatedRow[0] as string,
      displayName: updatedRow[1] as string,
      message: updatedRow[2] as string,
      goalEur: Number(updatedRow[3]),
      photoFileId: (updatedRow[4] as string) ?? "",
      editToken: updatedRow[5] as string,
      status: (updatedRow[6] as "draft" | "published") ?? "draft",
      createdAt: updatedRow[7] as string,
    };
  }

  async publishFundraiserBySlug(slug: string): Promise<void> {
    if (!slug) return;

    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${FUNDRAISER_SHEET}!A:H`,
    });

    const rows = res.data.values;
    if (!rows || rows.length <= 1) return;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === slug && rows[i][6] !== "published") {
        const rowNumber = i + 1;
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: config.spreadsheetId,
          range: `${FUNDRAISER_SHEET}!G${rowNumber}`,
          valueInputOption: "RAW",
          requestBody: { values: [["published"]] },
        });
        break;
      }
    }
  }

  async listPublishedFundraisers(): Promise<FundraiserRow[]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${FUNDRAISER_SHEET}!A:H`,
    });

    const rows = res.data.values;
    if (!rows || rows.length <= 1) return [];

    return rows
      .slice(1)
      .filter((row) => row[6] === "published")
      .map((row) => ({
        slug: row[0] as string,
        displayName: row[1] as string,
        message: row[2] as string,
        goalEur: Number(row[3]),
        photoFileId: (row[4] as string) ?? "",
        editToken: row[5] as string,
        status: "published" as const,
        createdAt: row[7] as string,
      }));
  }

  async getProgress(): Promise<{
    totalRaisedEur: number;
    participantCount: number;
    donorCount: number;
  }> {
    const regRes = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${SHEET_NAME}!A:P`,
    });

    const regRows = regRes.data.values ?? [];
    let totalRaisedEur = 0;
    let participantCount = 0;

    if (regRows.length > 1) {
      participantCount = regRows.length - 1;
      for (let i = 1; i < regRows.length; i++) {
        const row = regRows[i];
        if (row[13] === "paid") {
          totalRaisedEur += Number(row[14]) || 0;
        }
      }
    }

    let donorCount = 0;
    try {
      const donorRes = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: `${DONOR_WALL_SHEET}!A:E`,
      });
      const donorRows = donorRes.data.values ?? [];
      donorCount = Math.max(0, donorRows.length - 1);
      for (let i = 1; i < donorRows.length; i++) {
        totalRaisedEur += Number(donorRows[i][4]) || 0;
      }
    } catch {
      // Donor Wall sheet may not exist yet — default to 0
    }

    return { totalRaisedEur, participantCount, donorCount };
  }

  async getFundraiserRaised(slug: string): Promise<number> {
    let total = 0;

    // Sum registration payments linked to this fundraiser (col R = slug, col O = amount, col N = status)
    try {
      const regRes = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: `${SHEET_NAME}!A:R`,
      });
      const regRows = regRes.data.values ?? [];
      for (let i = 1; i < regRows.length; i++) {
        if (regRows[i][17] === slug && regRows[i][13] === "paid") {
          total += Number(regRows[i][14]) || 0;
        }
      }
    } catch { /* registrations sheet may not exist */ }

    // Sum donations from the Donor Wall sheet
    try {
      const dwRes = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: `${DONOR_WALL_SHEET}!A:E`,
      });
      const dwRows = dwRes.data.values ?? [];
      for (let i = 1; i < dwRows.length; i++) {
        if (dwRows[i][0] === slug) {
          total += Number(dwRows[i][4]) || 0;
        }
      }
    } catch { /* donor wall sheet may not exist */ }

    return total;
  }

  async addDonorWallEntry(
    slug: string,
    name: string,
    message: string,
    amount?: number,
  ): Promise<void> {
    const row = [slug, name, message, new Date().toISOString(), amount ? String(amount) : ""];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: `${DONOR_WALL_SHEET}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  }

  async getDonorWallEntries(slug: string): Promise<DonorWallEntry[]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${DONOR_WALL_SHEET}!A:E`,
    });

    const rows = res.data.values;
    if (!rows || rows.length <= 1) return [];

    return rows
      .slice(1)
      .filter((row) => row[0] === slug && row[1])
      .map((row) => ({
        fundraiserSlug: row[0] as string,
        donorName: row[1] as string,
        message: row[2] as string,
        createdAt: row[3] as string,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}
