/**
 * Install (or refresh) the container-bound Apps Script that adds
 * COUNT_ROWS_BY_COLOR / COUNT_CELLS_BY_COLOR custom functions.
 *
 * Usage:
 *   npm run setup-count-by-color-script
 *   npm run setup-count-by-color-script -- --apply
 */

import "./lib/load-backend-env.js";

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { google, type script_v1 } from "googleapis";
import { config } from "./config.js";

const SCRIPT_SCOPE = "https://www.googleapis.com/auth/script.projects";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const PROJECT_TITLE = "Row color counters";

const backendRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = join(
  backendRoot,
  "src/apps-script/count-rows-by-color.gs",
);

const MANIFEST = JSON.stringify(
  {
    timeZone: "Europe/Brussels",
    dependencies: {},
    exceptionLogging: "STACKDRIVER",
    runtimeVersion: "V8",
  },
  null,
  2,
);

function oauthUnavailable(message: string): boolean {
  return (
    message.includes("insufficient authentication scopes") ||
    message.includes("Request had insufficient authentication scopes") ||
    message.includes("Insufficient Permission") ||
    message.includes("accessNotConfigured") ||
    message.includes("does not have permission") ||
    message.includes("Permission denied")
  );
}

async function createAuthClient(forceAdc = false) {
  const { clientId, clientSecret, refreshToken } = config.driveOAuth;

  if (!forceAdc && clientId && clientSecret && refreshToken) {
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: refreshToken });
    return oauth2;
  }

  const auth = new google.auth.GoogleAuth({
    scopes: [SCRIPT_SCOPE, DRIVE_SCOPE],
  });
  return auth;
}

async function findBoundScriptId(
  drive: ReturnType<typeof google.drive>,
  spreadsheetId: string,
): Promise<string | null> {
  const res = await drive.files.list({
    q: `'${spreadsheetId}' in parents and mimeType='application/vnd.google-apps.script' and trashed=false`,
    fields: "files(id,name)",
    pageSize: 20,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const files = res.data.files ?? [];
  const match =
    files.find((file) => file.name === PROJECT_TITLE) ?? files[0] ?? null;
  return match?.id ?? null;
}

function buildScriptFiles(source: string): script_v1.Schema$File[] {
  return [
    {
      name: "appsscript",
      type: "JSON",
      source: MANIFEST,
    },
    {
      name: "Code",
      type: "SERVER_JS",
      source,
    },
  ];
}

async function applyScript(
  spreadsheetId: string,
  source: string,
  forceAdc = false,
): Promise<string> {
  const auth = await createAuthClient(forceAdc);
  const script = google.script({ version: "v1", auth });
  const drive = google.drive({ version: "v3", auth });

  let scriptId = await findBoundScriptId(drive, spreadsheetId);
  const files = buildScriptFiles(source);

  if (scriptId) {
    console.log(`Updating existing Apps Script project: ${scriptId}`);
    await script.projects.updateContent({
      scriptId,
      requestBody: { files },
    });
  } else {
    console.log("Creating container-bound Apps Script project…");
    const created = await script.projects.create({
      requestBody: {
        title: PROJECT_TITLE,
        parentId: spreadsheetId,
      },
    });
    scriptId = created.data.scriptId ?? null;
    if (!scriptId) {
      throw new Error("Apps Script API did not return a scriptId.");
    }
    await script.projects.updateContent({
      scriptId,
      requestBody: { files },
    });
  }

  return scriptId;
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const spreadsheetId = config.spreadsheetId;

  if (!spreadsheetId) {
    throw new Error("SPREADSHEET_ID is not set in backend/.env");
  }

  const source = readFileSync(sourcePath, "utf8");

  if (!apply) {
    console.log(`Spreadsheet: ${spreadsheetId}`);
    console.log(`Source: ${sourcePath}`);
    console.log(`Project title: ${PROJECT_TITLE}`);
    console.log("\nDry run. Re-run with --apply to install the Apps Script.");
    console.log("\nAfter install, set AI9 to something like:");
    console.log(
      '  =COUNT_ROWS_BY_COLOR("Registrations!A15","Registrations!A2:A2000")',
    );
    console.log(
      '  (A15 = any row painted fluo-green; A2:A2000 = participant id column)',
    );
    return;
  }

  console.log(`Spreadsheet: ${spreadsheetId}`);

  try {
    const scriptId = await applyScript(spreadsheetId, source, false);
    console.log(`\nDone. Script ID: ${scriptId}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!oauthUnavailable(message)) {
      throw err;
    }
    console.warn("OAuth credentials lack script scope; retrying with ADC.");
    const scriptId = await applyScript(spreadsheetId, source, true);
    console.log(`\nDone. Script ID: ${scriptId}`);
  }

  console.log("\nNext steps:");
  console.log("1. Reload the spreadsheet (close and reopen, or hard refresh).");
  console.log("2. In AI9, enter:");
  console.log(
    '   =COUNT_ROWS_BY_COLOR("Registrations!A15","Registrations!A2:A2000")',
  );
  console.log(
    "   Replace A15 with any cell on a fluo-green row (sample colour).",
  );
  console.log(
    "3. After volunteers recolour rows, nudge the formula (edit a refresh cell or press Enter in AI9).",
  );
  console.log(
    "   Optional third arg: =COUNT_ROWS_BY_COLOR(\"A15\",\"A2:A2000\",Z1) — change Z1 to refresh.",
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
