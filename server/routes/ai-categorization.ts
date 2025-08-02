import { RequestHandler } from "express";
import { z } from "zod";

interface CategoryRule {
  id: string;
  type: 'sender' | 'subject' | 'content' | 'domain' | 'keywords';
  condition: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex';
  value: string;
  category: string;
  confidence: number;
  enabled: boolean;
}

interface AICategorizationResult {
  category: string;
  confidence: number;
  reason: string;
  suggestedActions?: string[];
}

// Built-in categorization rules
const defaultRules: CategoryRule[] = [
  {
    id: 'rule-1',
    type: 'metadata',
    condition: 'direct_to_me',
    value: 'importance:high,direct_recipient:true',
    category: 'To Respond',
    confidence: 0.95,
    enabled: true
  },
  {
    id: 'rule-2',
    type: 'metadata',
    condition: 'conversation_analysis',
    value: 'sent_by_me:true,no_response:24h',
    category: 'Awaiting Reply',
    confidence: 0.9,
    enabled: true
  },
  {
    id: 'rule-3',
    type: 'keywords',
    condition: 'contains',
    value: 'unsubscribe|newsletter|promotion|marketing|offer|deal',
    category: 'Marketing',
    confidence: 0.85,
    enabled: true
  },
  {
    id: 'rule-4',
    type: 'domain',
    condition: 'contains',
    value: 'noreply@|no-reply@|notifications@|updates@',
    category: 'Updates',
    confidence: 0.9,
    enabled: true
  },
  {
    id: 'rule-5',
    type: 'keywords',
    condition: 'contains',
    value: 'invoice|payment|receipt|billing|subscription',
    category: 'Important',
    confidence: 0.95,
    enabled: true
  },
  {
    id: 'rule-6',
    type: 'subject',
    condition: 'starts_with',
    value: 'FYI:|For your information|Just so you know',
    category: 'FYI',
    confidence: 0.8,
    enabled: true
  },
  {
    id: 'rule-7',
    type: 'keywords',
    condition: 'contains',
    value: 'coupon|discount|sale|free shipping|limited time',
    category: 'Promotions',
    confidence: 0.85,
    enabled: true
  }
];

