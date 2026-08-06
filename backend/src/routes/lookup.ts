import { Hono } from "hono";
import { SheetsService } from "../services/sheets.js";
import { TIER_DATA, getLocalizedRewards } from "../tiers.js";
import type {
  RegisterResponse,
  ApiResponse,
  TierId,
  ParticipationType,
} from "../types.js";

export const lookupRoute = new Hono();

const sheetsService = new SheetsService();

lookupRoute.get("/:token", async (c) => {
  const token = c.req.param("token");

  if (!token || !token.trim()) {
    return c.json(
      {
        success: false,
        errors: [{ field: "token", message: "Token is required" }],
      } satisfies ApiResponse<never>,
      400,
    );
  }

  const registration = await sheetsService.findByToken(token);

  if (!registration) {
    return c.json(
      {
        success: false,
        errors: [{ field: "token", message: "Registration not found" }],
      } satisfies ApiResponse<never>,
      404,
    );
  }

  // Already paid — return just enough for the frontend to show a plain
  // thank-you screen. Tier lookup isn't required here: a payment recorded
  // with no matching registration attempt has no tier on file at all.
  if (registration.status === "paid") {
    const response: RegisterResponse = {
      participantId: registration.participantId,
      fullName: registration.fullName,
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      tierId: registration.tierId as TierId,
      tierName: "",
      participationType: registration.participationType as ParticipationType,
      amountEur: registration.amountEur,
      rewards: [],
      paymentToken: registration.paymentToken,
      status: "paid",
    };
    return c.json({ success: true, data: response } satisfies ApiResponse<RegisterResponse>);
  }

  const tier = TIER_DATA[registration.tierId as TierId];
  if (!tier) {
    return c.json(
      {
        success: false,
        errors: [{ field: "tier", message: "Invalid tier" }],
      } satisfies ApiResponse<never>,
      500,
    );
  }

  const response: RegisterResponse = {
    participantId: registration.participantId,
    fullName: registration.fullName,
    firstName: registration.firstName,
    lastName: registration.lastName,
    email: registration.email,
    tierId: registration.tierId as TierId,
    tierName: tier.name,
    participationType: registration.participationType as ParticipationType,
    amountEur: registration.amountEur,
    rewards: getLocalizedRewards(
      registration.tierId as TierId,
      registration.participationType as ParticipationType,
      registration.language,
    ),
    paymentToken: registration.paymentToken,
    status: "pending",
  };

  return c.json({ success: true, data: response } satisfies ApiResponse<RegisterResponse>);
});
