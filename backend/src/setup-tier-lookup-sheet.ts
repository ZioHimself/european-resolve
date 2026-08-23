/**
 * Create (or refresh) a "Tier lookup" sheet and wire Registrations columns W–AE
 * to effective tier, rewards text, and per-item fulfillment quantities from
 * paid_amount (column O).
 *
 * Reads backend/.env automatically (no need for `node --env-file` when using tsx
 * directly). Uses DRIVE_OAUTH_* from .env when it can access Sheets; otherwise
 * falls back to Application Default Credentials.
 *
 * Usage:
 *   npm run setup-tier-lookup-sheet
 *   npm run setup-tier-lookup-sheet -- --apply
 */

import "./lib/load-backend-env.js";

import { google, type sheets_v4 } from "googleapis";
import { config } from "./config.js";
import { TIER_DATA, getLocalizedRewards } from "./tiers.js";
import type { TierId } from "./types.js";

const SPREADSHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const REG_SHEET = "Registrations";
const LOOKUP_SHEET = "Tier lookup";

const LOOKUP_TIER_ORDER: TierId[] = [
  "donor",
  "supporter",
  "sprinter",
  "relay-runner",
  "marathoner",
  "ultramarathoner",
];

const FULFILLMENT_BY_TIER: Record<
  TierId,
  {
    running: number;
    sticker_pack: number;
    running_socks: number;
    raffle_tickets: number;
    t_shirt: number;
    ukrainian_meal: number;
    silk_scarf: number;
  }
> = {
  donor: {
    running: 0,
    sticker_pack: 0,
    running_socks: 0,
    raffle_tickets: 0,
    t_shirt: 0,
    ukrainian_meal: 0,
    silk_scarf: 0,
  },
  supporter: {
    running: 0,
    sticker_pack: 0,
    running_socks: 0,
    raffle_tickets: 0,
    t_shirt: 0,
    ukrainian_meal: 0,
    silk_scarf: 0,
  },
  sprinter: {
    running: 1,
    sticker_pack: 1,
    running_socks: 0,
    raffle_tickets: 0,
    t_shirt: 0,
    ukrainian_meal: 0,
    silk_scarf: 0,
  },
  "relay-runner": {
    running: 1,
    sticker_pack: 1,
    running_socks: 1,
    raffle_tickets: 1,
    t_shirt: 0,
    ukrainian_meal: 0,
    silk_scarf: 0,
  },
  marathoner: {
    running: 1,
    sticker_pack: 1,
    running_socks: 0,
    raffle_tickets: 3,
    t_shirt: 1,
    ukrainian_meal: 1,
    silk_scarf: 0,
  },
  ultramarathoner: {
    running: 1,
    sticker_pack: 1,
    running_socks: 0,
    raffle_tickets: 5,
    t_shirt: 0,
    ukrainian_meal: 1,
    silk_scarf: 1,
  },
};

/** Meal is included with marathon (t-shirt) and ultramarathon (scarf) tiers only. */
function mealCountForTier(tierId: TierId): number {
  return FULFILLMENT_BY_TIER[tierId].t_shirt +
    FULFILLMENT_BY_TIER[tierId].silk_scarf;
}

function stepsExpr(
  paid: string,
  sep: ";" | ",",
  steps: readonly { min: number; qty: number }[],
): string {
  let expr = "0";
  for (const step of [...steps].sort((a, b) => b.min - a.min)) {
    expr = `IF(${paid}>=${step.min}${sep}${step.qty}${sep}${expr})`;
  }
  return expr;
}

function itemArrayFormula(
  sep: ";" | ",",
  header: string,
  innerExpr: string,
): string {
  return `=ARRAYFORMULA(IF(ROW(O:O)=1${sep}"${header}"${sep}IF(${paidRowFilter()}${sep}0${sep}${innerExpr})))`;
}

function bandExpr(paid: string, min: number, maxExclusive: number): string {
  return `(${paid}>=${min})*(${paid}<${maxExclusive})`;
}

