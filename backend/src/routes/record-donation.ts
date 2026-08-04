import { Hono } from "hono";
import { SheetsService } from "../services/sheets.js";
import type { ApiResponse, DonorWallEntry } from "../types.js";

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

  const rawName = typeof body.donorName === "string" ? body.donorName.trim() : "";
  const rawMessage = typeof body.message === "string" ? body.message.trim() : "";

  const donorName = rawName || "Anonymous";
  const message = rawMessage || `supports "${fundraiser.displayName}" for €${amount}`;

  await sheetsService.addDonorWallEntry(slug, donorName, message, amount);

  const entry: DonorWallEntry = {
    fundraiserSlug: slug,
    donorName,
    message,
    createdAt: new Date().toISOString(),
  };

  return c.json({
    success: true,
    data: entry,
  } satisfies ApiResponse<DonorWallEntry>, 201);
});
