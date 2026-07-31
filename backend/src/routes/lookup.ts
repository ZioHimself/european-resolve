import { Hono } from "hono";
import { SheetsService } from "../services/sheets.js";
import { TIER_DATA, filterRewards } from "../tiers.js";
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
    email: registration.email,
    tierId: registration.tierId as TierId,
    tierName: tier.name,
    participationType: registration.participationType as ParticipationType,
    amountEur: registration.amountEur,
    rewards: filterRewards(tier.rewards, registration.participationType as ParticipationType),
    paymentToken: registration.paymentToken,
  };

  return c.json({ success: true, data: response } satisfies ApiResponse<RegisterResponse>);
});
