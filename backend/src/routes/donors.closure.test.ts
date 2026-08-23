import { describe, expect, it, vi } from "vitest";
import { Hono } from "hono";

vi.mock("../config.js", () => ({
  config: { eventStatus: "completed" },
}));

import { donorsRoute } from "./donors.js";

const app = new Hono();
app.route("/", donorsRoute);

describe("donors route closure", () => {
  it("blocks POST / when event is completed", async () => {
    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fundraiserSlug: "test-slug",
        donorName: "Jane Donor",
        message: "Great work on the run!",
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