function buildItemFormulas(sep: ";" | ","): { col: string; formula: string }[] {
  const paid = paidAmountExpr();
  return [
    {
      col: "Y",
      formula: itemArrayFormula(sep, "running", `IF(${paid}>=15${sep}1${sep}0)`),
    },
    {
      col: "Z",
      formula: itemArrayFormula(
        sep,
        "sticker_pack",
        `IF(${paid}>=15${sep}1${sep}0)`,
      ),
    },
    {
      col: "AA",
      formula: itemArrayFormula(
        sep,
        "running_socks",
        `IF(${bandExpr(paid, 30, 60)}${sep}1${sep}0)`,
      ),
    },
    {
      col: "AB",
      formula: itemArrayFormula(
        sep,
        "raffle_tickets",
        stepsExpr(paid, sep, [
          { min: 100, qty: 5 },
          { min: 60, qty: 3 },
          { min: 30, qty: 1 },
        ]),
      ),
    },
    {
      col: "AC",
      formula: itemArrayFormula(
        sep,
        "t_shirt",
        `IF(${bandExpr(paid, 60, 100)}${sep}1${sep}0)`,
      ),
    },
    {
      col: "AE",
      formula: itemArrayFormula(
        sep,
        "silk_scarf",
        `IF(${paid}>=100${sep}1${sep}0)`,
      ),
    },
    {
      col: "AD",
      formula: itemArrayFormula(
        sep,
        "ukrainian_meal",
        `AC:AC+AE:AE`,
      ),
    },
  ];
}

function oauthSheetsUnavailable(message: string): boolean {
  return (
    message.includes("Sheets API has not been used") ||
    message.includes("accessNotConfigured") ||
    message.includes("Google Sheets API has not been used") ||
    message.includes("does not have permission") ||
    message.includes("Permission denied")
  );
}

async function createSheetsClient(
  spreadsheetId: string,
  { forceAdc = false }: { forceAdc?: boolean } = {},
): Promise<sheets_v4.Sheets> {
  const { clientId, clientSecret, refreshToken } = config.driveOAuth;

  if (!forceAdc && clientId && clientSecret && refreshToken) {
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: refreshToken });
    const sheets = google.sheets({ version: "v4", auth: oauth2 });

    try {
      await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "spreadsheetId",
      });
      console.log("Auth: DRIVE_OAUTH_* from backend/.env");
      return sheets;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!oauthSheetsUnavailable(message)) {
        throw err;
      }
      console.warn(
        "Auth: DRIVE_OAUTH_* cannot access this spreadsheet; using Application Default Credentials instead.",
      );
    }
  } else if (forceAdc) {
    console.log("Auth: Application Default Credentials (retry).");
  } else {
    console.log(
      "Auth: DRIVE_OAUTH_* not set in backend/.env; using Application Default Credentials.",
    );
  }

  const auth = new google.auth.GoogleAuth({ scopes: [SPREADSHEETS_SCOPE] });
  return google.sheets({ version: "v4", auth });
}

async function applyToSpreadsheet(
  spreadsheetId: string,
  lookupRows: (string | number)[][],
  formulas: { col: string; formula: string }[],
): Promise<void> {
  const run = async (forceAdc: boolean) => {
    const sheets = await createSheetsClient(spreadsheetId, { forceAdc });

    await ensureLookupSheet(sheets, spreadsheetId);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${LOOKUP_SHEET}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: lookupRows },
    });

    for (const { col, formula } of formulas) {
      process.stdout.write(`Applying ${col} (ARRAYFORMULA) … `);
      await applyRegistrationColumn(sheets, spreadsheetId, col, formula);
      console.log("ok");
    }
  };

  try {
    await run(false);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!oauthSheetsUnavailable(message)) {
      throw err;
    }
    console.warn("Write failed with OAuth; retrying with Application Default Credentials.");
    await run(true);
  }
}

function buildLookupRows(): (string | number)[][] {
  const header = [
    "min_amount",
    "tier_id",
    "tier_name",
    "rewards_en",
    "running",
    "sticker_pack",
    "running_socks",
    "raffle_tickets",
    "t_shirt",
    "ukrainian_meal",
    "silk_scarf",
  ];

  const rows = LOOKUP_TIER_ORDER.map((tierId) => {
    const fulfillment = FULFILLMENT_BY_TIER[tierId];
    return [
      TIER_DATA[tierId].price,
      tierId,
      TIER_DATA[tierId].name,
      getLocalizedRewards(tierId, "English").join(" · "),
      fulfillment.running,
      fulfillment.sticker_pack,
      fulfillment.running_socks,
      fulfillment.raffle_tickets,
      fulfillment.t_shirt,
      mealCountForTier(tierId),
      fulfillment.silk_scarf,
    ];
  });

  return [header, ...rows];
}

