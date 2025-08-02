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

// Mock data for development - comprehensive email set
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
  },
  {
    id: "3",
    sender: "LinkedIn",
    email: "notifications@linkedin.com",
    subject: "Your weekly summary is ready",
    content: "See who viewed your profile this week and discover new connections...",
    preview: "See who viewed your profile this week and discover new connections in your industry...",
    time: "1h ago",
    unread: false,
    important: false,
    category: "Marketing",
    categoryColor: "bg-purple-500",
    avatar: "LI",
    labels: ["social", "newsletter"]
  },
  {
    id: "4",
    sender: "Alex Rivera",
    email: "alex@startup.io",
    subject: "Collaboration Opportunity",
    content: "I came across your work and would love to discuss a potential collaboration...",
    preview: "I came across your work and would love to discuss a potential collaboration on...",
    time: "3h ago",
    unread: true,
    important: true,
    category: "Important",
    categoryColor: "bg-yellow-500",
    avatar: "AR",
    labels: ["opportunity", "collaboration"]
  },
  {
    id: "5",
    sender: "GitHub",
    email: "noreply@github.com",
    subject: "Pull request merged: feat/new-dashboard",
    content: "Your pull request has been successfully merged into the main branch...",
    preview: "Your pull request has been successfully merged into the main branch. View the changes...",
    time: "5h ago",
    unread: false,
    important: false,
    category: "Awaiting Reply",
    categoryColor: "bg-orange-500",
    avatar: "GH",
    labels: ["development", "git"]
  },
  {
    id: "6",
    sender: "Amazon",
    email: "shipment-tracking@amazon.com",
    subject: "Your package has been delivered",
    content: "Great news! Your recent order has been delivered to your address...",
    preview: "Great news! Your recent order has been delivered to your address. You can track...",
    time: "2h ago",
    unread: true,
    important: false,
    category: "Promotions",
    categoryColor: "bg-green-500",
    avatar: "AM",
    labels: ["shopping", "delivery"]
  },
  {
    id: "7",
    sender: "Notion",
    email: "updates@notion.so",
    subject: "New features in Notion AI",
    content: "Discover the latest AI-powered features that will supercharge your productivity...",
    preview: "Discover the latest AI-powered features that will supercharge your productivity...",
    time: "4h ago",
    unread: true,
    important: false,
    category: "Updates",
    categoryColor: "bg-indigo-500",
    avatar: "NO",
    labels: ["product", "ai", "features"]
  },
  {
    id: "8",
    sender: "Jessica Wong",
    email: "jessica@company.com",
    subject: "Re: Project timeline discussion",
    content: "Thanks for the detailed breakdown. I have a few questions about the milestones...",
    preview: "Thanks for the detailed breakdown. I have a few questions about the milestones...",
    time: "6h ago",
    unread: false,
    important: false,
    category: "FYI",
    categoryColor: "bg-blue-500",
    avatar: "JW",
    labels: ["project", "timeline"]
  },
  {
    id: "9",
    sender: "Stripe",
    email: "notifications@stripe.com",
    subject: "Payment received for Invoice #1234",
    content: "We received a payment of $2,500.00 for invoice #1234. The payment has been...",
    preview: "We received a payment of $2,500.00 for invoice #1234. The payment has been...",
    time: "8h ago",
    unread: false,
    important: true,
    category: "Important",
    categoryColor: "bg-yellow-500",
    avatar: "ST",
    labels: ["payment", "invoice", "financial"]
  },
  {
    id: "10",
    sender: "Netflix",
    email: "info@netflix.com",
    subject: "New releases this week",
    content: "Check out the latest movies and TV shows added to Netflix this week...",
    preview: "Check out the latest movies and TV shows added to Netflix this week...",
    time: "1d ago",
    unread: false,
    important: false,
    category: "Marketing",
    categoryColor: "bg-purple-500",
    avatar: "NF",
    labels: ["entertainment", "newsletter"]
  },
  {
    id: "11",
    sender: "David Kim",
    email: "david@clientcompany.com",
    subject: "Urgent: Contract review needed",
    content: "Hi, we need to review the contract terms before tomorrow's meeting. Can you...",
    preview: "Hi, we need to review the contract terms before tomorrow's meeting. Can you...",
    time: "30m ago",
    unread: true,
    important: true,
    category: "To Respond",
    categoryColor: "bg-red-500",
    avatar: "DK",
    labels: ["urgent", "contract", "legal"]
  },
  {
    id: "12",
    sender: "Slack",
    email: "notifications@slack.com",
    subject: "Weekly activity summary",
    content: "Here's your team's activity summary for this week in the Development workspace...",
    preview: "Here's your team's activity summary for this week in the Development workspace...",
    time: "1d ago",
    unread: false,
    important: false,
    category: "Updates",
    categoryColor: "bg-indigo-500",
    avatar: "SL",
    labels: ["team", "productivity"]
  },
  {
    id: "13",
    sender: "Adobe",
    email: "offers@adobe.com",
    subject: "50% off Creative Cloud - Limited time",
    content: "Don't miss out on this exclusive offer for Creative Cloud subscriptions...",
    preview: "Don't miss out on this exclusive offer for Creative Cloud subscriptions...",
    time: "2d ago",
    unread: false,
    important: false,
    category: "Promotions",
    categoryColor: "bg-green-500",
    avatar: "AD",
    labels: ["discount", "software", "offer"]
  },
  {
    id: "14",
    sender: "Emily Chen",
    email: "emily.chen@partner.com",
    subject: "Partnership proposal follow-up",
    content: "Following up on our conversation last week about the partnership opportunity...",
    preview: "Following up on our conversation last week about the partnership opportunity...",
    time: "1d ago",
    unread: true,
    important: false,
    category: "Awaiting Reply",
    categoryColor: "bg-orange-500",
    avatar: "EC",
    labels: ["partnership", "business"]
  },
  {
    id: "15",
    sender: "Zoom",
    email: "updates@zoom.us",
    subject: "New security features available",
    content: "We've added new security features to help protect your meetings and data...",
    preview: "We've added new security features to help protect your meetings and data...",
    time: "3d ago",
    unread: false,
    important: false,
    category: "Updates",
    categoryColor: "bg-indigo-500",
    avatar: "ZO",
    labels: ["security", "features", "meetings"]
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
