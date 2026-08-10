#!/usr/bin/env node
/**
 * Refresh Google Drive OAuth credentials locally.
 *
 * Credentials are read from your filesystem only — never paste the JSON into chat.
 *
 * Usage:
 *   # Step 1: print (and optionally open) the consent URL
 *   node scripts/refresh-drive-oauth.mjs auth --credentials /path/to/client_secret.json
 *
 *   # Step 2: exchange the redirect URL for a refresh token
 *   node scripts/refresh-drive-oauth.mjs exchange \
 *     --credentials /path/to/client_secret.json \
 *     --redirect-url 'http://localhost/?code=...&scope=...'
 *
 *   # Interactive (auth + paste redirect URL in terminal)
 *   node scripts/refresh-drive-oauth.mjs refresh --credentials /path/to/client_secret.json
 *
 *   # Local web UI on http://localhost (port 80, auto-captures OAuth redirect)
 *   sudo node scripts/refresh-drive-oauth.mjs serve --credentials /path/to/client_secret.json
 *   # Manual paste fallback only: add --manual
 *
 *   # Verify an existing refresh token still works
 *   node scripts/refresh-drive-oauth.mjs verify \
 *     --credentials /path/to/client_secret.json \
 *     --refresh-token '1//...'
 *
 *   # Push tokens to GitHub Secrets (requires gh auth login)
 *   node scripts/refresh-drive-oauth.mjs exchange ... --update-github-secrets [--deploy]
 */

import { google } from "googleapis";
import fs from "node:fs";
import http from "node:http";
import readline from "node:readline/promises";
import { execSync, spawnSync } from "node:child_process";
import { stdin as input, stdout as output } from "node:process";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
];

const DEFAULT_PORT = 80;

function usage() {
  console.error(`Usage:
  refresh-drive-oauth.mjs auth      --credentials <path> [--open]
  refresh-drive-oauth.mjs exchange  --credentials <path> --redirect-url <url> [--format env|json] [--update-github-secrets] [--deploy] [--repo owner/repo]
  refresh-drive-oauth.mjs refresh   --credentials <path> [--open] [--update-github-secrets] [--deploy] [--repo owner/repo]
  refresh-drive-oauth.mjs serve     --credentials <path> [--port ${DEFAULT_PORT}] [--open] [--manual] [--repo owner/repo]
  refresh-drive-oauth.mjs verify    --credentials <path> --refresh-token <token>
  refresh-drive-oauth.mjs push-github --credentials <path> --refresh-token <token> [--deploy] [--repo owner/repo]

GitHub flags (exchange, refresh, push-github):
  --update-github-secrets   Run gh secret set for DRIVE_OAUTH_* (requires gh auth login)
  --deploy                  Trigger deploy-backend.yml after updating secrets
  --repo owner/repo         Target repo (default: current git remote)

Serve flags:
  --manual                  Disable auto-capture; require manual redirect URL paste
  Port 80 matches redirect URI http://localhost — may require sudo`);
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { command: positional[0], flags };
}

function loadCredentials(credentialsPath) {
  if (!credentialsPath) {
    throw new Error("--credentials is required");
  }

  const resolved = credentialsPath.startsWith("~")
    ? `${process.env.HOME}${credentialsPath.slice(1)}`
    : credentialsPath;

  if (!fs.existsSync(resolved)) {
    throw new Error(`Credentials file not found: ${resolved}`);
  }

  const raw = JSON.parse(fs.readFileSync(resolved, "utf8"));
  const creds = raw.installed ?? raw.web;
  if (!creds?.client_id || !creds?.client_secret) {
    throw new Error("Invalid client secret JSON: expected installed or web credentials");
  }

  const redirectUri = creds.redirect_uris?.[0] ?? "http://localhost";
  return { creds, redirectUri, resolved };
}

function createOAuthClient(creds, redirectUri) {
  return new google.auth.OAuth2(creds.client_id, creds.client_secret, redirectUri);
}

