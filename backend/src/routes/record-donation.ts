import { Hono } from "hono";
import { SheetsService } from "../services/sheets.js";
import type { ApiResponse } from "../types.js";

export const recordDonationRoute = new Hono();

const sheetsService = new SheetsService();

recordDonationRoute.post("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const body = (await c.req.json()) as Record<string, unknown>;

  const amount = Number(body.amount);
  if (!amount || amount <= 0) {
    return c.json(
      {
        success: false,
        errors: [{ field: "amount", message: "Valid donation amount is required" }],
      } satisfies ApiResponse<never>,
      400,
    );
  }

  const fundraiser = await sheetsService.getFundraiser(slug);
  if (!fundraiser) {
    return c.json(
      {
        success: false,
        errors: [{ field: "slug", message: "Fundraiser not found", code: "VALIDATION_SLUG_NOT_FOUND" }],
      } satisfies ApiResponse<never>,
      404,
    );
  }

  await sheetsService.addDonorWallEntry(slug, "", "", amount);

  return c.json({
    success: true,
    data: { recorded: true },
  } satisfies ApiResponse<{ recorded: boolean }>, 201);
});
