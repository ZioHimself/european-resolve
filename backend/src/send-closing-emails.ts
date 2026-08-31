/**
 * One-off send: post-event closing / thank-you email to comms-opted-in participants.
 *
 * Usage:
 *   node --env-file=.env --import tsx src/send-closing-emails.ts --dry-run
 *   node --env-file=.env --import tsx src/send-closing-emails.ts
 *
 * Optional env:
 *   CLOSING_CATALDO_CONTACT — shown in raffle claim line (default: info@european-resolve.org)
 *   CLOSING_RECIPIENTS_TSV   — path to registrations export (default: /tmp/registrations.tsv)
 */

import { readFileSync } from "node:fs";
import type { Language } from "./types.js";
import { sendClosingEmail } from "./services/email.js";

const LANGUAGES = new Set<Language>([
  "English",
  "French",
  "Ukrainian",
  "Dutch",
  "German",
]);

interface Recipient {
  name: string;
  email: string;
  language: Language;
}

/** Not present in the partial /tmp export; from full sheet export. */
const SUPPLEMENTAL_RECIPIENTS: Recipient[] = [
  {
    name: "Simone",
    email: "martuscellisimone@gmail.com",
    language: "English",
  },
];

/** Prefer a personal first name when duplicate emails have mixed labels. */
const FIRST_NAME_OVERRIDES: Record<string, string> = {
  "ndriyam@gmail.com": "Svitlana",
};

const CATALDO_CONTACT =
  process.env.CLOSING_CATALDO_CONTACT ?? "info@european-resolve.org";
const TSV_PATH = process.env.CLOSING_RECIPIENTS_TSV ?? "/tmp/registrations.tsv";

function parseTsv(path: string): Record<string, string>[] {
  const text = readFileSync(path, "utf8").trim();
  const lines = text.split("\n");
  const headers = lines[0]!.split("\t");

  return lines.slice(1).map((line) => {
    const cols = line.split("\t");
    return Object.fromEntries(
      headers.map((header, index) => [header, cols[index] ?? ""]),
    );
  });
}

function loadRecipientsFromTsv(path: string): Recipient[] {
  const rows = parseTsv(path);
  const byEmail = new Map<string, Recipient>();

  for (const row of rows) {
    const comms = row.comms_optin;
    if (comms !== "true" && comms !== "TRUE") continue;

    const email = row.email?.trim().toLowerCase();
    if (!email) continue;

    if (byEmail.has(email)) continue;

    const languageRaw = row.language?.trim() || "English";
    const language = LANGUAGES.has(languageRaw as Language)
      ? (languageRaw as Language)
      : "English";

    const overrideName = FIRST_NAME_OVERRIDES[email];
    const name = overrideName || row.first_name?.trim() || row.full_name?.trim();
    if (!name) continue;

    byEmail.set(email, { name, email: row.email!.trim(), language });
  }

  for (const extra of SUPPLEMENTAL_RECIPIENTS) {
    const email = extra.email.toLowerCase();
    if (!byEmail.has(email)) {
      byEmail.set(email, extra);
    }
  }

  return [...byEmail.values()].sort((a, b) =>
    a.email.localeCompare(b.email),
  );
}

const dryRun = process.argv.includes("--dry-run");

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const recipients = loadRecipientsFromTsv(TSV_PATH);

console.log(
  dryRun
    ? `Dry run: would send ${recipients.length} closing emails`
    : `Sending ${recipients.length} closing emails…`,
);
console.log(`Cataldo contact: ${CATALDO_CONTACT}`);
console.log();

let sent = 0;
let failed = 0;

for (const recipient of recipients) {
  const label = `${recipient.email} (${recipient.name}, ${recipient.language})`;
  if (dryRun) {
    console.log(`  [dry-run] ${label}`);
    sent++;
    continue;
  }

  try {
    await sendClosingEmail(
      {
        name: recipient.name,
        email: recipient.email,
        cataldoContact: CATALDO_CONTACT,
      },
      recipient.language,
    );
    console.log(`  ✓ ${label}`);
    sent++;
    await sleep(500);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ${label}: ${message}`);
    failed++;
  }
}

console.log();
console.log(`Done. Sent: ${sent}, failed: ${failed}`);
if (failed > 0) process.exit(1);
