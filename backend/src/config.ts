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
  goalEur: Number(process.env.GOAL_EUR) || 3000,
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  whydonateWidgetUrl: process.env.WHYDONATE_WIDGET_URL ?? "",
  nodeEnv,
});
