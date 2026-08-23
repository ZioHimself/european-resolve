import { describe, expect, it, vi } from "vitest";
import { Hono } from "hono";

vi.mock("../config.js", () => ({
  config: { eventStatus: "completed" },
}));

import { recordDonationRoute } from "./record-donation.js";

const app = new Hono();
app.route("/", recordDonationRoute);

describe("record-donation route closure", () => {
  it("blocks POST /:slug when event is completed", async () => {
    const res = await app.request("/test-slug", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 25 }),
    });

    expect(res.status).toBe(403);
    const body = (await res.json()) as {
      success: false;
      errors: Array<{ code?: string }>;
    };
    expect(body.errors[0]?.code).toBe("REGISTRATION_CLOSED");
  });
});
