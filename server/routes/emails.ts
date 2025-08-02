import { RequestHandler } from "express";
import { getEmails as getMockEmails, type Email } from "../../shared/data/mockData";

export interface EmailsResponse {
  emails: Email[];
  total: number;
  unread: number;
}

export interface ComposeEmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  content: string;
  priority?: "low" | "normal" | "high";
  scheduledSend?: string;
}

export interface AIResponse {
  suggestion: string;
  type: "reply" | "summary" | "action";
  confidence: number;
}

export const getEmails: RequestHandler = (req, res) => {
  const { category, page = 1, limit = 50, search } = req.query;

  let filteredEmails = getMockEmails();

  if (category && category !== "Inbox") {
    filteredEmails = getMockEmails().filter((email) => email.category === category);
  }

  if (search) {
    const searchTerm = (search as string).toLowerCase();
    filteredEmails = filteredEmails.filter(
      (email) =>
        email.subject.toLowerCase().includes(searchTerm) ||
        email.sender.toLowerCase().includes(searchTerm) ||
        email.content.toLowerCase().includes(searchTerm),
    );
  }

  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedEmails = filteredEmails.slice(startIndex, endIndex);

  const response: EmailsResponse = {
    emails: paginatedEmails,
    total: filteredEmails.length,
    unread: filteredEmails.filter((email) => email.unread).length,
  };

  res.json(response);
};

export const getEmailById: RequestHandler = (req, res) => {
  const { id } = req.params;
  const email = getMockEmails().find((e) => e.id === id);

  if (!email) {
    return res.status(404).json({ error: "Email not found" });
  }

  res.json(email);
};

export const sendEmail: RequestHandler = (req, res) => {
  const emailData: ComposeEmailRequest = req.body;

  // In a real app, this would integrate with email service providers
  // like Gmail API, Outlook API, SendGrid, etc.

  const newEmail: Email = {
    id: Date.now().toString(),
    sender: "You",
    email: "you@example.com",
    subject: emailData.subject,
    content: emailData.content,
    preview: emailData.content.substring(0, 100) + "...",
    time: "Just now",
    unread: false,
    important: emailData.priority === "high",
    category: "Sent",
    categoryColor: "bg-green-500",
    avatar: "YOU",
  };

  res.json({
    success: true,
    messageId: newEmail.id,
    message: "Email sent successfully",
  });
};

export const markAsRead: RequestHandler = (req, res) => {
  const { id } = req.params;
  const email = getMockEmails().find((e) => e.id === id);

  if (!email) {
    return res.status(404).json({ error: "Email not found" });
  }

  email.unread = false;
  res.json({ success: true });
};

export const archiveEmail: RequestHandler = (req, res) => {
  const { id } = req.params;
  const email = getMockEmails().find((e) => e.id === id);

  if (!email) {
    return res.status(404).json({ error: "Email not found" });
  }

  email.category = "Archive";
  res.json({ success: true });
};

export const getAISuggestion: RequestHandler = (req, res) => {
  const { emailId, type } = req.body;

  // Mock AI responses - in production this would call your AI service
  const suggestions: Record<string, AIResponse> = {
    reply: {
      suggestion:
        "Thank you for reaching out. I'll review the budget proposal and get back to you by Thursday with my feedback.",
      type: "reply",
      confidence: 0.95,
    },
    summary: {
      suggestion:
        "Sarah is requesting a Q4 budget review meeting for next week to discuss revenue projections, spending allocations, new project funding, and cost optimization.",
      type: "summary",
      confidence: 0.92,
    },
    action: {
      suggestion:
        "Schedule a meeting with the team for Tuesday, Wednesday, or Thursday afternoon to review Q4 budget planning.",
      type: "action",
      confidence: 0.88,
    },
  };

  const response = suggestions[type as string] || suggestions.reply;
  res.json(response);
};

// Integration endpoints for chat platforms
export const getIntegrationStatus: RequestHandler = (req, res) => {
  const integrations = {
    slack: { connected: false, channels: 0 },
    telegram: { connected: false, chats: 0 },
    instagram: { connected: false, conversations: 0 },
    facebook: { connected: false, pages: 0 },
  };

  res.json(integrations);
};

export const connectIntegration: RequestHandler = (req, res) => {
  const { platform, token } = req.body;

  // In production, this would handle OAuth flows and API connections
  res.json({
    success: true,
    message: `${platform} integration connected successfully`,
  });
};
