// Existing demo response
export interface DemoResponse {
  message: string;
}

// Email-related interfaces
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
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface EmailsResponse {
  emails: Email[];
  total: number;
  unread: number;
  categories: CategoryCount[];
}

export interface CategoryCount {
  name: string;
  count: number;
  color: string;
}

export interface ComposeEmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  content: string;
  priority?: "low" | "normal" | "high";
  scheduledSend?: string;
  attachments?: File[];
}

export interface SendEmailResponse {
  success: boolean;
  messageId: string;
  message: string;
  error?: string;
}

export interface AIResponse {
  suggestion: string;
  type: "reply" | "summary" | "action" | "draft";
  confidence: number;
  alternatives?: string[];
}

export interface AIRequest {
  type: "reply" | "summary" | "action" | "draft";
  emailId?: string;
  context?: {
    to?: string;
    subject?: string;
    content?: string;
    thread?: Email[];
  };
}

// Integration-related interfaces
export interface Integration {
  platform: "slack" | "telegram" | "instagram" | "facebook";
  connected: boolean;
  lastSync?: string;
  metrics: {
    messages: number;
    channels?: number;
    chats?: number;
    conversations?: number;
    pages?: number;
  };
}

export interface IntegrationStatus {
  slack: Integration;
  telegram: Integration;
  instagram: Integration;
  facebook: Integration;
}

export interface ConnectIntegrationRequest {
  platform: string;
  token?: string;
  code?: string;
  redirectUri?: string;
}

export interface ConnectIntegrationResponse {
  success: boolean;
  message: string;
  authUrl?: string;
  error?: string;
}

// Search and filter interfaces
export interface EmailFilter {
  category?: string;
  sender?: string;
  unread?: boolean;
  important?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  labels?: string[];
}

export interface SearchRequest {
  query: string;
  filter?: EmailFilter;
  page?: number;
  limit?: number;
  sortBy?: "date" | "sender" | "subject" | "priority";
  sortOrder?: "asc" | "desc";
}

// User preferences and settings
export interface UserSettings {
  theme: "light" | "dark" | "auto";
  emailsPerPage: number;
  autoMarkAsRead: boolean;
  keyboardShortcuts: boolean;
  notifications: {
    desktop: boolean;
    email: boolean;
    sound: boolean;
  };
  aiSettings: {
    autoSuggest: boolean;
    autoCategory: boolean;
    confidence: number;
  };
}

export interface UpdateSettingsRequest {
  settings: Partial<UserSettings>;
}

export interface UpdateSettingsResponse {
  success: boolean;
  settings: UserSettings;
  error?: string;
}
