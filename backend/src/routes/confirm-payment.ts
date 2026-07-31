import { Hono } from "hono";
import { SheetsService } from "../services/sheets.js";
import { sendPaymentConfirmationEmail } from "../services/email.js";
import type {
  ConfirmPaymentResponse,
  ApiResponse,
  Language,
} from "../types.js";

export const confirmPaymentRoute = new Hono();

const sheetsService = new SheetsService();

confirmPaymentRoute.post("/", async (c) => {
  const body = (await c.req.json()) as Record<string, unknown>;

  if (!body.token || typeof body.token !== "string" || !body.token.trim()) {
    return c.json(
      {
        success: false,
        errors: [{ field: "token", message: "Confirmation code is required" }],
      } satisfies ApiResponse<never>,
      400,
    );
  }

  const token = (body.token as string).trim();
  const amount =
    typeof body.amount === "number" && body.amount > 0
      ? body.amount
      : undefined;
  const result = await sheetsService.confirmPayment(token, amount);

  if (!result.success) {
    const errorMessages: Record<string, string> = {
      invalid_token: "Invalid or expired confirmation code",
      already_confirmed: "Payment already confirmed",
    };

    return c.json(
      {
        success: false,
        errors: [
          {
            field: "token",
            message: errorMessages[result.error] ?? "Unknown error",
          },
        ],
      } satisfies ApiResponse<never>,
      400,
    );
  }

  const response: ConfirmPaymentResponse = {
    confirmed: true,
    participantId: result.participantId,
    tierName: result.tierName,
    amountEur: result.amountEur,
    effectiveTierId: result.effectiveTierId,
    effectiveTierName: result.effectiveTierName,
    rewards: result.rewards,
  };

  sendPaymentConfirmationEmail(
    {
      name: result.fullName,
      email: result.email,
      participantId: result.participantId,
      tierName: result.effectiveTierName,
      amountEur: result.amountEur,
      rewards: result.rewards,
    },
    result.language as Language,
  ).catch((err) => console.error("[email] Failed to send payment confirmation:", err));

  return c.json({
    success: true,
    data: response,
  } satisfies ApiResponse<ConfirmPaymentResponse>);
});
