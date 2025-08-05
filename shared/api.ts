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
  platform?: string;
  platformLogo?: string;
  platformColor?: string;
  // Thread/Chain support
  threadId?: string;
  parentId?: string;
  conversationType?: "external" | "internal" | "mixed";
  participants?: EmailParticipant[];
  threadPosition?: number;
  hasReplies?: boolean;
  isThreadHead?: boolean;
  forkPoint?: boolean;
  // Enhanced properties
  followUpConfig?: FollowUpConfig;
  securityThreat?: SecurityThreat;
  crmContact?: CRMContact;
  aiAnalysis?: {
    sentiment: "positive" | "neutral" | "negative";
    urgency: number;
    actionItems: string[];
    entities: any[];
  };
}

export interface EmailParticipant {
  email: string;
  name: string;
  avatar: string;
  type: "external" | "internal";
  domain?: string;
}

export interface EmailThread {
  id: string;
  subject: string;
  participants: EmailParticipant[];
  messageCount: number;
  lastActivity: string;
  hasInternalFork: boolean;
  conversationPath: ConversationFork[];
  emails: Email[];
}

export interface ConversationFork {
  id: string;
  type: "external" | "internal" | "rejoined";
  participantChange: {
    added: EmailParticipant[];
    removed: EmailParticipant[];
  };
  atMessageId: string;
  description: string;
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
  templateId?: string;
  templateVariables?: Record<string, string>;
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

// Follow-up Orchestration interfaces
export interface FollowUpConfig {
  id: string;
  emailId: string;
  enabled: boolean;
  strategy: "immediate" | "delayed" | "intelligent" | "escalation";
  timeframe: number; // hours
  maxAttempts: number;
  platforms: ("email" | "slack" | "whatsapp" | "teams")[];
  recipients: string[];
  message: string;
  conditions: {
    noResponse: boolean;
    taskNotCompleted: boolean;
    urgencyLevel: "low" | "medium" | "high" | "urgent";
  };
  aiSuggestions: {
    optimalTiming: string;
    messagePersonalization: string;
    escalationPath: string[];
  };
  status: "pending" | "active" | "completed" | "cancelled";
  createdAt: string;
  nextAttempt?: string;
  attempts: FollowUpAttempt[];
}

export interface FollowUpAttempt {
  id: string;
  followUpId: string;
  platform: string;
  message: string;
  sentAt: string;
  delivered: boolean;
  responded: boolean;
  responseTime?: number;
}

// Smart Templates interfaces
export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: "reply" | "followup" | "introduction" | "closing" | "request" | "apology";
  template: string;
  variables: string[];
  useCount: number;
  lastUsed: Date;
  tags: string[];
  aiGenerated: boolean;
  teamShared: boolean;
  context?: {
    tone: "formal" | "casual" | "friendly" | "urgent";
    recipientType: "client" | "colleague" | "manager" | "vendor";
    purpose: string;
  };
  createdBy: string;
  createdAt: string;
}

export interface TemplateRequest {
  emailContext?: {
    subject?: string;
    sender?: string;
    content?: string;
    recipient?: string;
    previousEmails?: Email[];
  };
  category?: string;
  tone?: string;
  purpose?: string;
}

export interface TemplateResponse {
  templates: EmailTemplate[];
  suggestions: {
    template: EmailTemplate;
    relevanceScore: number;
    reason: string;
    adaptations: string[];
  }[];
}

// CRM Integration interfaces
export interface CRMContact {
  id: string;
  email: string;
  name: string;
  company?: string;
  title?: string;
  phone?: string;
  lastInteraction?: string;
  leadScore?: number;
  status: "lead" | "prospect" | "customer" | "inactive";
  notes: CRMNote[];
  tags: string[];
  customFields: Record<string, any>;
  source: "email" | "manual" | "import";
  createdAt: string;
  updatedAt: string;
}

export interface CRMNote {
  id: string;
  contactId: string;
  content: string;
  type: "email" | "call" | "meeting" | "note";
  relatedEmailId?: string;
  createdBy: string;
  createdAt: string;
  metadata?: {
    emailSubject?: string;
    emailDirection?: "inbound" | "outbound";
    sentiment?: "positive" | "neutral" | "negative";
    actionItems?: string[];
  };
}

