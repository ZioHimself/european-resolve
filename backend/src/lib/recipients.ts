import { readFileSync } from "node:fs";
import type { Language } from "../types.js";

const LANGUAGES = new Set<Language>([
  "English",
  "French",
  "Ukrainian",
  "Dutch",
  "German",
]);

export interface Recipient {
  name: string;
  email: string;
  language: Language;
}

function parseTsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  const headers = lines[0]!.split("\t");

  return lines.slice(1).map((line) => {
    const cols = line.split("\t");
    return Object.fromEntries(
      headers.map((header, index) => [header, cols[index] ?? ""]),
    );
  });
}

export function loadRecipientsFromTsvText(text: string): Recipient[] {
  const rows = parseTsv(text);
  const byEmail = new Map<string, Recipient>();

  for (const row of rows) {
    const comms = row.comms_optin;
    if (comms !== "true" && comms !== "TRUE") continue;

    const status = row.status?.trim().toLowerCase();
    if (status !== "paid") continue;

    const email = row.email?.trim().toLowerCase();
    if (!email) continue;

    if (byEmail.has(email)) continue;

    const languageRaw = row.language?.trim() || "English";
    const language = LANGUAGES.has(languageRaw as Language)
      ? (languageRaw as Language)
      : "English";

    const name = row.first_name?.trim() || row.full_name?.trim();
    if (!name) continue;

    byEmail.set(email, { name, email: row.email!.trim(), language });
  }

  return [...byEmail.values()].sort((a, b) => a.email.localeCompare(b.email));
}

export function loadRecipientsFromTsv(path: string): Recipient[] {
  const text = readFileSync(path, "utf8");
  return loadRecipientsFromTsvText(text);
}
