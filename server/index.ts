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
  getAISuggestion
} from "./routes/emails";
import {
  getIntegrationStatus,
  initiateSlackOAuth,
  handleSlackCallback,
  getSlackWorkspaces,
  updateSlackChannel,
  connectTelegramBot,
  initiateInstagramOAuth,
  handleInstagramCallback,
  initiateFacebookOAuth,
  handleFacebookCallback,
  disconnectIntegration,
  syncIntegration
} from "./routes/integrations";
import {
  categorizeEmail,
  bulkCategorizeEmails,
  getCategoryRules,
  updateCategoryRule,
  createCategoryRule,
  deleteCategoryRule,
  processEmailBatch
} from "./routes/ai-categorization";

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

  // Slack integration routes
  app.get("/api/integrations/slack/auth", initiateSlackOAuth);
  app.post("/api/integrations/slack/callback", handleSlackCallback);
  app.get("/api/integrations/slack/workspaces", getSlackWorkspaces);
  app.patch("/api/integrations/slack/:workspaceId/channels/:channelId", updateSlackChannel);

  // Telegram integration routes
  app.post("/api/integrations/telegram/connect", connectTelegramBot);

  // Instagram integration routes
  app.get("/api/integrations/instagram/auth", initiateInstagramOAuth);
  app.post("/api/integrations/instagram/callback", handleInstagramCallback);

  // Facebook integration routes
  app.get("/api/integrations/facebook/auth", initiateFacebookOAuth);
  app.post("/api/integrations/facebook/callback", handleFacebookCallback);

  // Generic integration management
  app.delete("/api/integrations/:platform/:id", disconnectIntegration);
  app.post("/api/integrations/:platform/:id/sync", syncIntegration);

  return app;
}