function encodeOAuthState({ gh, deploy, repo }) {
  return Buffer.from(JSON.stringify({ gh: !!gh, deploy: !!deploy, repo: repo ?? null })).toString(
    "base64url",
  );
}

function decodeOAuthState(state) {
  if (!state) {
    return { gh: false, deploy: false, repo: null };
  }
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    return {
      gh: !!parsed.gh,
      deploy: !!parsed.deploy,
      repo: parsed.repo ?? null,
    };
  } catch {
    return { gh: false, deploy: false, repo: null };
  }
}

function buildAuthUrl(oauth2, state) {
  const options = {
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  };
  if (state) {
    options.state = state;
  }
  return oauth2.generateAuthUrl(options);
}

function ghFlagsFromState(state, defaultRepo) {
  const flags = {
    "update-github-secrets": state.gh,
    deploy: state.deploy,
  };
  const repo = defaultRepo ?? state.repo;
  if (repo) {
    flags.repo = repo;
  }
  return flags;
}

function applyGhActions(creds, refreshToken, ghFlags) {
  let ghStatus = "";
  if (ghFlags["update-github-secrets"]) {
    updateGithubSecrets(creds, refreshToken, ghFlags);
    ghStatus += "<p>GitHub Secrets updated via <code>gh</code>.</p>";
    if (ghFlags.deploy) {
      triggerBackendDeploy(ghFlags);
      ghStatus += "<p>Deploy workflow triggered.</p>";
    }
  }
  return ghStatus;
}

function renderTokenSuccessHtml(creds, refreshToken, ghFlags, ghStatus) {
  const envBlock = formatEnvVars(creds, refreshToken);
  return htmlPage(
    "Refresh token ready",
    `<p>Success. Copy these lines into <code>backend/.env</code>${ghFlags["update-github-secrets"] ? "" : " and GitHub Secrets"}:</p>
     ${ghStatus}
     <pre>${escapeHtml(envBlock)}</pre>
     <p><a class="button" href="/">Start over</a></p>`,
  );
}

function parseRequestUrl(reqUrl) {
  return new URL(reqUrl, "http://localhost");
}

function parseAuthorizationCode(redirectUrl) {
  const trimmed = redirectUrl.trim();
  const codeMatch = trimmed.match(/[?&]code=([^&]+)/);
  if (codeMatch) {
    return decodeURIComponent(codeMatch[1]);
  }
  if (trimmed && !trimmed.includes("://")) {
    return trimmed;
  }
  throw new Error("Could not find ?code= in redirect URL");
}

function formatEnvVars(creds, refreshToken) {
  return [
    `DRIVE_OAUTH_CLIENT_ID=${creds.client_id}`,
    `DRIVE_OAUTH_CLIENT_SECRET=${creds.client_secret}`,
    `DRIVE_OAUTH_REFRESH_TOKEN=${refreshToken}`,
  ].join("\n");
}

function assertGhAuthenticated() {
  const result = spawnSync("gh", ["auth", "status"], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error("gh CLI is not authenticated. Run: gh auth login");
  }
}

function ghArgs(flags, subcommandArgs) {
  const args = [...subcommandArgs];
  if (flags.repo) {
    args.push("-R", flags.repo);
  }
  return args;
}

function ghSecretSet(name, value, flags) {
  const result = spawnSync(
    "gh",
    ghArgs(flags, ["secret", "set", name, "--body", value]),
    { stdio: "inherit" },
  );
  if (result.status !== 0) {
    throw new Error(`gh secret set ${name} failed`);
  }
}

function updateGithubSecrets(creds, refreshToken, flags) {
  assertGhAuthenticated();

  console.log("\nUpdating GitHub Secrets...");
  ghSecretSet("DRIVE_OAUTH_CLIENT_ID", creds.client_id, flags);
  ghSecretSet("DRIVE_OAUTH_CLIENT_SECRET", creds.client_secret, flags);
  ghSecretSet("DRIVE_OAUTH_REFRESH_TOKEN", refreshToken, flags);
  console.log("GitHub Secrets updated.");
}

