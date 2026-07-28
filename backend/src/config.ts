const nodeEnv = (process.env.NODE_ENV === "production" ? "production" : "development") as
  | "development"
  | "production";

const spreadsheetId = process.env.SPREADSHEET_ID ?? "";

if (nodeEnv === "production" && !spreadsheetId) {
  throw new Error("SPREADSHEET_ID environment variable is required in production");
}

export const config = Object.freeze({
  port: Number(process.env.PORT) || 8080,
  spreadsheetId,
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  monobankJarUrl: process.env.MONOBANK_JAR_URL ?? "",
  nodeEnv,
});