function lookupTableRange(): string {
  const firstRow = 2;
  const lastRow = firstRow + LOOKUP_TIER_ORDER.length - 1;
  return `'${LOOKUP_SHEET}'!$A$${firstRow}:$K$${lastRow}`;
}

function paidAmountExpr(): string {
  return 'VALUE(SUBSTITUTE(REGEXREPLACE(TO_TEXT(O:O),"[^0-9.,-]",""),",","."))';
}

async function getSheetId(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  title: string,
): Promise<number | null> {
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = res.data.sheets?.find((s) => s.properties?.title === title);
  return sheet?.properties?.sheetId ?? null;
}

async function ensureLookupSheet(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
): Promise<void> {
  const existingId = await getSheetId(sheets, spreadsheetId, LOOKUP_SHEET);
  if (existingId != null) {
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: LOOKUP_SHEET } } }],
    },
  });
}

function formulaArgSep(locale: string): ";" | "," {
  return /^en([_-]|$)/i.test(locale) ? "," : ";";
}

function paidRowFilter(): string {
  return `(O:O="")+(N:N<>"paid")`;
}

function effectiveTierFormula(sep: ";" | ","): string {
  const paid = paidAmountExpr();
  return [
    "=ARRAYFORMULA(IF(ROW(O:O)=1",
    `"effective_tier_id"`,
    `IF(${paidRowFilter()}`,
    `""`,
    `IF(${paid}>=100${sep}"ultramarathoner"`,
    `IF(${paid}>=60${sep}"marathoner"`,
    `IF(${paid}>=30${sep}"relay-runner"`,
    `IF(${paid}>=15${sep}"sprinter"`,
    `IF(${paid}>=10${sep}"supporter"`,
    `"donor"` + "))))))))",
  ].join(sep);
}

function rewardsFormula(sep: ";" | ","): string {
  const paid = paidAmountExpr();
  return `=ARRAYFORMULA(IF(ROW(O:O)=1${sep}"rewards"${sep}IF(${paidRowFilter()}${sep}""${sep}VLOOKUP(${paid}${sep}${lookupTableRange()}${sep}4${sep}TRUE))))`;
}

function buildRegistrationFormulas(sep: ";" | ","): { col: string; formula: string }[] {
  return [
    { col: "W", formula: effectiveTierFormula(sep) },
    { col: "X", formula: rewardsFormula(sep) },
    ...buildItemFormulas(sep),
  ];
}

async function applyRegistrationColumn(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  col: string,
  formula: string,
): Promise<void> {
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${REG_SHEET}!${col}:${col}`,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${REG_SHEET}!${col}1`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[formula]],
    },
  });
}

async function getSpreadsheetLocale(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
): Promise<string> {
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "properties.locale",
  });
  return res.data.properties?.locale ?? "en_US";
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const spreadsheetId = config.spreadsheetId;

  if (!spreadsheetId) {
    throw new Error("SPREADSHEET_ID is not set in backend/.env");
  }

  const lookupRows = buildLookupRows();
  const previewFormulas = buildRegistrationFormulas(";");

  if (!apply) {
    console.log(`Spreadsheet: ${spreadsheetId}`);
    for (const { col, formula } of previewFormulas) {
      console.log(`${col}1: ${formula}`);
    }
    console.log("\nDry run. Re-run with --apply to update the spreadsheet.");
    return;
  }

  const sheets = await createSheetsClient(spreadsheetId);
  const locale = await getSpreadsheetLocale(sheets, spreadsheetId);
  const sep = formulaArgSep(locale);
  const formulas = buildRegistrationFormulas(sep);

  console.log(
    `Spreadsheet: ${spreadsheetId} (locale: ${locale}, separator: "${sep}")`,
  );

  await applyToSpreadsheet(spreadsheetId, lookupRows, formulas);

  console.log("\nDone. W–AE use ARRAYFORMULA and extend automatically with new rows.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
