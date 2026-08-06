import { Hono } from "hono";
import { SheetsService } from "../services/sheets.js";
import { sendConfirmationEmail } from "../services/email.js";
import { config } from "../config.js";
import { TIER_DATA, getLocalizedRewards } from "../tiers.js";
import type {
  RegisterRequest,
  RegisterResponse,
  ValidationError,
  ApiResponse,
  TierId,
  TshirtSize,
  SocksSize,
  Language,
  ParticipationType,
} from "../types.js";

const VALID_TIER_IDS: TierId[] = ["supporter", "sprinter", "relay-runner", "marathoner", "ultramarathoner"];
const VALID_TSHIRT_SIZES: TshirtSize[] = ["S", "M", "L", "XL"];
const VALID_SOCKS_SIZES: SocksSize[] = ["36-39", "40-42", "43-46"];
const VALID_LANGUAGES: Language[] = ["English", "French", "Ukrainian", "Dutch", "German"];
const VALID_PARTICIPATION_TYPES: ParticipationType[] = ["runner", "supporter"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body.firstName || typeof body.firstName !== "string" || !body.firstName.trim()) {
    errors.push({ field: "firstName", message: "First name is required", code: "VALIDATION_FIRSTNAME_REQUIRED" });
  }

  if (!body.lastName || typeof body.lastName !== "string" || !body.lastName.trim()) {
    errors.push({ field: "lastName", message: "Last name is required", code: "VALIDATION_LASTNAME_REQUIRED" });
  }

  if (!body.email || typeof body.email !== "string" || !EMAIL_REGEX.test(body.email)) {
    errors.push({ field: "email", message: "Valid email address is required", code: "VALIDATION_EMAIL_INVALID" });
  }

  if (
    !body.participationType ||
    !VALID_PARTICIPATION_TYPES.includes(body.participationType as ParticipationType)
  ) {
    errors.push({ field: "participationType", message: "Participation type is required", code: "VALIDATION_PARTICIPATION_TYPE_REQUIRED" });
  }

  const tierId = body.tierId as TierId;

  if (tierId === "marathoner") {
    if (
      !body.tshirtSize ||
      !VALID_TSHIRT_SIZES.includes(body.tshirtSize as TshirtSize)
    ) {
      errors.push({ field: "tshirtSize", message: "Valid t-shirt size is required", code: "VALIDATION_TSHIRT_INVALID" });
    }
  }

  if (tierId === "relay-runner") {
    if (
      !body.socksSize ||
      !VALID_SOCKS_SIZES.includes(body.socksSize as SocksSize)
    ) {
      errors.push({ field: "socksSize", message: "Valid socks size is required", code: "VALIDATION_SOCKS_INVALID" });
    }
  }

  if (
    !body.language ||
    !VALID_LANGUAGES.includes(body.language as Language)
  ) {
    errors.push({ field: "language", message: "Valid language is required", code: "VALIDATION_LANGUAGE_INVALID" });
  }

  if (!body.tierId || !VALID_TIER_IDS.includes(body.tierId as TierId)) {
    errors.push({ field: "tierId", message: "Valid tier is required", code: "VALIDATION_TIER_INVALID" });
  }

  if (body.gdprConsent !== true) {
    errors.push({
      field: "gdprConsent",
      message: "GDPR consent is required to register",
      code: "VALIDATION_GDPR_REQUIRED",
    });
  }

  return errors;
}

export const registerRoute = new Hono();

const sheetsService = new SheetsService();

registerRoute.post("/", async (c) => {
  const body = (await c.req.json()) as Record<string, unknown>;

  const errors = validate(body);
  if (errors.length > 0) {
    return c.json({ success: false, errors } satisfies ApiResponse<never>, 400);
  }

  const data = body as unknown as RegisterRequest;

  // Every submission is a fresh append — no read, no dedup check. If someone
  // resubmits (e.g. picks a different tier before paying), the earlier
  // pending row is simply abandoned; payment reconciliation is what decides
  // which attempt actually counts (see confirmPayment).
  const { participantId, paymentToken } = await sheetsService.appendRegistration(data);
  const tier = TIER_DATA[data.tierId];
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const rewards = getLocalizedRewards(data.tierId, data.language);

  const response: RegisterResponse = {
    participantId,
    fullName,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    tierId: data.tierId,
    tierName: tier.name,
    participationType: data.participationType,
    amountEur: tier.price,
    rewards,
    paymentToken,
  };

  sendConfirmationEmail(
    {
      name: data.firstName,
      email: data.email,
      participantId,
      tierName: tier.name,
      amountEur: tier.price,
      rewards,
      donationUrl: `${config.corsOrigins[0] ?? "https://european-resolve.org"}/events/2026-run-for-ukraine/register?token=${paymentToken}`,
    },
    data.language,
  ).catch((err) => console.error("[email] Failed to send confirmation:", err));

  return c.json({ success: true, data: response } satisfies ApiResponse<RegisterResponse>);
});
