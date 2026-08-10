#!/usr/bin/env node
/**
 * @deprecated Use refresh-drive-oauth.mjs instead.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const secretPath = process.argv[2];
if (!secretPath) {
  console.error("Usage: node scripts/get-drive-token.mjs /path/to/client_secret.json");
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const result = spawnSync(
  process.execPath,
  [
    path.join(scriptDir, "refresh-drive-oauth.mjs"),
    "refresh",
    "--credentials",
    secretPath,
    "--open",
  ],
  { stdio: "inherit" },
);

process.exit(result.status ?? 1);
