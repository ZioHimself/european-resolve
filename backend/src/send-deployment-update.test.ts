import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, unlinkSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadRecipientsFromTsv } from "./lib/recipients.js";
import { runPreview } from "./send-deployment-update.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, "fixtures", "recipients.tsv");
const previewPath = join(__dirname, "fixtures", "preview-output.html");

describe("loadRecipientsFromTsv", () => {
  it("includes only paid, comms-opted-in rows with a name", () => {
    const recipients = loadRecipientsFromTsv(fixturePath);

    expect(recipients).toHaveLength(2);
    expect(recipients.map((r) => r.email)).toEqual([
      "french@example.com",
      "optin@example.com",
    ]);
    expect(recipients.map((r) => r.email)).not.toContain("pending@example.com");
  });
});

describe("runPreview", () => {
  beforeEach(() => {
    if (existsSync(previewPath)) unlinkSync(previewPath);
  });

  afterEach(() => {
    if (existsSync(previewPath)) unlinkSync(previewPath);
  });

  it("writes one rendered HTML file and returns the subject", () => {
    const subject = runPreview(
      ["--preview", "--locale", "en", "--out", previewPath],
      fixturePath,
    );

    expect(subject).toBe("Run for Ukraine 2026 | Update from Hurkit");
    expect(existsSync(previewPath)).toBe(true);
    const html = readFileSync(previewPath, "utf8");
    expect(html).toContain("Hello Alice,");
    expect(html).toContain("Update from Hurkit");
  });
});
