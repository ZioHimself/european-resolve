import { Hono } from "hono";
import { SheetsService } from "../services/sheets.js";
import type { DonorWallEntry, ValidationError, ApiResponse } from "../types.js";

export const donorsRoute = new Hono();

const sheetsService = new SheetsService();

donorsRoute.post("/", async (c) => {
  const body = (await c.req.json()) as Record<string, unknown>;

  const errors: ValidationError[] = [];

  const fundraiserSlug = body.fundraiserSlug;
  if (!fundraiserSlug || typeof fundraiserSlug !== "string" || !fundraiserSlug.trim()) {
    errors.push({ field: "fundraiserSlug", message: "Fundraiser slug is required", code: "VALIDATION_SLUG_REQUIRED" });
  }

  const donorName = body.donorName;
  if (
    !donorName ||
    typeof donorName !== "string" ||
    donorName.trim().length < 2 ||
    donorName.trim().length > 50
  ) {
    errors.push({ field: "donorName", message: "Name must be 2-50 characters", code: "VALIDATION_DONOR_NAME_LENGTH" });
  }

  const message = body.message;
  if (
    !message ||
    typeof message !== "string" ||
    message.trim().length < 5 ||
    message.trim().length > 200
  ) {
    errors.push({ field: "message", message: "Message must be 5-200 characters", code: "VALIDATION_DONOR_MESSAGE_LENGTH" });
  }

  if (errors.length > 0) {
    return c.json({ success: false, errors } satisfies ApiResponse<never>, 400);
  }

  const slug = (fundraiserSlug as string).trim();
  const fundraiser = await sheetsService.getFundraiser(slug);
  if (!fundraiser) {
    return c.json(
      {
        success: false,
        errors: [{ field: "fundraiserSlug", message: "Fundraiser not found" }],
      } satisfies ApiResponse<never>,
      404,
    );
  }

  const createdAt = new Date().toISOString();
  await sheetsService.addDonorWallEntry(
    slug,
    (donorName as string).trim(),
    (message as string).trim(),
  );

  const entry: DonorWallEntry = {
    fundraiserSlug: slug,
    donorName: (donorName as string).trim(),
    message: (message as string).trim(),
    createdAt,
  };

  return c.json({ success: true, data: entry } satisfies ApiResponse<DonorWallEntry>, 201);
});

donorsRoute.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const entries = await sheetsService.getDonorWallEntries(slug);

  return c.json({
    success: true,
    data: entries,
  } satisfies ApiResponse<DonorWallEntry[]>);
});
