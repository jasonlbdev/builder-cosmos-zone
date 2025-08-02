import { RequestHandler } from "express";

export interface Email {
  id: string;
  sender: string;
  email: string;
  subject: string;
  content: string;
  preview: string;
  time: string;
  unread: boolean;
  important: boolean;
  category: string;
  categoryColor: string;
  avatar: string;
  labels?: string[];
}

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
  priority?: 'low' | 'normal' | 'high';
  scheduledSend?: string;
}

export interface AIResponse {
  suggestion: string;
  type: 'reply' | 'summary' | 'action';
  confidence: number;
}

// Mock data for development
const mockEmails: Email[] = [
  {
    id: "1",
    sender: "Sarah Johnson",
    email: "sarah@company.com",
    subject: "Q4 Budget Review Meeting",
    content: "Hi team, I wanted to schedule a review meeting for our Q4 budget planning...",
    preview: "Hi team, I wanted to schedule a review meeting for our Q4 budget planning. Can we...",
    time: "2m ago",
    unread: true,
    important: true,
    category: "To Respond",
    categoryColor: "bg-red-500",
    avatar: "SJ",
    labels: ["work", "budget", "meeting"]
  },
  {
    id: "2",
    sender: "Marcus Chen",
    email: "marcus@designco.com",
    subject: "New Design System Updates",
    content: "The latest updates to our design system are now available...",
    preview: "The latest updates to our design system are now available. Please review the new...",
    time: "15m ago",
    unread: true,
    important: false,
    category: "FYI",
    categoryColor: "bg-blue-500",
    avatar: "MC",
    labels: ["design", "updates"]
  }
];

export const getEmails: RequestHandler = (req, res) => {
  const { category, page = 1, limit = 50, search } = req.query;
  
  let filteredEmails = mockEmails;
  
  if (category && category !== 'Inbox') {
    filteredEmails = mockEmails.filter(email => email.category === category);
  }
  
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    filteredEmails = filteredEmails.filter(email => 
      email.subject.toLowerCase().includes(searchTerm) ||
      email.sender.toLowerCase().includes(searchTerm) ||
      email.content.toLowerCase().includes(searchTerm)
    );
  }
  
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedEmails = filteredEmails.slice(startIndex, endIndex);
  
  const response: EmailsResponse = {
    emails: paginatedEmails,
    total: filteredEmails.length,
    unread: filteredEmails.filter(email => email.unread).length
  };
  
  res.json(response);
};

export const getEmailById: RequestHandler = (req, res) => {
  const { id } = req.params;
  const email = mockEmails.find(e => e.id === id);
  
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
    important: emailData.priority === 'high',
    category: "Sent",
    categoryColor: "bg-green-500",
    avatar: "YOU"
  };
  
  res.json({ 
    success: true, 
    messageId: newEmail.id,
    message: "Email sent successfully" 
  });
};

export const markAsRead: RequestHandler = (req, res) => {
  const { id } = req.params;
  const email = mockEmails.find(e => e.id === id);
  
  if (!email) {
    return res.status(404).json({ error: "Email not found" });
  }
  
  email.unread = false;
  res.json({ success: true });
};

export const archiveEmail: RequestHandler = (req, res) => {
  const { id } = req.params;
  const email = mockEmails.find(e => e.id === id);
  
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
      suggestion: "Thank you for reaching out. I'll review the budget proposal and get back to you by Thursday with my feedback.",
      type: "reply",
      confidence: 0.95
    },
    summary: {
      suggestion: "Sarah is requesting a Q4 budget review meeting for next week to discuss revenue projections, spending allocations, new project funding, and cost optimization.",
      type: "summary",
      confidence: 0.92
    },
    action: {
      suggestion: "Schedule a meeting with the team for Tuesday, Wednesday, or Thursday afternoon to review Q4 budget planning.",
      type: "action",
      confidence: 0.88
    }
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
    facebook: { connected: false, pages: 0 }
  };
  
  res.json(integrations);
};

export const connectIntegration: RequestHandler = (req, res) => {
  const { platform, token } = req.body;
  
  // In production, this would handle OAuth flows and API connections
  res.json({ 
    success: true, 
    message: `${platform} integration connected successfully` 
  });
};