export interface CRMUpdateRequest {
  contactId: string;
  emailId: string;
  updates: {
    notes?: string;
    tags?: string[];
    leadScore?: number;
    status?: string;
    customFields?: Record<string, any>;
  };
  autoGenerated: boolean;
}

// Security Detection interfaces
export interface SecurityThreat {
  id: string;
  emailId: string;
  type: "phishing" | "scam" | "malware" | "spam" | "suspicious";
  severity: "low" | "medium" | "high" | "critical";
  confidence: number; // 0-1
  indicators: SecurityIndicator[];
  status: "detected" | "reviewing" | "false_positive" | "confirmed";
  actionTaken?: "quarantine" | "delete" | "allow" | "flag";
  detectedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface SecurityIndicator {
  type: "sender_reputation" | "content_analysis" | "url_scan" | "attachment_scan" | "domain_spoofing";
  description: string;
  severity: "low" | "medium" | "high";
  details: any;
}

export interface SecurityScanRequest {
  emailId: string;
  deepScan?: boolean;
  includeAttachments?: boolean;
}

export interface SecurityScanResponse {
  threat?: SecurityThreat;
  safe: boolean;
  recommendations: string[];
  scanTime: number;
}

// Multi-Modal AI interfaces
export interface AIAssistantRequest {
  id: string;
  type: "voice_to_email" | "document_analysis" | "meeting_transcript" | "image_analysis";
  input: {
    audioUrl?: string;
    documentUrl?: string;
    imageUrl?: string;
    transcriptText?: string;
    context?: any;
  };
  output?: {
    extractedText?: string;
    emailDraft?: string;
    actionItems?: string[];
    summary?: string;
    entities?: any[];
  };
  status: "pending" | "processing" | "completed" | "failed";
  confidence?: number;
  processingTime?: number;
  createdAt: string;
  completedAt?: string;
}

export interface VoiceToEmailRequest {
  audioUrl: string;
  context?: {
    recipient?: string;
    subject?: string;
    tone?: string;
  };
}

export interface DocumentAnalysisRequest {
  documentUrl: string;
  analysisType: "summary" | "action_items" | "key_points" | "full_analysis";
}

// Task interfaces
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: Date;
  assignee?: string;
  assignees?: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
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
    recipients: string[];
    message: string;
  };
  // Enhanced task properties
  sourceEmail?: {
    id: string;
    subject: string;
    sender: string;
    extractedDeadlines?: Date[];
    actionItems?: string[];
    autoGenerated: boolean;
  };
  crmContact?: {
    contactId: string;
    contactName: string;
    company?: string;
  };
  projectContext?: {
    projectId: string;
    projectName: string;
    milestone?: string;
  };
}

export interface TaskCreationRequest {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  assignees?: string[];
  tags?: string[];
  emailId?: string;
  autoGenerated?: boolean;
}

// Calendar interfaces
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  attendees: string[];
  location?: string;
  platform: string;
  platformLogo: string;
  status: "confirmed" | "tentative" | "cancelled";
  recurrence?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: Date;
  };
  // Enhanced calendar properties
  sourceEmail?: {
    emailId: string;
    threadId?: string;
    autoGenerated: boolean;
  };
  actionItems?: string[];
  followUpTasks?: string[];
  meetingNotes?: string;
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
  // Enhanced settings
  followUpSettings: {
    enabled: boolean;
    defaultStrategy: string;
    defaultTimeframe: number;
    autoEscalation: boolean;
  };
  securitySettings: {
    phishingProtection: boolean;
    autoQuarantine: boolean;
    alertLevel: "low" | "medium" | "high";
  };
  crmSettings: {
    autoSync: boolean;
    autoNotes: boolean;
    leadScoring: boolean;
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

// Settings interfaces
export interface EmailCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
  rules: CategoryRule[];
  isActive: boolean;
  // Enhanced category properties
  autoActions?: {
    createTask: boolean;
    setFollowUp: boolean;
    updateCRM: boolean;
    flagSecurity: boolean;
  };
  aiLearning?: {
    enabled: boolean;
    confidence: number;
    lastTrained: string;
  };
}

export interface CategoryRule {
  field: "sender" | "subject" | "content" | "domain";
  operator: "contains" | "equals" | "starts_with" | "ends_with";
  value: string;
  weight: number;
}
