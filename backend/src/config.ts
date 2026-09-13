export const config = Object.freeze({
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from:
      process.env.SMTP_FROM ??
      '"Run for Ukraine 2026" <noreply@european-resolve.org>',
    replyTo: process.env.SMTP_REPLY_TO ?? "info@european-resolve.org",
  },
});
