import { Hono } from "hono";
import { SheetsService } from "../services/sheets.js";
import { DriveService } from "../services/drive.js";
import type {
  FundraiserResponse,
  ValidationError,
  ApiResponse,
} from "../types.js";

export const fundraiserRoute = new Hono();

const sheetsService = new SheetsService();
const driveService = new DriveService();

const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

fundraiserRoute.post("/", async (c) => {
  const formData = await c.req.formData();

  const displayName = formData.get("displayName") as string | null;
  const message = formData.get("message") as string | null;
  const goalEurRaw = formData.get("goalEur") as string | null;
  const photo = formData.get("photo") as File | null;

  const errors: ValidationError[] = [];

  if (!displayName || displayName.trim().length < 2 || displayName.trim().length > 50) {
    errors.push({ field: "displayName", message: "Display name must be 2-50 characters" });
  }

  if (!message || message.trim().length > 500) {
    errors.push({ field: "message", message: "Message is required (max 500 characters)" });
  }

  const goalEur = Number(goalEurRaw);
  if (!goalEurRaw || isNaN(goalEur) || goalEur < 10 || goalEur > 100000 || !Number.isInteger(goalEur)) {
    errors.push({ field: "goalEur", message: "Goal must be a whole number between 10 and 100,000 EUR" });
  }

  if (photo) {
    if (!ALLOWED_IMAGE_TYPES.includes(photo.type)) {
      errors.push({ field: "photo", message: "Photo must be JPEG, PNG, or WebP" });
    }
    if (photo.size > MAX_PHOTO_SIZE) {
      errors.push({ field: "photo", message: "Photo must be under 5MB" });
    }
  }

  if (errors.length > 0) {
    return c.json({ success: false, errors } satisfies ApiResponse<never>, 400);
  }

  let photoFileId: string | null = null;
  if (photo) {
    const buffer = Buffer.from(await photo.arrayBuffer());
    photoFileId = await driveService.uploadPhoto(buffer, photo.name);
  }

  const { slug, editToken } = await sheetsService.createFundraiser(
    { displayName: displayName!.trim(), message: message!.trim(), goalEur },
    photoFileId,
  );

  const response: FundraiserResponse = {
    slug,
    displayName: displayName!.trim(),
    message: message!.trim(),
    goalEur,
    photoUrl: photoFileId ? driveService.getPhotoUrl(photoFileId) : null,
    status: "draft",
    createdAt: new Date().toISOString(),
    editToken,
  };

  return c.json({ success: true, data: response } satisfies ApiResponse<FundraiserResponse>, 201);
});

fundraiserRoute.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const fundraiser = await sheetsService.getFundraiser(slug);

  if (!fundraiser) {
    return c.json(
      { success: false, errors: [{ field: "slug", message: "Fundraiser not found" }] } satisfies ApiResponse<never>,
      404,
    );
  }

  const response: FundraiserResponse = {
    slug: fundraiser.slug,
    displayName: fundraiser.displayName,
    message: fundraiser.message,
    goalEur: fundraiser.goalEur,
    photoUrl: fundraiser.photoFileId ? driveService.getPhotoUrl(fundraiser.photoFileId) : null,
    status: fundraiser.status,
    createdAt: fundraiser.createdAt,
  };

  return c.json({ success: true, data: response } satisfies ApiResponse<FundraiserResponse>);
});

fundraiserRoute.put("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { success: false, errors: [{ field: "authorization", message: "Edit token required" }] } satisfies ApiResponse<never>,
      403,
    );
  }

  const editToken = authHeader.slice(7);

  const formData = await c.req.formData();
  const displayName = formData.get("displayName") as string | null;
  const message = formData.get("message") as string | null;
  const goalEurRaw = formData.get("goalEur") as string | null;
  const status = formData.get("status") as string | null;
  const photo = formData.get("photo") as File | null;

  const errors: ValidationError[] = [];

  if (displayName !== null && (displayName.trim().length < 2 || displayName.trim().length > 50)) {
    errors.push({ field: "displayName", message: "Display name must be 2-50 characters" });
  }

  if (message !== null && message.trim().length > 500) {
    errors.push({ field: "message", message: "Message must be max 500 characters" });
  }

  if (goalEurRaw !== null) {
    const g = Number(goalEurRaw);
    if (isNaN(g) || g < 10 || g > 100000 || !Number.isInteger(g)) {
      errors.push({ field: "goalEur", message: "Goal must be a whole number between 10 and 100,000 EUR" });
    }
  }

  if (status !== null && status !== "draft" && status !== "published") {
    errors.push({ field: "status", message: "Status must be 'draft' or 'published'" });
  }

  if (photo) {
    if (!ALLOWED_IMAGE_TYPES.includes(photo.type)) {
      errors.push({ field: "photo", message: "Photo must be JPEG, PNG, or WebP" });
    }
    if (photo.size > MAX_PHOTO_SIZE) {
      errors.push({ field: "photo", message: "Photo must be under 5MB" });
    }
  }

  if (errors.length > 0) {
    return c.json({ success: false, errors } satisfies ApiResponse<never>, 400);
  }

  let photoFileId: string | undefined;
  if (photo) {
    const buffer = Buffer.from(await photo.arrayBuffer());
    photoFileId = await driveService.uploadPhoto(buffer, photo.name);
  }

  const updates: Record<string, unknown> = {};
  if (displayName !== null) updates.displayName = displayName.trim();
  if (message !== null) updates.message = message.trim();
  if (goalEurRaw !== null) updates.goalEur = Number(goalEurRaw);
  if (status !== null) updates.status = status;

  const updated = await sheetsService.updateFundraiser(slug, editToken, updates, photoFileId);

  if (!updated) {
    return c.json(
      { success: false, errors: [{ field: "authorization", message: "Invalid edit token or fundraiser not found" }] } satisfies ApiResponse<never>,
      403,
    );
  }

  const response: FundraiserResponse = {
    slug: updated.slug,
    displayName: updated.displayName,
    message: updated.message,
    goalEur: updated.goalEur,
    photoUrl: updated.photoFileId ? driveService.getPhotoUrl(updated.photoFileId) : null,
    status: updated.status,
    createdAt: updated.createdAt,
  };

  return c.json({ success: true, data: response } satisfies ApiResponse<FundraiserResponse>);
});
