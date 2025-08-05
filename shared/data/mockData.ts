// Application Data Configuration
// This file provides data structures and sample data for the application
// Configure DEV_MODE to control data source behavior
export const DEV_MODE = true;

// User Accounts Mock Data - Multiple accounts per platform
export interface UserAccount {
  id: string;
  platform: string;
  type: "email" | "phone" | "username";
  address: string; // email address, phone number, or username
  displayName: string;
  isDefault: boolean;
  isActive: boolean;
  avatar?: string;
}

export const mockUserAccounts: UserAccount[] = [
  // Email Accounts
  {
    id: "email1",
    platform: "Gmail",
    type: "email",
    address: "john.doe@gmail.com",
    displayName: "John Doe (Personal)",
    isDefault: true,
    isActive: true,
    avatar: "JD",
  },
  {
    id: "email2", 
    platform: "Gmail",
    type: "email",
    address: "j.doe.work@gmail.com",
    displayName: "John Doe (Work)",
    isDefault: false,
    isActive: true,
    avatar: "JW",
  },
  {
    id: "email3",
    platform: "Outlook",
    type: "email", 
    address: "john.doe@company.com",
    displayName: "John Doe (Company)",
    isDefault: false,
    isActive: true,
    avatar: "JC",
  },
  // WhatsApp Accounts
  {
    id: "whatsapp1",
    platform: "WhatsApp",
    type: "phone",
    address: "+1-555-0123",
    displayName: "Personal WhatsApp",
    isDefault: true,
    isActive: true,
  },
  {
    id: "whatsapp2",
    platform: "WhatsApp", 
    type: "phone",
    address: "+1-555-9876",
    displayName: "Business WhatsApp",
    isDefault: false,
    isActive: true,
  },
  // Telegram Accounts
  {
    id: "telegram1",
    platform: "Telegram",
    type: "username",
    address: "@johndoe_dev",
    displayName: "John Doe Developer",
    isDefault: true,
    isActive: true,
  },
  // Slack Accounts  
  {
    id: "slack1",
    platform: "Slack",
    type: "username",
    address: "john.doe",
    displayName: "Development Team",
    isDefault: true,
    isActive: true,
  },
  {
    id: "slack2",
    platform: "Slack",
    type: "username", 
    address: "j.doe",
    displayName: "Marketing Team",
    isDefault: false,
    isActive: true,
  },
];

// Contact Mock Data - People to send messages to
export interface Contact {
  id: string;
  name: string;
  platforms: {
    platform: string;
    address: string; // email, phone, username
    lastContact?: string;
    frequency?: number; // how often contacted
  }[];
  avatar: string;
  company?: string;
  isFrequent: boolean;
}

export const mockContacts: Contact[] = [
  {
    id: "contact1",
    name: "Sarah Johnson",
    platforms: [
      { platform: "Gmail", address: "sarah@company.com", lastContact: "2h ago", frequency: 15 },
      { platform: "Slack", address: "sarah.johnson", lastContact: "5m ago", frequency: 25 },
      { platform: "WhatsApp", address: "+1-555-0234", lastContact: "1d ago", frequency: 8 },
    ],
    avatar: "SJ",
    company: "Tech Corp",
    isFrequent: true,
  },
  {
    id: "contact2", 
    name: "Marcus Chen",
    platforms: [
      { platform: "Gmail", address: "marcus@designco.com", lastContact: "15m ago", frequency: 12 },
      { platform: "Telegram", address: "@marcuschen", lastContact: "3h ago", frequency: 6 },
    ],
    avatar: "MC",
    company: "Design Co",
    isFrequent: true,
  },
  {
    id: "contact3",
    name: "Alex Rivera", 
    platforms: [
      { platform: "Gmail", address: "alex@startup.io", lastContact: "3h ago", frequency: 9 },
      { platform: "WhatsApp", address: "+1-555-0345", lastContact: "2h ago", frequency: 14 },
      { platform: "Slack", address: "alex.rivera", lastContact: "30m ago", frequency: 18 },
    ],
    avatar: "AR",
    company: "Startup Inc",
    isFrequent: true,
  },
  {
    id: "contact4",
    name: "Jessica Wong",
    platforms: [
      { platform: "Outlook", address: "jessica@company.com", lastContact: "6h ago", frequency: 7 },
      { platform: "Telegram", address: "@jessicaw", lastContact: "1d ago", frequency: 3 },
    ],
    avatar: "JW", 
    company: "Tech Corp",
    isFrequent: false,
  },
  {
    id: "contact5",
    name: "David Kim",
    platforms: [
      { platform: "Gmail", address: "david@clientcompany.com", lastContact: "30m ago", frequency: 11 },
      { platform: "WhatsApp", address: "+1-555-0456", lastContact: "45m ago", frequency: 16 },
    ],
    avatar: "DK",
    company: "Client Company", 
    isFrequent: true,
  },
  {
    id: "contact6",
    name: "Emily Chen",
    platforms: [
      { platform: "Gmail", address: "emily.chen@partner.com", lastContact: "1d ago", frequency: 5 },
      { platform: "Slack", address: "emily.chen", lastContact: "2h ago", frequency: 8 },
    ],
    avatar: "EC",
    company: "Partner Corp",
    isFrequent: false,
  },
];

