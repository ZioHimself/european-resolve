import { Hono } from "hono";
import { SheetsService } from "../services/sheets.js";
import { DriveService } from "../services/drive.js";
import { sendFundraiserEmail } from "../services/email.js";
import { config } from "../config.js";
import { TIER_DATA } from "../tiers.js";
import type {
  FundraiserResponse,
  FundraiserRegisterResponse,
  RegisterRequest,
  ValidationError,
  ApiResponse,
  TierId,
  TshirtSize,
  Language,
} from "../types.js";

export const fundraiserRoute = new Hono();

const sheetsService = new SheetsService();
const driveService = new DriveService();

const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const VALID_TIER_IDS: TierId[] = ["supporter", "sprinter", "relay-runner", "marathoner", "ultramarathoner"];
const VALID_TSHIRT_SIZES: TshirtSize[] = ["XS", "S", "M", "L", "XL", "XXL"];
const VALID_LANGUAGES: Language[] = ["English", "French", "Ukrainian", "Dutch", "German"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

fundraiserRoute.post("/", async (c) => {
  const formData = await c.req.formData();

  const displayName = formData.get("displayName") as string | null;
  const message = formData.get("message") as string | null;
  const goalEurRaw = formData.get("goalEur") as string | null;
  const photo = formData.get("photo") as File | null;

  const errors: ValidationError[] = [];

  if (!displayName || displayName.trim().length < 2 || displayName.trim().length > 50) {
    errors.push({ field: "displayName", message: "Display name must be 2-50 characters", code: "VALIDATION_DISPLAYNAME_LENGTH" });
  }

  if (!message || message.trim().length > 500) {
    errors.push({ field: "message", message: "Message is required (max 500 characters)", code: "VALIDATION_MESSAGE_REQUIRED" });
  }

  const goalEur = Number(goalEurRaw);
  if (!goalEurRaw || isNaN(goalEur) || goalEur < 10 || goalEur > 100000 || !Number.isInteger(goalEur)) {
    errors.push({ field: "goalEur", message: "Goal must be a whole number between 10 and 100,000 EUR", code: "VALIDATION_GOAL_INVALID" });
  }

  if (photo) {
    if (!ALLOWED_IMAGE_TYPES.includes(photo.type)) {
      errors.push({ field: "photo", message: "Photo must be JPEG, PNG, or WebP", code: "VALIDATION_PHOTO_TYPE" });
    }
    if (photo.size > MAX_PHOTO_SIZE) {
      errors.push({ field: "photo", message: "Photo must be under 5MB", code: "VALIDATION_PHOTO_SIZE" });
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
  const [fundraiser, raisedEur] = await Promise.all([
    sheetsService.getFundraiser(slug),
    sheetsService.getFundraiserRaised(slug),
  ]);

  if (!fundraiser) {
    return c.json(
      { success: false, errors: [{ field: "slug", message: "Fundraiser not found", code: "VALIDATION_SLUG_NOT_FOUND" }] } satisfies ApiResponse<never>,
      404,
    );
  }

  const response: FundraiserResponse = {
    slug: fundraiser.slug,
    displayName: fundraiser.displayName,
    message: fundraiser.message,
    goalEur: fundraiser.goalEur,
    raisedEur,
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
      { success: false, errors: [{ field: "authorization", message: "Edit token required", code: "VALIDATION_AUTH_REQUIRED" }] } satisfies ApiResponse<never>,
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
    errors.push({ field: "displayName", message: "Display name must be 2-50 characters", code: "VALIDATION_DISPLAYNAME_LENGTH" });
  }

  if (message !== null && message.trim().length > 500) {
    errors.push({ field: "message", message: "Message must be max 500 characters", code: "VALIDATION_MESSAGE_LENGTH" });
  }

  if (goalEurRaw !== null) {
    const g = Number(goalEurRaw);
    if (isNaN(g) || g < 10 || g > 100000 || !Number.isInteger(g)) {
      errors.push({ field: "goalEur", message: "Goal must be a whole number between 10 and 100,000 EUR", code: "VALIDATION_GOAL_INVALID" });
    }
  }

  if (status !== null && status !== "draft" && status !== "published") {
    errors.push({ field: "status", message: "Status must be 'draft' or 'published'", code: "VALIDATION_STATUS_INVALID" });
  }

  if (photo) {
    if (!ALLOWED_IMAGE_TYPES.includes(photo.type)) {
      errors.push({ field: "photo", message: "Photo must be JPEG, PNG, or WebP", code: "VALIDATION_PHOTO_TYPE" });
    }
    if (photo.size > MAX_PHOTO_SIZE) {
      errors.push({ field: "photo", message: "Photo must be under 5MB", code: "VALIDATION_PHOTO_SIZE" });
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
      { success: false, errors: [{ field: "authorization", message: "Invalid edit token or fundraiser not found", code: "VALIDATION_AUTH_INVALID" }] } satisfies ApiResponse<never>,
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

fundraiserRoute.post("/register", async (c) => {
  const formData = await c.req.formData();

  const displayName = formData.get("displayName") as string | null;
  const message = formData.get("message") as string | null;
  const goalEurRaw = formData.get("goalEur") as string | null;
  const photo = formData.get("photo") as File | null;

  const firstName = formData.get("firstName") as string | null;
  const lastName = formData.get("lastName") as string | null;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const tshirtSize = formData.get("tshirtSize") as string | null;
  const language = formData.get("language") as string | null;
  const country = formData.get("country") as string | null;
  const tierId = formData.get("tierId") as string | null;
  const gdprConsent = formData.get("gdprConsent");
  const commsOptin = formData.get("commsOptin");

  const errors: ValidationError[] = [];

  if (!displayName || displayName.trim().length < 2 || displayName.trim().length > 50) {
    errors.push({ field: "displayName", message: "Display name must be 2-50 characters", code: "VALIDATION_DISPLAYNAME_LENGTH" });
  }

  if (!message || message.trim().length > 500) {
    errors.push({ field: "message", message: "Message is required (max 500 characters)", code: "VALIDATION_MESSAGE_REQUIRED" });
  }

  const goalEur = Number(goalEurRaw);
  if (!goalEurRaw || isNaN(goalEur) || goalEur < 10 || goalEur > 100000 || !Number.isInteger(goalEur)) {
    errors.push({ field: "goalEur", message: "Goal must be a whole number between 10 and 100,000 EUR", code: "VALIDATION_GOAL_INVALID" });
  }

  if (photo) {
    if (!ALLOWED_IMAGE_TYPES.includes(photo.type)) {
      errors.push({ field: "photo", message: "Photo must be JPEG, PNG, or WebP", code: "VALIDATION_PHOTO_TYPE" });
    }
    if (photo.size > MAX_PHOTO_SIZE) {
      errors.push({ field: "photo", message: "Photo must be under 5MB", code: "VALIDATION_PHOTO_SIZE" });
    }
  }

  if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
    errors.push({ field: "firstName", message: "First name is required", code: "VALIDATION_FIRSTNAME_REQUIRED" });
  }

  if (!lastName || typeof lastName !== "string" || !lastName.trim()) {
    errors.push({ field: "lastName", message: "Last name is required", code: "VALIDATION_LASTNAME_REQUIRED" });
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    errors.push({ field: "email", message: "Valid email address is required", code: "VALIDATION_EMAIL_INVALID" });
  }

  if (!tshirtSize || !VALID_TSHIRT_SIZES.includes(tshirtSize as TshirtSize)) {
    errors.push({ field: "tshirtSize", message: "Valid t-shirt size is required", code: "VALIDATION_TSHIRT_INVALID" });
  }

  if (!language || !VALID_LANGUAGES.includes(language as Language)) {
    errors.push({ field: "language", message: "Valid language is required", code: "VALIDATION_LANGUAGE_INVALID" });
  }

  if (!country || typeof country !== "string" || !country.trim()) {
    errors.push({ field: "country", message: "Country is required", code: "VALIDATION_COUNTRY_REQUIRED" });
  }

  if (!tierId || !VALID_TIER_IDS.includes(tierId as TierId)) {
    errors.push({ field: "tierId", message: "Valid tier is required", code: "VALIDATION_TIER_INVALID" });
  }

  if (gdprConsent !== "true") {
    errors.push({ field: "gdprConsent", message: "GDPR consent is required to register", code: "VALIDATION_GDPR_REQUIRED" });
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

  const regData: RegisterRequest = {
    firstName: firstName!.trim(),
    lastName: lastName!.trim(),
    email: email!.trim().toLowerCase(),
    phone: phone?.trim() || undefined,
    tshirtSize: tshirtSize as TshirtSize,
    language: language as Language,
    country: country!.trim(),
    tierId: tierId as TierId,
    participationType: "runner",
    gdprConsent: true,
    commsOptin: commsOptin === "true",
  };

  const { participantId, paymentToken } = await sheetsService.appendRegistration(
    regData,
    slug,
  );

  const tier = TIER_DATA[tierId as TierId];
  const fullName = `${regData.firstName} ${regData.lastName}`.trim();

  const response: FundraiserRegisterResponse = {
    fundraiser: {
      slug,
      editToken,
      displayName: displayName!.trim(),
      photoUrl: photoFileId ? driveService.getPhotoUrl(photoFileId) : null,
    },
    registration: {
      participantId,
      fullName,
      firstName: regData.firstName,
      lastName: regData.lastName,
      tierId: tierId as TierId,
      tierName: tier.name,
      amountEur: tier.price,
      rewards: tier.rewards,
      paymentToken,
    },
  };

  sendFundraiserEmail(
    {
      name: fullName,
      email: email!.trim().toLowerCase(),
      participantId,
      tierName: tier.name,
      amountEur: tier.price,
      rewards: tier.rewards,
      donationUrl: `${config.corsOrigins[0] ?? "https://european-resolve.org"}/events/2026-run-for-ukraine/register?token=${paymentToken}`,
      slug,
      editToken,
      displayName: displayName!.trim(),
      fundraiserGoalEur: goalEur,
      siteUrl: config.corsOrigins[0] ?? "https://european-resolve.org",
    },
    language as Language,
  ).catch((err) => console.error("[email] Failed to send fundraiser confirmation:", err));

  return c.json({ success: true, data: response } satisfies ApiResponse<FundraiserRegisterResponse>, 201);
});
