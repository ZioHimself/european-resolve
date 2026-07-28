import { google, type sheets_v4 } from "googleapis";
import { config } from "../config.js";
import type { RegisterRequest } from "../types.js";

export interface ExistingRegistration {
  participantId: string;
  fullName: string;
  email: string;
  tierId: string;
  amountEur: number;
}

const SHEET_NAME = "Registrations";
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
      range: `${SHEET_NAME}!A:L`,
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
        };
      }
    }

    return null;
  }

  async appendRegistration(
    data: RegisterRequest,
  ): Promise<{ participantId: string }> {
    const rowCount = await this.getRowCount();
    const participantId = `R4U-${rowCount}`;

    const row = [
      participantId,
      data.fullName,
      data.email,
      data.phone ?? "",
      data.tshirtSize,
      data.language,
      data.country,
      data.tierId,
      String(this.getTierPrice(data.tierId)),
      String(data.gdprConsent),
      String(data.commsOptin ?? false),
      new Date().toISOString(),
    ];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });

    return { participantId };
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

  private getTierPrice(tierId: string): number {
    const prices: Record<string, number> = {
      supporter: 35,
      champion: 75,
      patron: 150,
    };
    return prices[tierId] ?? 0;
  }
}
