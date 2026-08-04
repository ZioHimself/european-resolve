import { randomBytes } from "node:crypto";
import { google, type sheets_v4 } from "googleapis";
import { config } from "../config.js";
import { getTierPrice, getEffectiveTier, TIER_DATA, filterRewards } from "../tiers.js";
import type {
  RegisterRequest,
  FundraiserCreateRequest,
  FundraiserUpdateRequest,
  DonorWallEntry,
  ParticipationType,
} from "../types.js";

export interface ExistingRegistration {
  participantId: string;
  fullName: string;
  email: string;
  tierId: string;
  amountEur: number;
  paymentToken: string;
  participationType: string;
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

export class SheetsService {
  private sheets: sheets_v4.Sheets;

  constructor() {
    const auth = new google.auth.GoogleAuth({ scopes: SCOPES });
    this.sheets = google.sheets({ version: "v4", auth });
  }

  async findByEmail(email: string): Promise<ExistingRegistration | null> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${SHEET_NAME}!A:Q`,
    });

    const rows = res.data.values;
    if (!rows || rows.length <= 1) return null;

    const normalised = email.toLowerCase().trim();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[2]?.toLowerCase().trim() === normalised) {
        return {
          participantId: row[0] as string,
          fullName: row[1] as string,
          email: row[2] as string,
          tierId: row[7] as string,
          amountEur: Number(row[8]),
          paymentToken: (row[12] as string) ?? "",
          participationType: (row[16] as string) ?? "runner",
        };
      }
    }

    return null;
  }

  async findByToken(token: string): Promise<ExistingRegistration | null> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${SHEET_NAME}!A:Q`,
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
        };
      }
    }

    return null;
  }

  async appendRegistration(
    data: RegisterRequest,
    fundraiserSlug?: string,
  ): Promise<{ participantId: string; paymentToken: string }> {
    const rowCount = await this.getRowCount();
    const participantId = `R4U-${rowCount}`;
    const paymentToken = randomBytes(4).toString("hex").toUpperCase();

    const row = [
      participantId,
      data.fullName,
      data.email,
      data.phone ?? "",
      data.tshirtSize ?? "",
      data.language,
      data.country,
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
  ): Promise<
    | {
        success: true;
        participantId: string;
        fullName: string;
        email: string;
        language: string;
        tierName: string;
        amountEur: number;
        effectiveTierId: string;
        effectiveTierName: string;
        rewards: string[];
      }
    | { success: false; error: string }
  > {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${SHEET_NAME}!A:Q`,
    });

    const rows = res.data.values;
    if (!rows || rows.length <= 1) {
      return { success: false, error: "invalid_token" };
    }

    const normalised = token.toUpperCase().trim();
    let matchIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[12] === normalised) {
        matchIndex = i;
        break;
      }
    }

    if (matchIndex === -1) {
      return { success: false, error: "invalid_token" };
    }

    const row = rows[matchIndex];

    if (row[13] === "paid") {
      return { success: false, error: "already_confirmed" };
    }

    const recordedAmount =
      donatedAmount != null && donatedAmount > 0
        ? donatedAmount
        : Number(row[8]);

    const rowNumber = matchIndex + 1;
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: `${SHEET_NAME}!M${rowNumber}:P${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["", "paid", String(recordedAmount), new Date().toISOString()]],
      },
    });

    const effectiveTierId = getEffectiveTier(recordedAmount);
    const effectiveTier = TIER_DATA[effectiveTierId];
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
      tierName: row[7] as string,
      amountEur: recordedAmount,
      effectiveTierId,
      effectiveTierName: effectiveTier.name,
      rewards: filterRewards(effectiveTier.rewards, participationType),
    };
  }

  private async getRowCount(): Promise<number> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${SHEET_NAME}!A:A`,
    });

    const rows = res.data.values;
    if (!rows || rows.length <= 1) return 1;
    return rows.length;
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
    try {
      const res = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: `${DONOR_WALL_SHEET}!A:E`,
      });
      const rows = res.data.values ?? [];
      let total = 0;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === slug) {
          total += Number(rows[i][4]) || 0;
        }
      }
      return total;
    } catch {
      return 0;
    }
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