// Helper functions to get user accounts and contacts
export const getUserAccounts = (platform?: string): UserAccount[] => {
  if (!DEV_MODE) return [];
  return platform ? mockUserAccounts.filter(account => account.platform === platform) : mockUserAccounts;
};

export const getContacts = (platform?: string): Contact[] => {
  if (!DEV_MODE) return [];
  if (platform) {
    return mockContacts.filter(contact => 
      contact.platforms.some(p => p.platform === platform)
    );
  }
  return mockContacts;
};

export const getFrequentContacts = (platform?: string, limit: number = 5): Contact[] => {
  if (!DEV_MODE) return [];
  return getContacts(platform)
    .filter(contact => contact.isFrequent)
    .slice(0, limit);
};

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
  // Thread/Chain support
  threadId?: string;
  parentId?: string;
  conversationType?: "external" | "internal" | "mixed";
  participants?: Array<{
    email: string;
    name: string;
    avatar: string;
    type: "external" | "internal";
    domain?: string;
  }>;
  threadPosition?: number;
  hasReplies?: boolean;
  isThreadHead?: boolean;
  forkPoint?: boolean;
}

export const mockEmails: Email[] = [
  // Thread 1: Budget Review - External to Internal Fork
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
    platform: "Slack",
    platformLogo: "💼",
    platformColor: "bg-purple-500",
    threadId: "thread_budget_1",
    isThreadHead: true,
    threadPosition: 1,
    hasReplies: true,
    conversationType: "external",
    participants: [
      { email: "sarah@company.com", name: "Sarah Johnson", avatar: "SJ", type: "internal", domain: "company.com" },
      { email: "client@external.com", name: "Client Contact", avatar: "CC", type: "external", domain: "external.com" },
      { email: "you@company.com", name: "You", avatar: "ME", type: "internal", domain: "company.com" }
    ]
  },
  {
    id: "1b",
    sender: "You",
    email: "you@company.com",
    subject: "Re: Q4 Budget Review Meeting",
    content: "Thanks Sarah, I can attend. Just one concern about the client costs...",
    preview: "Thanks Sarah, I can attend. Just one concern about the client costs...",
    time: "1h ago",
    unread: false,
    important: false,
    category: "Sent",
    categoryColor: "bg-blue-500",
    avatar: "ME",
    labels: ["work", "budget", "reply"],
    platform: "Slack",
    platformLogo: "💼",
    platformColor: "bg-purple-500",
    threadId: "thread_budget_1",
    parentId: "1",
    threadPosition: 2,
    hasReplies: true,
    conversationType: "external"
  },
  {
    id: "1c",
    sender: "Sarah Johnson",
    email: "sarah@company.com",
    subject: "Re: Q4 Budget Review Meeting - Internal Discussion",
    content: "Let's discuss the client cost concerns privately before the meeting...",
    preview: "Let's discuss the client cost concerns privately before the meeting...",
    time: "45m ago",
    unread: true,
    important: false,
    category: "FYI",
    categoryColor: "bg-blue-500",
    avatar: "SJ",
    labels: ["work", "budget", "internal"],
    platform: "Slack",
    platformLogo: "💼",
    platformColor: "bg-purple-500",
    threadId: "thread_budget_1",
    parentId: "1b",
    threadPosition: 3,
    hasReplies: true,
    conversationType: "internal",
    forkPoint: true,
    participants: [
      { email: "sarah@company.com", name: "Sarah Johnson", avatar: "SJ", type: "internal", domain: "company.com" },
      { email: "you@company.com", name: "You", avatar: "ME", type: "internal", domain: "company.com" }
    ]
  },
  {
    id: "1d",
    sender: "You",
    email: "you@company.com",
    subject: "Re: Q4 Budget Review Meeting - Internal Discussion",
    content: "Agreed. The client might not understand our overhead calculations...",
    preview: "Agreed. The client might not understand our overhead calculations...",
    time: "30m ago",
    unread: false,
    important: false,
    category: "Sent",
    categoryColor: "bg-blue-500",
    avatar: "ME",
    labels: ["work", "budget", "internal"],
    platform: "Slack",
    platformLogo: "💼",
    platformColor: "bg-purple-500",
    threadId: "thread_budget_1",
    parentId: "1c",
    threadPosition: 4,
    hasReplies: true,
    conversationType: "internal"
  },
  {
    id: "1e",
    sender: "Sarah Johnson",
    email: "sarah@company.com",
    subject: "Re: Q4 Budget Review Meeting",
    content: "Perfect! Let's proceed with the meeting as scheduled. @client@external.com, see you tomorrow!",
    preview: "Perfect! Let's proceed with the meeting as scheduled. @client@external.com, see you tomorrow!",
    time: "15m ago",
    unread: true,
    important: false,
    category: "FYI",
    categoryColor: "bg-blue-500",
    avatar: "SJ",
    labels: ["work", "budget", "meeting"],
    platform: "Slack",
    platformLogo: "💼",
    platformColor: "bg-purple-500",
    threadId: "thread_budget_1",
    parentId: "1d",
    threadPosition: 5,
    hasReplies: false,
    conversationType: "mixed",
    participants: [
      { email: "sarah@company.com", name: "Sarah Johnson", avatar: "SJ", type: "internal", domain: "company.com" },
      { email: "client@external.com", name: "Client Contact", avatar: "CC", type: "external", domain: "external.com" },
      { email: "you@company.com", name: "You", avatar: "ME", type: "internal", domain: "company.com" }
    ]
  },

  // Thread 2: Outlook Email Chain - Project Timeline Discussion with Fork
  {
    id: "2",
    sender: "Marcus Chen",
    email: "marcus@designco.com",
    subject: "Project Timeline Review - Client Meeting",
    content: "Hi team, I wanted to discuss the project timeline for our upcoming client deliverables. We need to review milestones and ensure we're on track for the Q1 deadline.",
    preview: "Hi team, I wanted to discuss the project timeline for our upcoming client deliverables...",
    time: "2h ago",
    unread: true,
    important: true,
    category: "To Respond",
    categoryColor: "bg-red-500",
    avatar: "MC",
    labels: ["project", "timeline", "client"],
    platform: "Outlook",
    platformLogo: "📨",
    platformColor: "bg-blue-700",
    threadId: "thread_project_1",
    isThreadHead: true,
    threadPosition: 1,
    hasReplies: true,
    conversationType: "external",
    participants: [
      { email: "marcus@designco.com", name: "Marcus Chen", avatar: "MC", type: "internal", domain: "designco.com" },
      { email: "client.lead@clientcorp.com", name: "Client Lead", avatar: "CL", type: "external", domain: "clientcorp.com" },
      { email: "you@designco.com", name: "You", avatar: "ME", type: "internal", domain: "designco.com" },
      { email: "pm@clientcorp.com", name: "Project Manager", avatar: "PM", type: "external", domain: "clientcorp.com" }
    ]
  },
  {
    id: "2b",
    sender: "You",
    email: "you@designco.com",
    subject: "Re: Project Timeline Review - Client Meeting",
    content: "Thanks Marcus. I've reviewed the timeline and have some concerns about the testing phase duration.",
    preview: "Thanks Marcus. I've reviewed the timeline and have some concerns about the testing phase...",
    time: "1h ago",
    unread: false,
    important: false,
    category: "Sent",
    categoryColor: "bg-blue-500",
    avatar: "ME",
    labels: ["project", "timeline", "feedback"],
    platform: "Outlook",
    platformLogo: "📨",
    platformColor: "bg-blue-700",
    threadId: "thread_project_1",
    parentId: "2",
    threadPosition: 2,
    hasReplies: true,
    conversationType: "external"
  },
  {
    id: "2c",
    sender: "Marcus Chen",
    email: "marcus@designco.com",
    subject: "Re: Project Timeline Review - INTERNAL: Testing Concerns",
    content: "Hey, let's discuss this testing timeline concern offline before responding to the client. I think we can optimize the process.",
    preview: "Hey, let's discuss this testing timeline concern offline before responding to the client...",
    time: "45m ago",
    unread: true,
    important: false,
    category: "Important",
    categoryColor: "bg-yellow-500",
    avatar: "MC",
    labels: ["project", "internal", "testing"],
    platform: "Outlook",
    platformLogo: "📨",
    platformColor: "bg-blue-700",
    threadId: "thread_project_1",
    parentId: "2b",
    threadPosition: 3,
    hasReplies: true,
    conversationType: "internal",
    forkPoint: true,
    participants: [
      { email: "marcus@designco.com", name: "Marcus Chen", avatar: "MC", type: "internal", domain: "designco.com" },
      { email: "you@designco.com", name: "You", avatar: "ME", type: "internal", domain: "designco.com" }
    ]
  },
  {
    id: "2d",
    sender: "You",
    email: "you@designco.com",
    subject: "Re: Project Timeline Review - INTERNAL: Testing Concerns",
    content: "Good point. I think we can reduce testing from 3 weeks to 2 weeks if we implement automated testing for the UI components.",
    preview: "Good point. I think we can reduce testing from 3 weeks to 2 weeks if we implement...",
    time: "30m ago",
    unread: false,
    important: false,
    category: "Sent",
    categoryColor: "bg-blue-500",
    avatar: "ME",
    labels: ["project", "internal", "testing"],
    platform: "Outlook",
    platformLogo: "📨",
    platformColor: "bg-blue-700",
    threadId: "thread_project_1",
    parentId: "2c",
    threadPosition: 4,
    hasReplies: true,
    conversationType: "internal"
  },
  {
    id: "2e",
    sender: "Marcus Chen",
    email: "marcus@designco.com",
    subject: "Re: Project Timeline Review - Client Meeting",
    content: "Perfect! @client.lead@clientcorp.com @pm@clientcorp.com - We've optimized our testing timeline and can commit to the original deadline. Updated timeline attached.",
    preview: "Perfect! @client.lead@clientcorp.com @pm@clientcorp.com - We've optimized our testing timeline...",
    time: "15m ago",
    unread: true,
    important: false,
    category: "FYI",
    categoryColor: "bg-blue-500",
    avatar: "MC",
    labels: ["project", "timeline", "client"],
    platform: "Outlook",
    platformLogo: "📨",
    platformColor: "bg-blue-700",
    threadId: "thread_project_1",
    parentId: "2d",
    threadPosition: 5,
    hasReplies: false,
    conversationType: "mixed",
    participants: [
      { email: "marcus@designco.com", name: "Marcus Chen", avatar: "MC", type: "internal", domain: "designco.com" },
      { email: "client.lead@clientcorp.com", name: "Client Lead", avatar: "CL", type: "external", domain: "clientcorp.com" },
      { email: "you@designco.com", name: "You", avatar: "ME", type: "internal", domain: "designco.com" },
      { email: "pm@clientcorp.com", name: "Project Manager", avatar: "PM", type: "external", domain: "clientcorp.com" }
    ]
  },

  // Single Gmail email for variety
  {
    id: "3",
    sender: "Design System Team",
    email: "design-system@designco.com",
    subject: "New Design System Updates",
    content: "The latest updates to our design system are now available...",
    preview: "The latest updates to our design system are now available. Please review the new...",
    time: "3h ago",
    unread: true,
    important: false,
    category: "FYI",
    categoryColor: "bg-blue-500",
    avatar: "DS",
    labels: ["design", "updates"],
    platform: "Gmail",
    platformLogo: "✉️",
    platformColor: "bg-red-500",
  },
  {
    id: "4",
    sender: "LinkedIn",
    email: "notifications@linkedin.com",
    subject: "Your weekly summary is ready",
    content: "See who viewed your profile this week and discover new connections...",
    preview: "See who viewed your profile this week and discover new connections in your industry...",
    time: "4h ago",
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
  {
    id: "6",
    sender: "Amazon Support",
    email: "support@amazon.com",
    subject: "Package Delivery Update",
    content: "Your package #AMZ123456 has been shipped and will arrive tomorrow.",
    preview: "Your package #AMZ123456 has been shipped and will arrive tomorrow between 2-6 PM...",
    time: "2h ago",
    unread: true,
    important: false,
    category: "Updates",
    categoryColor: "bg-indigo-500",
    avatar: "AS",
    labels: ["delivery", "ecommerce"],
    platform: "WhatsApp",
    platformLogo: "💬",
    platformColor: "bg-green-500",
  },
  {
    id: "7",
    sender: "DevOps Team",
    email: "devops@company.com",
    subject: "Server Alert: High CPU Usage",
    content: "Server alert: High CPU usage detected on production server. Please investigate.",
    preview: "Server alert: High CPU usage detected on production server. Please investigate immediately...",
    time: "30m ago",
    unread: true,
    important: true,
    category: "Important",
    categoryColor: "bg-yellow-500",
    avatar: "DT",
    labels: ["devops", "alert", "urgent"],
    platform: "Telegram",
    platformLogo: "📨",
    platformColor: "bg-blue-500",
  },
];

