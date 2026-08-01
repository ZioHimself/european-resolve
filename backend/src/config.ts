const nodeEnv = (process.env.NODE_ENV === "production" ? "production" : "development") as
  | "development"
  | "production";

const spreadsheetId = process.env.SPREADSHEET_ID ?? "";
const googleDriveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID ?? "";

if (nodeEnv === "production" && !spreadsheetId) {
  throw new Error("SPREADSHEET_ID environment variable is required in production");
}

if (nodeEnv === "production" && !googleDriveFolderId) {
  throw new Error("GOOGLE_DRIVE_FOLDER_ID environment variable is required in production");
}

export const config = Object.freeze({
  port: Number(process.env.PORT) || 8080,
  spreadsheetId,
  googleDriveFolderId,
  galleryFolderId: process.env.GALLERY_FOLDER_ID ?? "",
  goalEur: Number(process.env.GOAL_EUR) || 3000,
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  donationUrl: process.env.WHYDONATE_WIDGET_URL ?? "",
  driveOAuth: {
    clientId: process.env.DRIVE_OAUTH_CLIENT_ID ?? "",
    clientSecret: process.env.DRIVE_OAUTH_CLIENT_SECRET ?? "",
    refreshToken: process.env.DRIVE_OAUTH_REFRESH_TOKEN ?? "",
  },
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from:
      process.env.SMTP_FROM ??
      "Run for Ukraine 2026 <noreply@european-resolve.org>",
  },
  nodeEnv,
});
