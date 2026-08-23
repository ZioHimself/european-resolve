import type { Context } from "hono";
import { config } from "../config.js";
import type { ApiResponse } from "../types.js";

export function isEventCompleted(): boolean {
  return config.eventStatus === "completed";
}

export function registrationClosedResponse(c: Context) {
  return c.json(
    {
      success: false,
      errors: [
        {
          field: "_global",
          message: "Registration is closed",
          code: "REGISTRATION_CLOSED",
        },
      ],
    } satisfies ApiResponse<never>,
    403,
  );
}
