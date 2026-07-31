import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config.js";
import { healthRoute } from "./routes/health.js";
import { confirmPaymentRoute } from "./routes/confirm-payment.js";
import { registerRoute } from "./routes/register.js";
import { fundraiserRoute } from "./routes/fundraiser.js";
import { progressRoute } from "./routes/progress.js";
import { donorsRoute } from "./routes/donors.js";
import { galleryRoute } from "./routes/gallery.js";
import { lookupRoute } from "./routes/lookup.js";
import { errorHandler } from "./middleware/error.js";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: (origin) => (config.corsOrigins.includes(origin) ? origin : ""),
    allowMethods: ["POST", "GET", "PUT", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  }),
);

app.route("/health", healthRoute);
app.route("/api/register/confirm-payment", confirmPaymentRoute);
app.route("/api/register/by-token", lookupRoute);
app.route("/api/register", registerRoute);
app.route("/api/fundraiser", fundraiserRoute);
app.route("/api/progress", progressRoute);
app.route("/api/donors", donorsRoute);
app.route("/api/gallery", galleryRoute);

app.onError(errorHandler);

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
