import { describe, expect, it, vi } from "vitest";
import { Hono } from "hono";

vi.mock("../config.js", () => ({
  config: { eventStatus: "completed" },
}));

import { registerRoute } from "./register.js";

const app = new Hono();
app.route("/", registerRoute);

describe("register route closure", () => {
  it("blocks POST / when event is completed", async () => {
    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        participationType: "runner",
        tierId: "supporter",
        language: "English",
        gdprConsent: true,
      }),
    });

    expect(res.status).toBe(403);
    const body = (await res.json()) as {
      success: false;
      errors: Array<{ code?: string }>;
    };
    expect(body.errors[0]?.code).toBe("REGISTRATION_CLOSED");
  });
});
