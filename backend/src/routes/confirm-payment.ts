import { Hono } from "hono";
import { SheetsService } from "../services/sheets.js";
import { sendPaymentConfirmationEmail } from "../services/email.js";
import { redactEmail, regFlowLog, tokenHint } from "../lib/registrationFlowLog.js";
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
    regFlowLog.confirmPaymentWarn("request rejected — missing token");
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
  const email =
    typeof body.email === "string" && body.email.trim()
      ? body.email.trim()
      : undefined;
  const firstName =
    typeof body.firstName === "string" && body.firstName.trim()
      ? body.firstName.trim()
      : undefined;
  const lastName =
    typeof body.lastName === "string" && body.lastName.trim()
      ? body.lastName.trim()
      : undefined;

  regFlowLog.confirmPayment("request received", {
    paymentToken: tokenHint(token),
    amount,
    email: email ? redactEmail(email) : undefined,
    hasFirstName: Boolean(firstName),
    hasLastName: Boolean(lastName),
  });

  const result = await sheetsService.confirmPayment(token, amount, email, firstName, lastName);

  if (!result.success) {
    regFlowLog.confirmPaymentWarn("payment not confirmed", {
      paymentToken: tokenHint(token),
      error: result.error,
    });

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
    rewards: result.rewards,
  };

  regFlowLog.confirmPayment("payment confirmed", {
    participantId: result.participantId,
    paymentToken: tokenHint(token),
    tierName: result.tierName,
    amountEur: result.amountEur,
    rewardCount: result.rewards.length,
    email: redactEmail(result.email),
  });

  // Don't send a receipt claiming a specific amount when we don't actually
  // know what was paid — the registration is still marked paid and gets
  // reconciled manually instead.
  if (result.amountEur != null) {
    sendPaymentConfirmationEmail(
      {
        name: result.firstName,
        email: result.email,
        participantId: result.participantId,
        tierName: result.tierName,
        amountEur: result.amountEur,
        rewards: result.rewards,
      },
      result.language as Language,
    ).catch((err) => console.error("[email] Failed to send payment confirmation:", err));
  } else {
    regFlowLog.confirmPaymentWarn("skipping payment confirmation email — amount unknown", {
      participantId: result.participantId,
    });
  }

  return c.json({
    success: true,
    data: response,
  } satisfies ApiResponse<ConfirmPaymentResponse>);
});
