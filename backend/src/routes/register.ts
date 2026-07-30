import { Hono } from "hono";
import { SheetsService } from "../services/sheets.js";
import { sendConfirmationEmail } from "../services/email.js";
import { config } from "../config.js";
import type {
  RegisterRequest,
  RegisterResponse,
  ValidationError,
  ApiResponse,
  TierId,
  TshirtSize,
  Language,
  ParticipationType,
} from "../types.js";

const VALID_TIER_IDS: TierId[] = ["supporter", "champion", "patron"];
const VALID_TSHIRT_SIZES: TshirtSize[] = ["XS", "S", "M", "L", "XL", "XXL"];
const VALID_LANGUAGES: Language[] = ["English", "French", "Ukrainian", "Dutch", "German"];
const VALID_PARTICIPATION_TYPES: ParticipationType[] = ["runner", "supporter"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RUNNER_ONLY_REWARDS = new Set([
  "Race bib",
  "Finisher medal",
  "Technical race t-shirt",
  "Finisher pack",
  "Reserved starting corral",
  "Post-race reception invite",
  "Embroidered finisher hoodie",
]);

const TIER_DATA: Record<TierId, { name: string; price: number; rewards: string[] }> = {
  supporter: {
    name: "Supporter",
    price: 10,
    rewards: ["Race bib", "Finisher medal", "Digital certificate", "Hurkit keychain"],
  },
  champion: {
    name: "Champion",
    price: 35,
    rewards: [
      "Race bib",
      "Finisher medal",
      "Digital certificate",
      "Technical race t-shirt",
      "Finisher pack",
      "Name on digital wall",
      "Hurkit military branch coin",
      "Hurkit branded sports socks",
    ],
  },
  patron: {
    name: "Patron",
    price: 95,
    rewards: [
      "Race bib",
      "Finisher medal",
      "Digital certificate",
      "Technical race t-shirt",
      "Finisher pack",
      "Name on digital wall",
      "Embroidered finisher hoodie",
      "Reserved starting corral",
      "Post-race reception invite",
      "Hurkit silk scarf",
    ],
  },
};

function validate(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body.fullName || typeof body.fullName !== "string" || !body.fullName.trim()) {
    errors.push({ field: "fullName", message: "Full name is required", code: "VALIDATION_FULLNAME_REQUIRED" });
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

  const isRunner = body.participationType === "runner";

  if (isRunner) {
    if (
      !body.tshirtSize ||
      !VALID_TSHIRT_SIZES.includes(body.tshirtSize as TshirtSize)
    ) {
      errors.push({ field: "tshirtSize", message: "Valid t-shirt size is required", code: "VALIDATION_TSHIRT_INVALID" });
    }
  }

  if (
    !body.language ||
    !VALID_LANGUAGES.includes(body.language as Language)
  ) {
    errors.push({ field: "language", message: "Valid language is required", code: "VALIDATION_LANGUAGE_INVALID" });
  }

  if (!body.country || typeof body.country !== "string" || !body.country.trim()) {
    errors.push({ field: "country", message: "Country is required", code: "VALIDATION_COUNTRY_REQUIRED" });
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

function filterRewards(rewards: string[], participationType: ParticipationType): string[] {
  if (participationType === "runner") return rewards;
  return rewards.filter((r) => !RUNNER_ONLY_REWARDS.has(r));
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

  const existing = await sheetsService.findByEmail(data.email);
  if (existing) {
    const tier = TIER_DATA[existing.tierId as TierId] ?? TIER_DATA.supporter;
    const participationType = (existing.participationType || "runner") as ParticipationType;
    const response: RegisterResponse = {
      participantId: existing.participantId,
      fullName: existing.fullName,
      tierId: existing.tierId as TierId,
      tierName: tier.name,
      participationType,
      amountEur: existing.amountEur,
      rewards: filterRewards(tier.rewards, participationType),
      paymentToken: existing.paymentToken,
    };
    return c.json({ success: true, data: response } satisfies ApiResponse<RegisterResponse>);
  }

  const { participantId, paymentToken } = await sheetsService.appendRegistration(data);
  const tier = TIER_DATA[data.tierId];

  const response: RegisterResponse = {
    participantId,
    fullName: data.fullName,
    tierId: data.tierId,
    tierName: tier.name,
    participationType: data.participationType,
    amountEur: tier.price,
    rewards: filterRewards(tier.rewards, data.participationType),
    paymentToken,
  };

  sendConfirmationEmail(
    {
      name: data.fullName,
      email: data.email,
      participantId,
      tierName: tier.name,
      amountEur: tier.price,
      rewards: filterRewards(tier.rewards, data.participationType),
      donationUrl: config.donationUrl,
    },
    data.language,
  ).catch((err) => console.error("[email] Failed to send confirmation:", err));

  return c.json({ success: true, data: response } satisfies ApiResponse<RegisterResponse>);
});