// Sent Emails Mock Data
export const mockSentEmails: Email[] = [
  {
    id: "sent_1",
    sender: "You",
    email: "john.doe@gmail.com",
    subject: "Re: Budget Review Meeting",
    content: "Thanks for the update, Sarah. I'll review the documents and get back to you by tomorrow.",
    preview: "Thanks for the update, Sarah. I'll review the documents and get back to you by tomorrow...",
    time: "10m ago",
    unread: false,
    important: false,
    category: "Sent",
    categoryColor: "bg-blue-500",
    avatar: "ME",
    labels: ["work", "budget", "reply"],
    platform: "Gmail",
    platformLogo: "📧",
    platformColor: "bg-red-500",
  },
  {
    id: "sent_2",
    sender: "You",
    email: "j.doe.work@gmail.com",
    subject: "Project Status Update",
    content: "Hi team, here's the weekly status update for our current projects...",
    preview: "Hi team, here's the weekly status update for our current projects. Overall progress is good...",
    time: "2h ago",
    unread: false,
    important: false,
    category: "Sent",
    categoryColor: "bg-blue-500",
    avatar: "ME",
    labels: ["work", "update", "team"],
    platform: "Gmail",
    platformLogo: "📧",
    platformColor: "bg-red-500",
  },
  {
    id: "sent_3",
    sender: "You",
    email: "john.doe@company.com",
    subject: "Meeting Confirmation",
    content: "Confirming our meeting tomorrow at 2 PM. Looking forward to our discussion.",
    preview: "Confirming our meeting tomorrow at 2 PM. Looking forward to our discussion about the new...",
    time: "1d ago",
    unread: false,
    important: false,
    category: "Sent",
    categoryColor: "bg-blue-500",
    avatar: "ME",
    labels: ["meeting", "confirmation"],
    platform: "Outlook",
    platformLogo: "📨",
    platformColor: "bg-blue-700",
  },
];

