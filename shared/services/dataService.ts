// Data Service - Reads from external configuration files
// In production, this would be replaced with API calls

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  assignees?: string[];
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
    timeframe: number;
    message: string;
    recipients: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

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
  emailAccount?: string;
  platform?: string;
  emailContext?: {
    messageId: string;
    sender: string;
    subject: string;
    platform: string;
  };
}

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

export interface AIRule {
  id: string;
  name: string;
  description: string;
  action: "categorize" | "priority" | "autoRespond" | "archive" | "forward";
  conditions: string[];
  confidence: number;
  enabled: boolean;
}

export interface ConversationMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
  avatar: string;
  status?: "sent" | "delivered" | "read";
}

// Data loading functions
export const loadTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch('/config/data/tasks.json');
    const data = await response.json();
    return data.tasks.map((task: any) => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }));
  } catch (error) {
    console.warn('Failed to load tasks from config, using fallback');
    return [];
  }
};

export const loadEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const response = await fetch('/config/data/calendar.json');
    const data = await response.json();
    return data.events.map((event: any) => ({
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime)
    }));
  } catch (error) {
    console.warn('Failed to load events from config, using fallback');
    return [];
  }
};

export const loadEmailCategories = async (): Promise<EmailCategory[]> => {
  try {
    const response = await fetch('/config/data/settings.json');
    const data = await response.json();
    return data.emailCategories;
  } catch (error) {
    console.warn('Failed to load email categories from config, using fallback');
    return [];
  }
};

export const loadAIRules = async (): Promise<AIRule[]> => {
  try {
    const response = await fetch('/config/data/settings.json');
    const data = await response.json();
    return data.aiRules;
  } catch (error) {
    console.warn('Failed to load AI rules from config, using fallback');
    return [];
  }
};

export const loadConversations = async (): Promise<Record<string, ConversationMessage[]>> => {
  try {
    const response = await fetch('/config/data/conversations.json');
    const data = await response.json();
    return data.conversations;
  } catch (error) {
    console.warn('Failed to load conversations from config, using fallback');
    return {};
  }
}; 