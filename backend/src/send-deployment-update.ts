/**
 * One-off send: Hurkit deployment update to paid, comms-opted-in participants.
 *
 * Usage:
 *   npm run send-deployment-update -- --preview
 *   npm run send-deployment-update -- --preview --locale en --out /tmp/preview.html
 *   npm run send-deployment-update -- --dry-run
 *   npm run send-deployment-update
 */

import { writeFileSync } from "node:fs";
import { LANGUAGE_TO_LOCALE, type Language } from "./types.js";
import { loadRecipientsFromTsv } from "./lib/recipients.js";
import { renderDeploymentUpdateEmail } from "./email/render.js";
import { sendDeploymentUpdateEmail } from "./services/email.js";

const TSV_PATH =
  process.env.DEPLOYMENT_RECIPIENTS_TSV ?? "/tmp/registrations.tsv";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getPreviewLocale(argv: string[]): string {
  const index = argv.indexOf("--locale");
  if (index === -1) return "en";
  return argv[index + 1] ?? "en";
}

function getPreviewOutPath(argv: string[]): string {
  const index = argv.indexOf("--out");
  if (index === -1) return "deployment-update-preview.html";
  return argv[index + 1] ?? "deployment-update-preview.html";
}

export function runPreview(argv: string[], recipientsPath = TSV_PATH): string {
  const localeCode = getPreviewLocale(argv);
  const outPath = getPreviewOutPath(argv);
  const recipients = loadRecipientsFromTsv(recipientsPath);
  const sample =
    recipients.find(
      (recipient) =>
        LANGUAGE_TO_LOCALE[recipient.language] === localeCode,
    ) ?? recipients[0];

  const name = sample?.name ?? "Friend";
  const rendered = renderDeploymentUpdateEmail(
    { name, email: sample?.email ?? "preview@example.com" },
    localeCode,
  );

  writeFileSync(outPath, rendered.html, "utf8");
  console.log(`Subject: ${rendered.subject}`);
  console.log(`Preview written to ${outPath}`);
  return rendered.subject;
}

export async function runSend(argv: string[], recipientsPath = TSV_PATH) {
  const dryRun = argv.includes("--dry-run");
  const recipients = loadRecipientsFromTsv(recipientsPath);

  console.log(
    dryRun
      ? `Dry run: would send ${recipients.length} deployment update emails`
      : `Sending ${recipients.length} deployment update emails…`,
  );
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
      await sendDeploymentUpdateEmail(
        {
          name: recipient.name,
          email: recipient.email,
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
}

async function main() {
  const argv = process.argv.slice(2);

  if (argv.includes("--preview")) {
    runPreview(argv);
    return;
  }

  await runSend(argv);
}

const isMain =
  process.argv[1]?.endsWith("send-deployment-update.ts") ||
  process.argv[1]?.endsWith("send-deployment-update.js");

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