// Archived Emails Mock Data
export const mockArchivedEmails: Email[] = [
  {
    id: "archived_1",
    sender: "Netflix",
    email: "info@netflix.com",
    subject: "Your Monthly Recap",
    content: "Here's what you watched this month on Netflix...",
    preview: "Here's what you watched this month on Netflix. You spent 23 hours watching...",
    time: "1w ago",
    unread: false,
    important: false,
    category: "Marketing",
    categoryColor: "bg-purple-500",
    avatar: "NF",
    labels: ["entertainment", "monthly"],
    platform: "Gmail",
    platformLogo: "📧",
    platformColor: "bg-red-500",
  },
  {
    id: "archived_2",
    sender: "Adobe",
    email: "offers@adobe.com",
    subject: "Creative Cloud Special Offer",
    content: "Limited time offer: Get 3 months free with Creative Cloud subscription...",
    preview: "Limited time offer: Get 3 months free with Creative Cloud subscription. Perfect for...",
    time: "2w ago",
    unread: false,
    important: false,
    category: "Promotions",
    categoryColor: "bg-green-500",
    avatar: "AD",
    labels: ["software", "promotion", "creative"],
    platform: "Gmail",
    platformLogo: "📧",
    platformColor: "bg-red-500",
  },
  {
    id: "archived_3",
    sender: "GitHub",
    email: "noreply@github.com",
    subject: "Security Alert",
    content: "We detected a new login to your GitHub account from a new device...",
    preview: "We detected a new login to your GitHub account from a new device. If this was you...",
    time: "3w ago",
    unread: false,
    important: false,
    category: "Important",
    categoryColor: "bg-yellow-500",
    avatar: "GH",
    labels: ["security", "github", "alert"],
    platform: "Gmail",
    platformLogo: "📧",
    platformColor: "bg-red-500",
  },
];