// Enhanced AI-powered categorization with metadata analysis
const categorizeEmailAI = (email: {
  sender: string;
  subject: string;
  content: string;
  metadata?: {
    toRecipients?: string[];
    ccRecipients?: string[];
    isReply?: boolean;
    isForward?: boolean;
    conversationId?: string;
    threadId?: string;
    importance?: 'low' | 'normal' | 'high';
    categories?: string[];
    hasAttachments?: boolean;
    sentToMe?: boolean;
    sentByMe?: boolean;
    messageId?: string;
    inReplyTo?: string;
    platform?: 'outlook' | 'gmail' | 'slack' | 'telegram' | 'whatsapp' | 'instagram' | 'facebook';
  };
}): AICategorizationResult => {
  const { sender, subject, content, metadata = {} } = email;
  const text = `${sender} ${subject} ${content}`.toLowerCase();

  // PRIMARY CATEGORIZATION: Use metadata analysis first

  // 1. "Awaiting Reply" - Based on conversation thread analysis, NOT keywords
  if (metadata.sentByMe && metadata.conversationId) {
    // Check if this is our last message in the thread and no response received
    // In production, this would query the actual conversation thread from Graph API/Gmail API
    const isLastMessageFromUs = !metadata.inReplyTo || metadata.messageId; // Simplified logic
    const timeSinceSent = new Date().getTime() - new Date(email.metadata?.sentDateTime || '').getTime();

    if (isLastMessageFromUs && timeSinceSent > 24 * 60 * 60 * 1000) { // 24 hours
      return {
        category: 'Awaiting Reply',
        confidence: 0.95,
        reason: 'You sent an email with no response received within 24 hours (metadata analysis)',
        suggestedActions: ['Send follow-up', 'Set reminder', 'Mark as low priority']
      };
    }
  }

  // Enhanced "To Respond" logic - check if email is directly to us
  if (metadata.sentToMe && !metadata.sentByMe) {
    // Check if it's a direct email to us (not CC)
    const isDirectRecipient = metadata.toRecipients?.some(recipient =>
      recipient.includes('you@') || recipient.includes('your-email')
    );

    if (isDirectRecipient) {
      // Check for urgent keywords in subject or metadata
      const urgentKeywords = ['urgent', 'asap', 'immediate', 'deadline', 'emergency'];
      const hasUrgentKeywords = urgentKeywords.some(keyword =>
        subject.toLowerCase().includes(keyword) ||
        (metadata.importance === 'high')
      );

      if (hasUrgentKeywords) {
        return {
          category: 'To Respond',
          confidence: 0.95,
          reason: 'Direct email to you with urgent indicators',
          suggestedActions: ['Reply immediately', 'Set high priority', 'Add to task list']
        };
      }
    }
  }

  // Re: subject analysis - distinguish between reply to us vs. reply to others
  if (subject.toLowerCase().startsWith('re:')) {
    if (metadata.isReply && metadata.inReplyTo) {
      // Check if the original email was sent by us
      // In production, this would check the messageId against sent emails
      const originalSentByUs = metadata.sentByMe; // Would lookup original email

      if (originalSentByUs) {
        return {
          category: 'Important',
          confidence: 0.90,
          reason: 'Reply to email you sent',
          suggestedActions: ['Review response', 'Continue conversation', 'Archive if resolved']
        };
      } else {
        return {
          category: 'FYI',
          confidence: 0.85,
          reason: 'Reply in conversation not initiated by you',
          suggestedActions: ['Read when convenient', 'Archive if not relevant']
        };
      }
    }
  }

  // Platform-specific categorization
  if (metadata.platform) {
    switch (metadata.platform) {
      case 'slack':
      case 'telegram':
      case 'whatsapp':
        return {
          category: 'FYI',
          confidence: 0.80,
          reason: `Message from ${metadata.platform} - typically informational`,
          suggestedActions: ['Read when convenient', 'Respond if mentioned']
        };
      case 'instagram':
      case 'facebook':
        return {
          category: 'Marketing',
          confidence: 0.85,
          reason: `Social media notification from ${metadata.platform}`,
          suggestedActions: ['Review engagement', 'Respond to customers']
        };
    }
  }

  // Check each rule
  for (const rule of defaultRules) {
    if (!rule.enabled) continue;

    let matches = false;
    const ruleValue = rule.value.toLowerCase();

    switch (rule.type) {
      case 'sender':
        matches = checkCondition(sender.toLowerCase(), ruleValue, rule.condition);
        break;
      case 'subject':
        matches = checkCondition(subject.toLowerCase(), ruleValue, rule.condition);
        break;
      case 'content':
        matches = checkCondition(content.toLowerCase(), ruleValue, rule.condition);
        break;
      case 'domain':
        const domain = sender.split('@')[1] || '';
        matches = checkCondition(domain.toLowerCase(), ruleValue, rule.condition);
        break;
      case 'keywords':
        const keywords = ruleValue.split('|');
        matches = keywords.some(keyword => text.includes(keyword));
        break;
    }

    if (matches) {
      return {
        category: rule.category,
        confidence: rule.confidence,
        reason: `Matched rule: ${rule.type} ${rule.condition} "${rule.value}"`,
        suggestedActions: getSuggestedActions(rule.category)
      };
    }
  }

  // Default fallback with sentiment analysis simulation
  const urgentWords = ['urgent', 'asap', 'immediate', 'deadline', 'emergency'];
  const isUrgent = urgentWords.some(word => text.includes(word));
  
  if (isUrgent) {
    return {
      category: 'To Respond',
      confidence: 0.7,
      reason: 'Detected urgent language in email content'
    };
  }

  // Check if it's from a known social platform
  const socialDomains = ['linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com'];
  const senderDomain = sender.split('@')[1] || '';
  const isSocial = socialDomains.some(domain => senderDomain.includes(domain));
  
  if (isSocial) {
    return {
      category: 'Marketing',
      confidence: 0.75,
      reason: 'Email from social media platform'
    };
  }

  // Default to FYI for everything else
  return {
    category: 'FYI',
    confidence: 0.6,
    reason: 'Default categorization - no specific rules matched'
  };
};

const checkCondition = (text: string, value: string, condition: string): boolean => {
  switch (condition) {
    case 'contains':
      return text.includes(value);
    case 'equals':
      return text === value;
    case 'starts_with':
      return text.startsWith(value);
    case 'ends_with':
      return text.endsWith(value);
    case 'regex':
      try {
        const regex = new RegExp(value, 'i');
        return regex.test(text);
      } catch {
        return false;
      }
    default:
      return false;
  }
};