function triggerBackendDeploy(flags) {
  assertGhAuthenticated();

  console.log("\nTriggering deploy-backend.yml...");
  const result = spawnSync(
    "gh",
    ghArgs(flags, ["workflow", "run", "deploy-backend.yml"]),
    { stdio: "inherit" },
  );
  if (result.status !== 0) {
    throw new Error("gh workflow run deploy-backend.yml failed");
  }
  console.log("Deploy workflow triggered.");
}

async function finalizeTokens(creds, tokens, flags, format = "env") {
  if (!tokens.refresh_token) {
    throw new Error(
      "No refresh_token returned. Revoke app access at https://myaccount.google.com/permissions and run again with prompt=consent.",
    );
  }

  if (flags["update-github-secrets"]) {
    updateGithubSecrets(creds, tokens.refresh_token, flags);
  }

  if (flags.deploy) {
    if (!flags["update-github-secrets"]) {
      throw new Error("--deploy requires --update-github-secrets (or use push-github)");
    }
    triggerBackendDeploy(flags);
  }

  if (format === "json") {
    console.log(
      JSON.stringify(
        {
          clientId: creds.client_id,
          clientSecret: creds.client_secret,
          refreshToken: tokens.refresh_token,
          githubSecretsUpdated: Boolean(flags["update-github-secrets"]),
          deployTriggered: Boolean(flags.deploy),
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log("\nAdd these to backend/.env");
  if (!flags["update-github-secrets"]) {
    console.log("(and GitHub Secrets):\n");
  } else {
    console.log("(GitHub Secrets already updated):\n");
  }
  console.log(formatEnvVars(creds, tokens.refresh_token));
  console.log("");
}

async function exchangeCode(creds, redirectUri, redirectUrl) {
  const oauth2 = createOAuthClient(creds, redirectUri);
  const code = parseAuthorizationCode(redirectUrl);
  const { tokens } = await oauth2.getToken(code);
  return tokens;
}

function maybeOpen(url, shouldOpen) {
  if (!shouldOpen) return;
  try {
    execSync(`open "${url}"`, { stdio: "ignore" });
  } catch {
    // open(1) is macOS-only
  }
}

async function cmdAuth(flags) {
  const { creds, redirectUri } = loadCredentials(flags.credentials);
  const oauth2 = createOAuthClient(creds, redirectUri);
  const authUrl = buildAuthUrl(oauth2);

  console.log("\nOpen this URL and sign in as the Drive folder owner:\n");
  console.log(authUrl);
  console.log(
    "\nAfter consent, copy the full redirect URL from the browser address bar.",
  );
  console.log("Then run exchange or paste it into the local serve UI.\n");

  maybeOpen(authUrl, flags.open);
}

async function cmdExchange(flags) {
  const { creds, redirectUri } = loadCredentials(flags.credentials);
  if (!flags["redirect-url"]) {
    throw new Error("--redirect-url is required");
  }

  const tokens = await exchangeCode(creds, redirectUri, flags["redirect-url"]);
  await finalizeTokens(creds, tokens, flags, flags.format ?? "env");
}

async function cmdRefresh(flags) {
  await cmdAuth(flags);

  const rl = readline.createInterface({ input, output });
  const pasted = (await rl.question("Redirect URL or authorization code: ")).trim();
  rl.close();

  const { creds, redirectUri } = loadCredentials(flags.credentials);
  const tokens = await exchangeCode(creds, redirectUri, pasted);
  await finalizeTokens(creds, tokens, flags, flags.format ?? "env");
}

async function cmdPushGithub(flags) {
  const { creds } = loadCredentials(flags.credentials);
  const refreshToken = flags["refresh-token"];
  if (!refreshToken) {
    throw new Error("--refresh-token is required");
  }

  updateGithubSecrets(creds, refreshToken, flags);

  if (flags.deploy) {
    triggerBackendDeploy(flags);
  }
}

async function cmdVerify(flags) {
  const { creds, redirectUri } = loadCredentials(flags.credentials);
  const refreshToken = flags["refresh-token"];
  if (!refreshToken) {
    throw new Error("--refresh-token is required");
  }

  const oauth2 = createOAuthClient(creds, redirectUri);
  oauth2.setCredentials({ refresh_token: refreshToken });

  const drive = google.drive({ version: "v3", auth: oauth2 });
  const res = await drive.about.get({ fields: "user(displayName,emailAddress)" });

  console.log("Refresh token is valid.");
  console.log(`Drive account: ${res.data.user?.emailAddress ?? "unknown"}`);
}

function htmlPage(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
    body { max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    textarea, input[type="url"] { width: 100%; min-height: 6rem; font: inherit; }
    button, a.button {
      display: inline-block; margin-top: 1rem; padding: 0.6rem 1rem;
      background: #0a1628; color: #f5f2eb; border: 0; border-radius: 0.25rem;
      text-decoration: none; cursor: pointer;
    }
    pre {
      background: #111827; color: #f5f2eb; padding: 1rem; overflow: auto;
      border-radius: 0.25rem; white-space: pre-wrap; word-break: break-all;
    }
    .muted { opacity: 0.75; font-size: 0.95rem; }
    .error { color: #c41e3a; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
</body>
</html>`;
}

async function cmdServe(flags) {
  const { creds, redirectUri, resolved } = loadCredentials(flags.credentials);
  const oauth2 = createOAuthClient(creds, redirectUri);
  const port = Number(flags.port ?? DEFAULT_PORT);
  const host = "127.0.0.1";
  const manualOnly = Boolean(flags.manual);
  const serveRepo = flags.repo;

  function renderHomePage() {
    const autoSection = manualOnly
      ? ""
      : `<form method="GET" action="/auth">
           <p><label><input type="checkbox" name="update-github-secrets" value="1" /> Update GitHub Secrets via <code>gh</code></label></p>
           <p><label><input type="checkbox" name="deploy" value="1" /> Trigger <code>deploy-backend.yml</code> after updating secrets</label></p>
           <button type="submit">Sign in with Google</button>
         </form>
         <p class="muted">After consent, Google redirects back here and the refresh token is captured automatically.</p>`;

    const manualSection = manualOnly
      ? `<form method="POST" action="/exchange">
           <label for="redirect-url"><strong>Redirect URL</strong></label>
           <textarea id="redirect-url" name="redirect-url" required placeholder="http://localhost/?code=...&scope=..."></textarea>
           <p><label><input type="checkbox" name="update-github-secrets" value="1" /> Update GitHub Secrets via <code>gh</code></label></p>
           <p><label><input type="checkbox" name="deploy" value="1" /> Trigger <code>deploy-backend.yml</code> after updating secrets</label></p>
           <button type="submit">Exchange for refresh token</button>
         </form>`
      : `<details>
           <summary>Manual redirect URL paste (fallback)</summary>
           <form method="POST" action="/exchange">
             <label for="redirect-url"><strong>Redirect URL</strong></label>
             <textarea id="redirect-url" name="redirect-url" required placeholder="http://localhost/?code=...&scope=..."></textarea>
             <p><label><input type="checkbox" name="update-github-secrets" value="1" /> Update GitHub Secrets via <code>gh</code></label></p>
             <p><label><input type="checkbox" name="deploy" value="1" /> Trigger <code>deploy-backend.yml</code> after updating secrets</label></p>
             <button type="submit">Exchange for refresh token</button>
           </form>
         </details>`;

    return htmlPage(
      "Refresh Drive OAuth",
      `<p class="muted">Credentials loaded from <code>${escapeHtml(resolved)}</code> (local file only).</p>
       ${autoSection}
       ${manualSection}`,
    );
  }

  const server = http.createServer(async (req, res) => {
    try {
      const url = parseRequestUrl(req.url ?? "/");
      const pathname = url.pathname;

      if (req.method === "GET" && pathname === "/auth") {
        const state = encodeOAuthState({
          gh: url.searchParams.has("update-github-secrets"),
          deploy: url.searchParams.has("deploy"),
          repo: serveRepo ?? null,
        });
        const authUrl = buildAuthUrl(oauth2, state);
        res.writeHead(302, { Location: authUrl });
        res.end();
        return;
      }

      if (req.method === "GET" && pathname === "/") {
        const oauthError = url.searchParams.get("error");
        if (oauthError) {
          const description = url.searchParams.get("error_description") ?? oauthError;
          res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
          res.end(
            htmlPage(
              "Authorization denied",
              `<p class="error">${escapeHtml(description)}</p>
               <p><a class="button" href="/">Back</a></p>`,
            ),
          );
          return;
        }

        const code = url.searchParams.get("code");
        if (code && !manualOnly) {
          const state = decodeOAuthState(url.searchParams.get("state"));
          const ghFlags = ghFlagsFromState(state, serveRepo);
          const tokens = await exchangeCode(creds, redirectUri, code);

          if (!tokens.refresh_token) {
            throw new Error(
              "No refresh_token returned. Revoke app access at https://myaccount.google.com/permissions and try again.",
            );
          }

          const ghStatus = applyGhActions(creds, tokens.refresh_token, ghFlags);
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(renderTokenSuccessHtml(creds, tokens.refresh_token, ghFlags, ghStatus));
          return;
        }

        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(renderHomePage());
        return;
      }

      if (req.method === "POST" && pathname === "/exchange") {
        const body = await readBody(req);
        const params = new URLSearchParams(body);
        const redirectUrl = params.get("redirect-url") ?? "";
        const tokens = await exchangeCode(creds, redirectUri, redirectUrl);

        if (!tokens.refresh_token) {
          throw new Error(
            "No refresh_token returned. Revoke app access at https://myaccount.google.com/permissions and try again.",
          );
        }

        const ghFlags = {
          "update-github-secrets": params.has("update-github-secrets"),
          deploy: params.has("deploy"),
        };
        if (serveRepo) {
          ghFlags.repo = serveRepo;
        }

        const ghStatus = applyGhActions(creds, tokens.refresh_token, ghFlags);
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(renderTokenSuccessHtml(creds, tokens.refresh_token, ghFlags, ghStatus));
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    } catch (err) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        htmlPage(
          "Error",
          `<p class="error">${escapeHtml(err instanceof Error ? err.message : String(err))}</p>
           <p><a class="button" href="/">Back</a></p>`,
        ),
      );
    }
  });

  await new Promise((resolve, reject) => {
    const onError = (err) => {
      if (err.code === "EACCES" && port < 1024) {
        reject(
          new Error(
            `Port ${port} requires elevated privileges. Run:\n  sudo node scripts/refresh-drive-oauth.mjs serve --credentials ${flags.credentials}`,
          ),
        );
        return;
      }
      if (err.code === "EADDRINUSE") {
        reject(new Error(`Port ${port} is already in use.`));
        return;
      }
      reject(err);
    };

    server.once("error", onError);
    server.listen(port, host, () => {
      server.removeListener("error", onError);
      resolve();
    });
  });

  const displayHost = port === 80 ? "localhost" : `${host}:${port}`;
  const url = `http://${displayHost}/`;
  console.log(`Local OAuth refresh UI: ${url}`);
  console.log(`Credentials: ${resolved}`);
  if (!manualOnly) {
    console.log("Auto-capture enabled (Google redirect → http://localhost/)");
  } else {
    console.log("Manual mode — paste redirect URL after consent");
  }
  if (port < 1024) {
    console.log("Note: port 80 requires sudo on most systems");
  }
  maybeOpen(url, flags.open);

  process.on("SIGINT", () => {
    server.close();
    process.exit(0);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));

  if (!command || flags.help) {
    usage();
    process.exit(command ? 0 : 1);
  }

  try {
    switch (command) {
      case "auth":
        await cmdAuth(flags);
        break;
      case "exchange":
        await cmdExchange(flags);
        break;
      case "refresh":
        await cmdRefresh(flags);
        break;
      case "serve":
        await cmdServe(flags);
        break;
      case "verify":
        await cmdVerify(flags);
        break;
      case "push-github":
        await cmdPushGithub(flags);
        break;
      default:
        usage();
        process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();
