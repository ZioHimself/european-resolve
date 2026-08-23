import { describe, expect, it, vi } from "vitest";
import { Hono } from "hono";

const mockConfig = vi.hoisted(() => ({
  eventStatus: "active" as "active" | "completed",
}));

vi.mock("../config.js", () => ({
  config: mockConfig,
}));

import { isEventCompleted, registrationClosedResponse } from "./eventClosure.js";

describe("isEventCompleted", () => {
  it("returns true when eventStatus is completed", () => {
    mockConfig.eventStatus = "completed";
    expect(isEventCompleted()).toBe(true);
  });

  it("returns false when eventStatus is active", () => {
    mockConfig.eventStatus = "active";
    expect(isEventCompleted()).toBe(false);
  });
});

describe("registrationClosedResponse", () => {
  it("returns HTTP 403 with REGISTRATION_CLOSED code", async () => {
    mockConfig.eventStatus = "completed";
    const app = new Hono();
    app.get("/test", (c) => registrationClosedResponse(c));

    const res = await app.request("/test");
    expect(res.status).toBe(403);

    const body = (await res.json()) as {
      success: false;
      errors: Array<{ field: string; message: string; code?: string }>;
    };
    expect(body.success).toBe(false);
    expect(body.errors[0]).toEqual({
      field: "_global",
      message: "Registration is closed",
      code: "REGISTRATION_CLOSED",
    });
  });
});
