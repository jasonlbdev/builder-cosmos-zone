import { Integration, UserAccount } from "./types";

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
    avatar: "WA",
  },
  {
    id: "whatsapp2",
    platform: "WhatsApp Business",
    type: "phone",
    address: "+1-555-0199",
    displayName: "Business WhatsApp",
    isDefault: false,
    isActive: true,
    avatar: "WB",
  },
  // Slack Accounts
  {
    id: "slack1",
    platform: "Slack",
    type: "username",
    address: "@john.doe",
    displayName: "Development Team Slack",
    isDefault: true,
    isActive: true,
    avatar: "SL",
  },
  {
    id: "slack2",
    platform: "Slack",
    type: "username",
    address: "@j.doe.marketing",
    displayName: "Marketing Team Slack",
    isDefault: false,
    isActive: true,
    avatar: "SM",
  },
  // Telegram Accounts
  {
    id: "telegram1",
    platform: "Telegram",
    type: "username",
    address: "@johndoe",
    displayName: "Personal Telegram",
    isDefault: true,
    isActive: true,
    avatar: "TG",
  }
];

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
  {
    id: "slack",
    name: "Slack",
    platform: "slack",
    connected: true,
    status: "connected",
    lastSync: new Date(),
    account: "@user"
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    platform: "whatsapp",
    connected: false,
    status: "disconnected",
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    account: ""
  },
  {
    id: "telegram",
    name: "Telegram",
    platform: "telegram",
    connected: true,
    status: "connected",
    lastSync: new Date(),
    account: "@user"
  },
  {
    id: "gdrive",
    name: "Google Drive",
    platform: "google-drive",
    connected: true,
    status: "connected",
    lastSync: new Date(),
    account: "user@gmail.com"
  },
  {
    id: "dropbox",
    name: "Dropbox",
    platform: "dropbox",
    connected: true,
    status: "connected",
    lastSync: new Date(),
    account: "user@dropbox.com"
  },
  {
    id: "onedrive",
    name: "OneDrive",
    platform: "onedrive",
    connected: false,
    status: "disconnected",
    lastSync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    account: ""
  }
];

// Integration categories for the left sidebar
export const integrationCategories = {
  emailProviders: {
    name: "Email Providers",
    isOpen: true,
    items: [
      {
        name: "Gmail",
        status: "healthy",
        lastSync: "1 min ago",
        workspaces: ["Personal", "Work"],
        unreadCount: 24,
      },
      {
        name: "Outlook",
        status: "healthy",
        lastSync: "3 mins ago",
        workspaces: ["Business", "Corporate"],
        unreadCount: 8,
      },
    ],
  },
  messagingPlatforms: {
    name: "Messaging Platforms",
    isOpen: true,
    items: [
      {
        name: "Slack",
        status: "healthy",
        lastSync: "2 mins ago",
        workspaces: ["Development Team", "Marketing Team"],
        unreadCount: 12,
      },
      {
        name: "WhatsApp",
        status: "warning",
        lastSync: "15 mins ago",
        workspaces: ["Business", "Personal"],
        unreadCount: 3,
      },
      {
        name: "Telegram",
        status: "healthy",
        lastSync: "1 min ago",
        workspaces: ["Personal"],
        unreadCount: 0,
      },
    ],
  },
  socialPlatforms: {
    name: "Social Platforms",
    isOpen: false,
    items: [
      {
        name: "Instagram",
        status: "disconnected",
        lastSync: "Never",
        workspaces: [],
        unreadCount: 0,
      },
      {
        name: "Facebook",
        status: "error",
        lastSync: "2 hours ago",
        workspaces: ["Business Page"],
        unreadCount: 0,
      },
    ],
  },
  cloudStorage: {
    name: "Cloud Storage",
    isOpen: true,
    items: [
      {
        name: "Google Drive",
        status: "healthy",
        lastSync: "5 mins ago",
        workspaces: ["Personal", "Work"],
        unreadCount: 0,
      },
      {
        name: "Dropbox",
        status: "healthy",
        lastSync: "10 mins ago",
        workspaces: ["Business"],
        unreadCount: 0,
      },
      {
        name: "OneDrive",
        status: "disconnected",
        lastSync: "Never",
        workspaces: [],
        unreadCount: 0,
      },
      {
        name: "iCloud",
        status: "warning",
        lastSync: "1 hour ago",
        workspaces: ["Personal"],
        unreadCount: 0,
      },
    ],
  },
};

export const getConnectedIntegrations = () => {
  return mockIntegrations.filter(integration => integration.connected);
};

export const getIntegrationsByPlatform = (platform: string) => {
  return mockIntegrations.filter(integration => integration.platform === platform);
};

export const getIntegrationStatus = (integrationId: string) => {
  const integration = mockIntegrations.find(i => i.id === integrationId);
  return integration?.status || "disconnected";
};