const getSuggestedActions = (category: string): string[] => {
  switch (category) {
    case 'To Respond':
      return ['Reply within 24 hours', 'Set follow-up reminder', 'Mark as high priority'];
    case 'Important':
      return ['Review immediately', 'Add to task list', 'Archive after action'];
    case 'Marketing':
      return ['Unsubscribe if unwanted', 'Move to promotions', 'Auto-archive future emails'];
    case 'Updates':
      return ['Read when convenient', 'Auto-archive after 7 days', 'Create filter rule'];
    case 'Promotions':
      return ['Check if still valid', 'Save coupon codes', 'Unsubscribe if too frequent'];
    default:
      return ['Review and categorize', 'Archive if not relevant'];
  }
};

// API Endpoints

export const categorizeEmail: RequestHandler = (req, res) => {
  const { sender, subject, content } = req.body;

  if (!sender || !subject) {
    return res.status(400).json({ error: 'Sender and subject are required' });
  }

  try {
    const result = categorizeEmailAI({ sender, subject, content: content || '' });
    res.json(result);
  } catch (error) {
    console.error('Categorization error:', error);
    res.status(500).json({ error: 'Failed to categorize email' });
  }
};

export const bulkCategorizeEmails: RequestHandler = (req, res) => {
  const { emails } = req.body;

  if (!Array.isArray(emails)) {
    return res.status(400).json({ error: 'Emails must be an array' });
  }

  try {
    const results = emails.map(email => {
      const categorization = categorizeEmailAI(email);
      return {
        id: email.id,
        ...categorization
      };
    });

    res.json({ results, processed: emails.length });
  } catch (error) {
    console.error('Bulk categorization error:', error);
    res.status(500).json({ error: 'Failed to categorize emails' });
  }
};

export const getCategoryRules: RequestHandler = (req, res) => {
  res.json({ rules: defaultRules });
};

export const updateCategoryRule: RequestHandler = (req, res) => {
  const { ruleId } = req.params;
  const updates = req.body;

  // In production, this would update the database
  const ruleIndex = defaultRules.findIndex(rule => rule.id === ruleId);
  
  if (ruleIndex === -1) {
    return res.status(404).json({ error: 'Rule not found' });
  }

  defaultRules[ruleIndex] = { ...defaultRules[ruleIndex], ...updates };
  
  res.json({ 
    success: true, 
    rule: defaultRules[ruleIndex] 
  });
};

export const createCategoryRule: RequestHandler = (req, res) => {
  const ruleData = req.body;
  
  const newRule: CategoryRule = {
    id: `rule-${Date.now()}`,
    type: ruleData.type,
    condition: ruleData.condition,
    value: ruleData.value,
    category: ruleData.category,
    confidence: ruleData.confidence || 0.8,
    enabled: true
  };

  defaultRules.push(newRule);

  res.json({ 
    success: true, 
    rule: newRule 
  });
};

export const deleteCategoryRule: RequestHandler = (req, res) => {
  const { ruleId } = req.params;
  
  const ruleIndex = defaultRules.findIndex(rule => rule.id === ruleId);
  
  if (ruleIndex === -1) {
    return res.status(404).json({ error: 'Rule not found' });
  }

  defaultRules.splice(ruleIndex, 1);
  
  res.json({ success: true });
};

// Smart email processing
export const processEmailBatch: RequestHandler = async (req, res) => {
  const { emails, options = {} } = req.body;
  
  try {
    const processed = emails.map((email: any) => {
      const categorization = categorizeEmailAI(email);
      
      return {
        ...email,
        category: categorization.category,
        categoryColor: getCategoryColor(categorization.category),
        aiConfidence: categorization.confidence,
        aiReason: categorization.reason,
        suggestedActions: categorization.suggestedActions
      };
    });

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    res.json({
      success: true,
      processed: processed.length,
      emails: processed,
      stats: {
        categorized: processed.length,
        highConfidence: processed.filter(e => e.aiConfidence > 0.8).length,
        needsReview: processed.filter(e => e.aiConfidence < 0.7).length
      }
    });

  } catch (error) {
    console.error('Email processing error:', error);
    res.status(500).json({ error: 'Failed to process emails' });
  }
};

const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    'To Respond': 'bg-red-500',
    'Awaiting Reply': 'bg-orange-500',
    'Important': 'bg-yellow-500',
    'FYI': 'bg-blue-500',
    'Marketing': 'bg-purple-500',
    'Promotions': 'bg-green-500',
    'Updates': 'bg-indigo-500'
  };
  
  return colorMap[category] || 'bg-gray-500';
};
