/**
 * SMTP integration test — verifies credentials from .env against the mail server.
 *
 * Usage:
 *   node --env-file=.env --import tsx src/test-smtp.ts [--send]
 *
 * Without --send: connects, authenticates, and disconnects (no email sent).
 * With    --send: also delivers a test email to SMTP_USER.
 */

import { createTransport } from "nodemailer";

const host = process.env.SMTP_HOST ?? "";
const port = Number(process.env.SMTP_PORT) || 465;
const user = process.env.SMTP_USER ?? "";
const pass = process.env.SMTP_PASS ?? "";
const from =
  process.env.SMTP_FROM ?? "Run for Ukraine 2026 <noreply@european-resolve.org>";
const replyTo = process.env.SMTP_REPLY_TO ?? "info@european-resolve.org";

const shouldSend = process.argv.includes("--send");

function fatal(msg: string): never {
  console.error(`\n  FAIL  ${msg}\n`);
  process.exit(1);
}

if (!host || !user || !pass) {
  fatal(
    "Missing SMTP env vars. Ensure .env contains SMTP_HOST, SMTP_USER, and SMTP_PASS.",
  );
}

console.log("SMTP integration test");
console.log("─".repeat(50));
console.log(`  Host : ${host}:${port}`);
console.log(`  User : ${user}`);
console.log(`  From : ${from}`);
console.log(`  Reply: ${replyTo}`);
console.log(`  Mode : ${shouldSend ? "connect + send test email" : "connect only (use --send to deliver)"}`);
console.log();

const transporter = createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 10_000,
});

try {
  console.log("→ Connecting and authenticating…");
  await transporter.verify();
  console.log("  ✓ SMTP authentication succeeded\n");
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  fatal(`SMTP authentication failed: ${message}`);
}

if (shouldSend) {
  const to = user;
  console.log(`→ Sending test email to ${to}…`);

  try {
    const info = await transporter.sendMail({
      from,
      replyTo,
      to,
      subject: "[Test] SMTP integration test — Run for Ukraine 2026",
      text: "This is an automated integration test. If you received this, SMTP delivery is working.",
      html: `
        <div style="font-family:sans-serif;padding:24px;">
          <h2 style="color:#0057b8;">SMTP Integration Test</h2>
          <p>This is an automated integration test from the Run for Ukraine 2026 backend.</p>
          <p>If you received this, <strong>SMTP delivery is working correctly.</strong></p>
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;">
          <p style="font-size:12px;color:#999;">Sent at ${new Date().toISOString()}</p>
        </div>
      `,
    });

    console.log(`  ✓ Email sent  (messageId: ${info.messageId})\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    fatal(`Email delivery failed: ${message}`);
  }
}

console.log("  PASS  All checks passed\n");
transporter.close();