// Deleted/Trash Emails Mock Data
export const mockDeletedEmails: Email[] = [
  {
    id: "deleted_1",
    sender: "Spam Sender",
    email: "noreply@spamsite.com",
    subject: "Win $1000 Now!!!",
    content: "You've won our amazing lottery! Click here to claim your prize...",
    preview: "You've won our amazing lottery! Click here to claim your prize of $1000...",
    time: "3d ago",
    unread: false,
    important: false,
    category: "Spam",
    categoryColor: "bg-red-600",
    avatar: "SP",
    labels: ["spam", "lottery", "suspicious"],
    platform: "Gmail",
    platformLogo: "📧",
    platformColor: "bg-red-500",
  },
  {
    id: "deleted_2",
    sender: "Old Newsletter",
    email: "newsletter@oldservice.com",
    subject: "Weekly Updates You Don't Need",
    content: "Here are updates for a service you haven't used in years...",
    preview: "Here are updates for a service you haven't used in years. We keep sending these...",
    time: "1w ago",
    unread: false,
    important: false,
    category: "Marketing",
    categoryColor: "bg-purple-500",
    avatar: "ON",
    labels: ["newsletter", "unused", "old"],
    platform: "Gmail",
    platformLogo: "📧",
    platformColor: "bg-red-500",
  },
];

