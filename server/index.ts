import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getEmails,
  getEmailById,
  sendEmail,
  markAsRead,
  archiveEmail,
  getAISuggestion,
  getIntegrationStatus,
  connectIntegration
} from "./routes/emails";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Email API routes
  app.get("/api/emails", getEmails);
  app.get("/api/emails/:id", getEmailById);
  app.post("/api/emails/send", sendEmail);
  app.patch("/api/emails/:id/read", markAsRead);
  app.patch("/api/emails/:id/archive", archiveEmail);
  app.post("/api/ai/suggest", getAISuggestion);

  // Integration routes
  app.get("/api/integrations", getIntegrationStatus);
  app.post("/api/integrations/connect", connectIntegration);

  return app;
}
