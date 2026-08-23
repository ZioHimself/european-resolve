import { Hono } from "hono";
import { SheetsService } from "../services/sheets.js";
import { isEventCompleted, registrationClosedResponse } from "../lib/eventClosure.js";
import type { ApiResponse, DonorWallEntry } from "../types.js";

export const recordDonationRoute = new Hono();

const sheetsService = new SheetsService();

recordDonationRoute.post("/:slug", async (c) => {
  if (isEventCompleted()) return registrationClosedResponse(c);

  const slug = c.req.param("slug");
  const body = (await c.req.json()) as Record<string, unknown>;

  const isRedirect = body.redirect === true;
  const amount = Number(body.amount) || 0;

  console.log("[record-donation] POST", slug, { amount, isRedirect, body });

  if (!isRedirect && amount <= 0) {
    console.log("[record-donation] rejected: no amount and not a redirect");
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
    console.log("[record-donation] fundraiser not found:", slug);
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
  const message = rawMessage || (
    amount > 0
      ? `supports "${fundraiser.displayName}" for €${amount}`
      : `supports "${fundraiser.displayName}"`
  );

  await sheetsService.addDonorWallEntry(slug, donorName, message, amount || undefined);

  const entry: DonorWallEntry = {
    fundraiserSlug: slug,
    donorName,
    message,
    createdAt: new Date().toISOString(),
  };

  console.log("[record-donation] recorded:", entry);

  return c.json({
    success: true,
    data: entry,
  } satisfies ApiResponse<DonorWallEntry>, 201);
});
