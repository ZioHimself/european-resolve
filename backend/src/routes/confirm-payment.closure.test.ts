import { describe, expect, it, vi } from "vitest";
import { Hono } from "hono";

vi.mock("../config.js", () => ({
  config: { eventStatus: "completed" },
}));

vi.mock("../services/sheets.js", () => ({
  SheetsService: class {
    confirmPayment = vi.fn().mockResolvedValue({
      success: false,
      error: "invalid_token",
    });
  },
}));

import { confirmPaymentRoute } from "./confirm-payment.js";

const app = new Hono();
app.route("/", confirmPaymentRoute);

describe("confirm-payment route closure exemption", () => {
  it("does not return REGISTRATION_CLOSED when event is completed", async () => {
    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "test-token-123" }),
    });

    const body = (await res.json()) as {
      success: false;
      errors: Array<{ code?: string; field: string }>;
    };

    const codes = body.errors.map((e) => e.code).filter(Boolean);
    expect(codes).not.toContain("REGISTRATION_CLOSED");
    expect(res.status).not.toBe(403);
  });

  it("still validates missing token when event is completed", async () => {
    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      errors: Array<{ field: string; code?: string }>;
    };
    expect(body.errors[0]?.field).toBe("token");
    expect(body.errors[0]?.code).not.toBe("REGISTRATION_CLOSED");
  });
});