// Helper functions for different email types
export const getSentEmails = (): Email[] => {
  if (!DEV_MODE) return [];
  return mockSentEmails;
};

export const getArchivedEmails = (): Email[] => {
  if (!DEV_MODE) return [];
  return mockArchivedEmails;
};

export const getDeletedEmails = (): Email[] => {
  if (!DEV_MODE) return [];
  return mockDeletedEmails;
};

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
  {
    id: "fyi",
    name: "FYI",
    color: "bg-blue-500",
    description: "Informational emails that don't require action",
    rules: [
      {
        id: "2",
        type: "subject",
        condition: "starts_with",
        value: "FYI:",
        enabled: true,
        apiField: "subject",
        description: "Emails with FYI prefix",
      },
    ],
    enabled: true,
  },
  {
    id: "marketing",
    name: "Marketing",
    color: "bg-purple-500",
    description: "Marketing emails and newsletters",
    rules: [
      {
        id: "3",
        type: "sender",
        condition: "contains",
        value: "marketing",
        enabled: true,
        apiField: "from/emailAddress/address",
        description: "Emails from marketing addresses",
      },
    ],
    enabled: true,
  },
  {
    id: "important",
    name: "Important",
    color: "bg-yellow-500",
    description: "High priority emails",
    rules: [
      {
        id: "4",
        type: "importance",
        condition: "equals",
        value: "high",
        enabled: true,
        apiField: "importance",
        description: "High importance emails",
      },
    ],
    enabled: true,
  },
  {
    id: "awaiting-reply",
    name: "Awaiting Reply",
    color: "bg-orange-500",
    description: "Emails waiting for your response",
    rules: [
      {
        id: "5",
        type: "subject",
        condition: "starts_with",
        value: "Re:",
        enabled: true,
        apiField: "subject",
        description: "Reply chains needing follow-up",
      },
    ],
    enabled: true,
  },
  {
    id: "promotions",
    name: "Promotions",
    color: "bg-green-500",
    description: "Promotional emails and offers",
    rules: [
      {
        id: "6",
        type: "subject",
        condition: "contains",
        value: "offer",
        enabled: true,
        apiField: "subject",
        description: "Promotional offers and deals",
      },
    ],
    enabled: true,
  },
  {
    id: "updates",
    name: "Updates",
    color: "bg-indigo-500",
    description: "System updates and notifications",
    rules: [
      {
        id: "7",
        type: "subject",
        condition: "contains",
        value: "update",
        enabled: true,
        apiField: "subject",
        description: "Update notifications",
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
      status: "delivered",
    },
    {
      id: "2",
      sender: "You",
      content: "Great! When can I expect delivery?",
      time: "1h ago",
      isMe: true,
      avatar: "ME",
      status: "read",
    },
    {
      id: "3",
      sender: "Amazon Support",
      content: "Your package will arrive tomorrow between 2-6 PM. You'll receive tracking updates via SMS.",
      time: "45m ago",
      isMe: false,
      avatar: "AS",
      status: "delivered",
    },
  ],
  telegram_7: [
    {
      id: "1",
      sender: "DevOps Team",
      content: "🚨 Server Alert: High CPU usage detected on production server",
      time: "30m ago",
      isMe: false,
      avatar: "DT",
      status: "delivered",
    },
    {
      id: "2",
      sender: "You",
      content: "On it! Checking the logs now.",
      time: "28m ago",
      isMe: true,
      avatar: "ME",
      status: "read",
    },
    {
      id: "3",
      sender: "DevOps Team",
      content: "Thanks! The issue seems to be with the background job queue. CPU is back to normal now.",
      time: "15m ago",
      isMe: false,
      avatar: "DT",
      status: "delivered",
    },
    {
      id: "4",
      sender: "You",
      content: "Perfect! I've optimized the queue processing. Should prevent future spikes.",
      time: "10m ago",
      isMe: true,
      avatar: "ME",
      status: "read",
    },
  ],
  slack_1: [
    {
      id: "1",
      sender: "Sarah Johnson",
      content: "Can we reschedule the Q4 budget meeting? Something urgent came up.",
      time: "5m ago",
      isMe: false,
      avatar: "SJ",
      status: "delivered",
    },
    {
      id: "2",
      sender: "You",
      content: "Of course! What works better for you?",
      time: "3m ago",
      isMe: true,
      avatar: "ME",
      status: "read",
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
