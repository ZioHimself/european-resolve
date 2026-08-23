import { describe, expect, it, vi } from "vitest";
import { Hono } from "hono";

vi.mock("../config.js", () => ({
  config: {
    eventStatus: "completed",
    driveOAuth: { clientId: "", clientSecret: "", refreshToken: "" },
  },
}));

vi.mock("../services/sheets.js", () => ({
  SheetsService: class {
    createFundraiser = vi.fn();
    getFundraiser = vi.fn();
    updateFundraiser = vi.fn();
  },
}));

vi.mock("../services/drive.js", () => ({
  DriveService: class {
    uploadPhoto = vi.fn();
    getPhotoUrl = vi.fn();
  },
}));

import { fundraiserRoute } from "./fundraiser.js";

const app = new Hono();
app.route("/", fundraiserRoute);

async function expectRegistrationClosed(res: Response) {
  expect(res.status).toBe(403);
  const body = (await res.json()) as {
    success: false;
    errors: Array<{ code?: string }>;
  };
  expect(body.errors[0]?.code).toBe("REGISTRATION_CLOSED");
}

describe("fundraiser route closure", () => {
  it("blocks POST / when event is completed", async () => {
    const form = new FormData();
    form.append("displayName", "Test User");
    form.append("message", "Hello from the fundraiser");
    form.append("goalEur", "100");

    const res = await app.request("/", { method: "POST", body: form });
    await expectRegistrationClosed(res);
  });

  it("blocks PUT /:slug when event is completed", async () => {
    const res = await app.request("/test-slug", {
      method: "PUT",
      body: new FormData(),
    });
    await expectRegistrationClosed(res);
  });

  it("blocks POST /register when event is completed", async () => {
    const form = new FormData();
    form.append("displayName", "Test User");
    form.append("message", "Hello from the fundraiser");
    form.append("goalEur", "100");

    const res = await app.request("/register", { method: "POST", body: form });
    await expectRegistrationClosed(res);
  });
});
