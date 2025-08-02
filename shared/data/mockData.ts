// Mock Data Configuration
// This file contains all mock data for development purposes
// In production, this entire file should be deleted and replaced with real API calls

export const DEV_MODE = process.env.NODE_ENV === 'development';

// Email Mock Data
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
  platform?: string;
  platformLogo?: string;
  platformColor?: string;
}

export const mockEmails: Email[] = [
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
    labels: ["work", "budget", "meeting"],
    platform: "Outlook",
    platformLogo: "📧",
    platformColor: "bg-blue-700",
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
    labels: ["design", "updates"],
    platform: "Gmail",
    platformLogo: "✉️",
    platformColor: "bg-red-500",
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
    labels: ["social", "newsletter"],
    platform: "Gmail",
    platformLogo: "✉️",
    platformColor: "bg-red-500",
  },
];

// Task Mock Data
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  assignees?: string[]; // For multiple team members
  dueDate?: Date;
  tags: string[];
  emailContext?: {
    messageId: string;
    sender: string;
    subject: string;
    platform: string;
    platformLogo: string;
  };
  followUpConfig?: {
    enabled: boolean;
    timeframe: number; // hours
    message: string;
    recipients: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Review Q4 budget proposals",
    description: "Review budget allocations, revenue projections, department spending, and new project funding requests.",
    status: "todo",
    priority: "high",
    assignee: "you@company.com",
    assignees: ["you@company.com", "sarah@company.com"],
    dueDate: new Date(2024, 11, 22),
    tags: ["finance", "quarterly"],
    emailContext: {
      messageId: "1",
      sender: "Sarah Johnson",
      subject: "Q4 Budget Review Meeting",
      platform: "Outlook",
      platformLogo: "📧",
    },
    followUpConfig: {
      enabled: true,
      timeframe: 48,
      message: "Hi, just following up on the Q4 budget review. Could you please provide an update?",
      recipients: ["sarah@company.com"]
    },
    createdAt: new Date(2024, 11, 18),
    updatedAt: new Date(2024, 11, 18),
  },
  {
    id: "2",
    title: "Prepare project timeline discussion",
    description: "Review milestones and prepare talking points for the project timeline meeting.",
    status: "in-progress",
    priority: "medium",
    assignee: "you@company.com",
    assignees: ["you@company.com", "jessica@company.com"],
    dueDate: new Date(2024, 11, 20),
    tags: ["project", "planning"],
    emailContext: {
      messageId: "8",
      sender: "Jessica Wong",
      subject: "Re: Project timeline discussion",
      platform: "Outlook",
      platformLogo: "📧",
    },
    followUpConfig: {
      enabled: true,
      timeframe: 24,
      message: "Following up on the project timeline discussion. Any updates?",
      recipients: ["jessica@company.com"]
    },
    createdAt: new Date(2024, 11, 17),
    updatedAt: new Date(2024, 11, 19),
  },
];

// Calendar Event Mock Data
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location?: string;
  type: "meeting" | "call" | "event";
  status: "confirmed" | "tentative" | "cancelled";
  emailAccount?: string; // Which email account this is synced from
  platform?: string; // Platform hosting (Outlook, Gmail, Platform-hosted)
  emailContext?: {
    messageId: string;
    sender: string;
    subject: string;
    platform: string;
  };
}

export const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Q4 Budget Review Meeting",
    description: "Review budget allocations and revenue projections for Q4",
    startTime: new Date(2024, 11, 20, 14, 0),
    endTime: new Date(2024, 11, 20, 15, 30),
    attendees: ["sarah@company.com", "john@company.com", "you@company.com"],
    location: "Conference Room A",
    type: "meeting",
    status: "confirmed",
    emailAccount: "you@company.com",
    platform: "Outlook",
    emailContext: {
      messageId: "1",
      sender: "Sarah Johnson",
      subject: "Q4 Budget Review Meeting",
      platform: "Outlook",
    },
  },
  {
    id: "2",
    title: "Project Sync Call",
    description: "Weekly project synchronization with the development team",
    startTime: new Date(2024, 11, 22, 10, 0),
    endTime: new Date(2024, 11, 22, 11, 0),
    attendees: ["dev-team@company.com", "you@company.com"],
    type: "call",
    status: "confirmed",
    emailAccount: "you@company.com",
    platform: "Platform-hosted",
  },
];

// Settings Categories Mock Data
export interface EmailCategory {
  id: string;
  name: string;
  color: string;
  description: string;
  rules: CategoryRule[];
  enabled: boolean;
}

export interface CategoryRule {
  id: string;
  type: "sender" | "subject" | "content" | "domain" | "keywords" | "toRecipients" | "ccRecipients" | "importance" | "hasAttachments" | "conversationId" | "categories" | "flag" | "messageClass";
  condition: "contains" | "equals" | "starts_with" | "ends_with" | "regex" | "is_null" | "is_not_null" | "greater_than" | "less_than";
  value: string;
  enabled: boolean;
  apiField?: string;
  description?: string;
}

export const mockEmailCategories: EmailCategory[] = [
  {
    id: "to-respond",
    name: "To Respond",
    color: "bg-red-500",
    description: "Emails requiring immediate response",
    rules: [
      {
        id: "1",
        type: "toRecipients",
        condition: "contains",
        value: "your-email@domain.com",
        enabled: true,
        apiField: "toRecipients/emailAddress/address",
        description: "Emails directly addressed to you (not CC)",
      },
    ],
    enabled: true,
  },
];

// Conversation Mock Data
export interface ConversationMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
  avatar: string;
  status?: "sent" | "delivered" | "read";
}

export const mockConversations: Record<string, ConversationMessage[]> = {
  whatsapp_6: [
    {
      id: "1",
      sender: "Amazon Support",
      content: "Hello! Your package #AMZ123456 has been shipped and is on its way.",
      time: "2h ago",
      isMe: false,
      avatar: "AS",
    },
  ],
};

// Integration Mock Data
export interface Integration {
  id: string;
  name: string;
  platform: string;
  connected: boolean;
  status: "connected" | "disconnected" | "error";
  lastSync?: Date;
  account?: string;
}

export const mockIntegrations: Integration[] = [
  {
    id: "outlook",
    name: "Microsoft Outlook",
    platform: "outlook",
    connected: true,
    status: "connected",
    lastSync: new Date(),
    account: "user@company.com"
  },
  {
    id: "gmail",
    name: "Gmail",
    platform: "gmail",
    connected: true,
    status: "connected",
    lastSync: new Date(),
    account: "user@gmail.com"
  },
];

// Helper functions for data access
export const getEmails = (): Email[] => DEV_MODE ? mockEmails : [];
export const getTasks = (): Task[] => DEV_MODE ? mockTasks : [];
export const getEvents = (): CalendarEvent[] => DEV_MODE ? mockEvents : [];
export const getEmailCategories = (): EmailCategory[] => DEV_MODE ? mockEmailCategories : [];
export const getConversations = (): Record<string, ConversationMessage[]> => DEV_MODE ? mockConversations : {};
export const getIntegrations = (): Integration[] => DEV_MODE ? mockIntegrations : [];