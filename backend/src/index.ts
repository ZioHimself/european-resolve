import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config.js";
import { healthRoute } from "./routes/health.js";
import { registerRoute } from "./routes/register.js";
import { errorHandler } from "./middleware/error.js";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: (origin) => (config.corsOrigins.includes(origin) ? origin : ""),
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 600,
  }),
);

app.route("/health", healthRoute);
app.route("/api/register", registerRoute);

app.onError(errorHandler);

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
