import { Hono } from "hono";
import { SheetsService } from "../services/sheets.js";
import { config } from "../config.js";
import type { ProgressResponse, ApiResponse } from "../types.js";

export const progressRoute = new Hono();

const sheetsService = new SheetsService();

progressRoute.get("/", async (c) => {
  try {
    const { totalRaisedEur, participantCount, donorCount } =
      await sheetsService.getProgress();

    const goalPercent = Math.min(
      100,
      Math.round((totalRaisedEur / config.goalEur) * 100),
    );

    const response: ProgressResponse = {
      totalRaisedEur,
      goalEur: config.goalEur,
      goalPercent,
      participantCount,
      donorCount,
    };

    c.header("Cache-Control", "public, max-age=30");

    return c.json({
      success: true,
      data: response,
    } satisfies ApiResponse<ProgressResponse>);
  } catch (err) {
    console.error("Progress fetch failed:", err);
    throw err;
  }
});
