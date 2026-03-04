import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import { securityRouter } from "./server/security";
import { rideRouter } from "./server/rides";
import { logisticsRouter } from "./server/logistics";
import { productRouter } from "./server/product";
import { urbontCoreRouter } from "./server/urbont_core";
import { integrationsRouter } from "./server/integrations";
import { translationRouter } from "./server/translation";
import { groqChatRouter } from "./server/groq_chat";
import { startCronJobs } from "./server/cron";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // For Twilio Webhooks

  // Security & Ride Routes
  app.use("/api/security", securityRouter);
  app.use("/api/rides", rideRouter);
  app.use("/api/logistics", logisticsRouter);
  app.use("/api/product", productRouter);
  app.use("/api/urbont", urbontCoreRouter);
  app.use("/api/integrations", integrationsRouter);
  app.use("/api/translation", translationRouter);
  app.use("/api/groq-chat", groqChatRouter);

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Start Cron Jobs
  startCronJobs();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Security protocols initialized.`);
  });
}

startServer();
