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
  syncIntegration,
  checkWhatsAppStatus,
  initiateWhatsAppConnection,
} from "./routes/integrations";
import {
  categorizeEmail,
  bulkCategorizeEmails,
  getCategoryRules,
  updateCategoryRule,
  createCategoryRule,
  deleteCategoryRule,
  processEmailBatch,
} from "./routes/ai-categorization";
import {
  initiateOutlookOAuth,
  handleOutlookCallback,
  initiateGmailOAuth,
  handleGmailCallback,
  syncOutlookEmails,
  syncGmailEmails,
  getEmailProviderStatus,
} from "./routes/email-providers";
import { updateSyncSettings, getSyncSettings } from "./routes/sync-settings";
import {
  getConversationMessages,
  sendMessage as sendConversationMessage,
  markAsRead as markMessageAsRead,
} from "./routes/messages";

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
  app.patch(
    "/api/integrations/slack/:workspaceId/channels/:channelId",
    updateSlackChannel,
  );

  // Telegram integration routes
  app.get("/api/integrations/telegram/auth", (req, res) => {
    res
      .status(501)
      .json({ error: "Telegram OAuth not implemented, use bot token instead" });
  });
  app.post("/api/integrations/telegram/connect", connectTelegramBot);

  // Instagram integration routes
  app.get("/api/integrations/instagram/auth", initiateInstagramOAuth);
  app.post("/api/integrations/instagram/callback", handleInstagramCallback);

  // Facebook integration routes
  app.get("/api/integrations/facebook/auth", initiateFacebookOAuth);
  app.post("/api/integrations/facebook/callback", handleFacebookCallback);

  // WhatsApp integration routes
  app.get("/api/integrations/whatsapp/auth", initiateWhatsAppConnection);
  app.post("/api/integrations/whatsapp/status", checkWhatsAppStatus);

  // Generic integration management
  app.delete("/api/integrations/:platform/:id", disconnectIntegration);
  app.post("/api/integrations/:platform/:id/sync", syncIntegration);

  // AI categorization routes
  app.post("/api/ai/categorize", categorizeEmail);
  app.post("/api/ai/categorize/bulk", bulkCategorizeEmails);
  app.post("/api/ai/process-batch", processEmailBatch);
  app.get("/api/ai/rules", getCategoryRules);
  app.post("/api/ai/rules", createCategoryRule);
  app.patch("/api/ai/rules/:ruleId", updateCategoryRule);
  app.delete("/api/ai/rules/:ruleId", deleteCategoryRule);

  // Email provider routes (Outlook, Gmail, WhatsApp)
  app.get("/api/email-providers", getEmailProviderStatus);
  app.get("/api/email-providers/outlook/auth", initiateOutlookOAuth);
  app.post("/api/email-providers/outlook/callback", handleOutlookCallback);
  app.post("/api/email-providers/outlook/sync", syncOutlookEmails);
  app.get("/api/email-providers/gmail/auth", initiateGmailOAuth);
  app.post("/api/email-providers/gmail/callback", handleGmailCallback);
  app.post("/api/email-providers/gmail/sync", syncGmailEmails);

  // Sync settings routes
  app.get("/api/settings/sync", getSyncSettings);
  app.post("/api/settings/sync", updateSyncSettings);

  // Conversation message routes
  app.get("/api/messages/:messageId/conversation", getConversationMessages);
  app.post("/api/messages/:messageId/send", sendConversationMessage);
  app.post("/api/messages/:messageId/read", markMessageAsRead);

  return app;
}
