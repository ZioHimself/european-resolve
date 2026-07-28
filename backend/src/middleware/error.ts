import type { ErrorHandler } from "hono";
import { config } from "../config.js";

export const errorHandler: ErrorHandler = (err, c) => {
  console.error("Unhandled error:", err);

  const message =
    config.nodeEnv === "development"
      ? err.message
      : "An internal error occurred";

  return c.json(
    {
      success: false,
      errors: [{ field: "_global", message }],
    },
    500,
  );
};
