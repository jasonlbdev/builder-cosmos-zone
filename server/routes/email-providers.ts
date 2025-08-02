import { RequestHandler } from "express";
import { z } from "zod";

// Email provider interfaces
export interface OutlookIntegration {
  accessToken: string;
  refreshToken: string;
  userPrincipalName: string;
  displayName: string;
  connected: boolean;
  lastSync: string;
  scopes: string[];
}

export interface GmailIntegration {
  accessToken: string;
  refreshToken: string;
  emailAddress: string;
  displayName: string;
  connected: boolean;
  lastSync: string;
  scopes: string[];
}

export interface WhatsAppIntegration {
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
  displayName: string;
  connected: boolean;
  lastSync: string;
}

// Enhanced email structure with metadata
export interface EnhancedEmail {
  id: string;
  messageId: string;
  conversationId?: string;
  threadId?: string;
  platform: 'outlook' | 'gmail' | 'whatsapp';
  
  // Basic email data
  sender: string;
  senderEmail: string;
  subject: string;
  bodyPreview: string;
  body: string;
  receivedDateTime: string;
  
  // Recipients
  toRecipients: EmailAddress[];
  ccRecipients: EmailAddress[];
  bccRecipients: EmailAddress[];
  
  // Metadata for categorization
  importance: 'low' | 'normal' | 'high';
  isRead: boolean;
  isDraft: boolean;
  hasAttachments: boolean;
  attachments: EmailAttachment[];
  categories: string[];
  
  // Thread analysis
  isReply: boolean;
  isForward: boolean;
  inReplyTo?: string;
  references?: string[];
  
  // User context
  sentToMe: boolean;
  sentByMe: boolean;
  
  // AI analysis results
  aiCategory?: string;
  aiConfidence?: number;
  aiReason?: string;
  suggestedActions?: string[];
}

export interface EmailAddress {
  name: string;
  address: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  contentType: string;
  size: number;
  isInline: boolean;
}

// Validation schemas
const OutlookOAuthSchema = z.object({
  code: z.string(),
  redirectUri: z.string().url(),
  state: z.string().optional()
});

const GmailOAuthSchema = z.object({
  code: z.string(),
  redirectUri: z.string().url(),
  state: z.string().optional()
});

// Mock database
let emailProviders = {
  outlook: [] as OutlookIntegration[],
  gmail: [] as GmailIntegration[],
  whatsapp: [] as WhatsAppIntegration[]
};

// Microsoft Graph API functions
const exchangeOutlookCode = async (code: string, redirectUri: string) => {
  try {
    const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.OUTLOOK_CLIENT_ID || '',
        client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read'
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Outlook token exchange error:', error);
    throw error;
  }
};

const getOutlookEmails = async (accessToken: string, userId: string) => {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userId}/messages?$top=50&$select=id,subject,sender,toRecipients,ccRecipients,receivedDateTime,bodyPreview,body,importance,isRead,hasAttachments,conversationId,internetMessageId,parentFolderId&$orderby=receivedDateTime desc`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Graph API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.value.map((email: any) => transformOutlookEmail(email));
  } catch (error) {
    console.error('Outlook emails fetch error:', error);
    throw error;
  }
};

const transformOutlookEmail = (outlookEmail: any): EnhancedEmail => {
  return {
    id: outlookEmail.id,
    messageId: outlookEmail.internetMessageId,
    conversationId: outlookEmail.conversationId,
    platform: 'outlook',
    
    sender: outlookEmail.sender?.emailAddress?.name || 'Unknown',
    senderEmail: outlookEmail.sender?.emailAddress?.address || '',
    subject: outlookEmail.subject || '(No Subject)',
    bodyPreview: outlookEmail.bodyPreview || '',
    body: outlookEmail.body?.content || '',
    receivedDateTime: outlookEmail.receivedDateTime,
    
    toRecipients: outlookEmail.toRecipients?.map((r: any) => ({
      name: r.emailAddress?.name || '',
      address: r.emailAddress?.address || ''
    })) || [],
    ccRecipients: outlookEmail.ccRecipients?.map((r: any) => ({
      name: r.emailAddress?.name || '',
      address: r.emailAddress?.address || ''
    })) || [],
    bccRecipients: [],
    
    importance: outlookEmail.importance || 'normal',
    isRead: outlookEmail.isRead || false,
    isDraft: false,
    hasAttachments: outlookEmail.hasAttachments || false,
    attachments: [],
    categories: [],
    
    isReply: outlookEmail.subject?.startsWith('Re:') || false,
    isForward: outlookEmail.subject?.startsWith('Fwd:') || outlookEmail.subject?.startsWith('FW:') || false,
    
    sentToMe: true, // Would be determined by checking recipient lists
    sentByMe: false // Would be determined by checking sender against user email
  };
};

// Gmail API functions
const exchangeGmailCode = async (code: string, redirectUri: string) => {
  try {
    const tokenEndpoint = 'https://oauth2.googleapis.com/token';
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GMAIL_CLIENT_ID || '',
        client_secret: process.env.GMAIL_CLIENT_SECRET || '',
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Gmail token exchange error:', error);
    throw error;
  }
};

const getGmailEmails = async (accessToken: string) => {
  try {
    // Get list of messages
    const listResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!listResponse.ok) {
      throw new Error(`Gmail API error: ${listResponse.status}`);
    }
    
    const listData = await listResponse.json();
    
    // Get detailed information for each message
    const emailPromises = listData.messages?.slice(0, 20).map(async (message: any) => {
      const detailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      const detailData = await detailResponse.json();
      return transformGmailEmail(detailData);
    });
    
    return await Promise.all(emailPromises || []);
  } catch (error) {
    console.error('Gmail emails fetch error:', error);
    throw error;
  }
};

const transformGmailEmail = (gmailEmail: any): EnhancedEmail => {
  const headers = gmailEmail.payload?.headers || [];
  const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
  
  return {
    id: gmailEmail.id,
    messageId: getHeader('Message-ID'),
    threadId: gmailEmail.threadId,
    platform: 'gmail',
    
    sender: getHeader('From'),
    senderEmail: getHeader('From').match(/<(.+)>/)?.[1] || getHeader('From'),
    subject: getHeader('Subject') || '(No Subject)',
    bodyPreview: gmailEmail.snippet || '',
    body: extractGmailBody(gmailEmail.payload),
    receivedDateTime: new Date(parseInt(gmailEmail.internalDate)).toISOString(),
    
    toRecipients: parseEmailAddresses(getHeader('To')),
    ccRecipients: parseEmailAddresses(getHeader('Cc')),
    bccRecipients: parseEmailAddresses(getHeader('Bcc')),
    
    importance: getHeader('X-Priority') === '1' ? 'high' : 'normal',
    isRead: !gmailEmail.labelIds?.includes('UNREAD'),
    isDraft: gmailEmail.labelIds?.includes('DRAFT') || false,
    hasAttachments: gmailEmail.payload?.parts?.some((part: any) => part.filename) || false,
    attachments: [],
    categories: gmailEmail.labelIds || [],
    
    isReply: getHeader('Subject').startsWith('Re:') || !!getHeader('In-Reply-To'),
    isForward: getHeader('Subject').startsWith('Fwd:') || getHeader('Subject').startsWith('FW:'),
    inReplyTo: getHeader('In-Reply-To'),
    references: getHeader('References')?.split(' ') || [],
    
    sentToMe: true, // Would be determined by checking recipient lists
    sentByMe: gmailEmail.labelIds?.includes('SENT') || false
  };
};

const extractGmailBody = (payload: any): string => {
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString();
  }
  
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString();
      }
    }
  }
  
  return '';
};

const parseEmailAddresses = (addressString: string): EmailAddress[] => {
  if (!addressString) return [];
  
  const addresses = addressString.split(',').map(addr => {
    const match = addr.trim().match(/^(.+?)\s*<(.+)>$/) || addr.trim().match(/^(.+)$/);
    if (match) {
      return {
        name: match[1]?.replace(/"/g, '').trim() || '',
        address: match[2]?.trim() || match[1]?.trim() || ''
      };
    }
    return { name: '', address: addr.trim() };
  });
  
  return addresses;
};

// API Endpoints

export const initiateOutlookOAuth: RequestHandler = (req, res) => {
  const clientId = process.env.OUTLOOK_CLIENT_ID;
  const redirectUri = `${req.protocol}://${req.get('host')}/api/email-providers/outlook/callback`;
  const scopes = 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read';
  const state = Math.random().toString(36).substring(7);

  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;

  res.json({ authUrl, state });
};

export const handleOutlookCallback: RequestHandler = async (req, res) => {
  try {
    const validation = OutlookOAuthSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    const { code, redirectUri } = validation.data;
    const tokenResponse = await exchangeOutlookCode(code, redirectUri);
    
    if (tokenResponse.error) {
      return res.status(400).json({ error: 'Failed to exchange code for token', details: tokenResponse });
    }

    // Get user profile
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokenResponse.access_token}`,
      },
    });
    const userProfile = await userResponse.json();

    const outlookIntegration: OutlookIntegration = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      userPrincipalName: userProfile.userPrincipalName,
      displayName: userProfile.displayName,
      connected: true,
      lastSync: new Date().toISOString(),
      scopes: tokenResponse.scope?.split(' ') || []
    };

    emailProviders.outlook.push(outlookIntegration);

    res.json({ 
      success: true, 
      user: {
        email: outlookIntegration.userPrincipalName,
        name: outlookIntegration.displayName
      }
    });

  } catch (error) {
    console.error('Outlook OAuth error:', error);
    res.status(500).json({ error: 'Internal server error during Outlook integration' });
  }
};

export const initiateGmailOAuth: RequestHandler = (req, res) => {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const redirectUri = `${req.protocol}://${req.get('host')}/api/email-providers/gmail/callback`;
  const scopes = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';
  const state = Math.random().toString(36).substring(7);

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}&access_type=offline&prompt=consent`;

  res.json({ authUrl, state });
};

export const handleGmailCallback: RequestHandler = async (req, res) => {
  try {
    const validation = GmailOAuthSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    const { code, redirectUri } = validation.data;
    const tokenResponse = await exchangeGmailCode(code, redirectUri);
    
    if (tokenResponse.error) {
      return res.status(400).json({ error: 'Failed to exchange code for token', details: tokenResponse });
    }

    // Get user profile
    const userResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        'Authorization': `Bearer ${tokenResponse.access_token}`,
      },
    });
    const userProfile = await userResponse.json();

    const gmailIntegration: GmailIntegration = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      emailAddress: userProfile.emailAddress,
      displayName: userProfile.emailAddress,
      connected: true,
      lastSync: new Date().toISOString(),
      scopes: tokenResponse.scope?.split(' ') || []
    };

    emailProviders.gmail.push(gmailIntegration);

    res.json({ 
      success: true, 
      user: {
        email: gmailIntegration.emailAddress,
        name: gmailIntegration.displayName
      }
    });

  } catch (error) {
    console.error('Gmail OAuth error:', error);
    res.status(500).json({ error: 'Internal server error during Gmail integration' });
  }
};

export const syncOutlookEmails: RequestHandler = async (req, res) => {
  try {
    const integration = emailProviders.outlook[0]; // Get first connected account
    if (!integration) {
      return res.status(404).json({ error: 'No Outlook integration found' });
    }

    const emails = await getOutlookEmails(integration.accessToken, integration.userPrincipalName);
    
    // Update last sync time
    integration.lastSync = new Date().toISOString();

    res.json({
      success: true,
      emails,
      count: emails.length,
      lastSync: integration.lastSync
    });

  } catch (error) {
    console.error('Outlook sync error:', error);
    res.status(500).json({ error: 'Failed to sync Outlook emails' });
  }
};

export const syncGmailEmails: RequestHandler = async (req, res) => {
  try {
    const integration = emailProviders.gmail[0]; // Get first connected account
    if (!integration) {
      return res.status(404).json({ error: 'No Gmail integration found' });
    }

    const emails = await getGmailEmails(integration.accessToken);
    
    // Update last sync time
    integration.lastSync = new Date().toISOString();

    res.json({
      success: true,
      emails,
      count: emails.length,
      lastSync: integration.lastSync
    });

  } catch (error) {
    console.error('Gmail sync error:', error);
    res.status(500).json({ error: 'Failed to sync Gmail emails' });
  }
};

export const getEmailProviderStatus: RequestHandler = (req, res) => {
  const status = {
    outlook: {
      connected: emailProviders.outlook.length > 0,
      accounts: emailProviders.outlook.length,
      lastSync: emailProviders.outlook[0]?.lastSync
    },
    gmail: {
      connected: emailProviders.gmail.length > 0,
      accounts: emailProviders.gmail.length,
      lastSync: emailProviders.gmail[0]?.lastSync
    },
    whatsapp: {
      connected: emailProviders.whatsapp.length > 0,
      accounts: emailProviders.whatsapp.length,
      lastSync: emailProviders.whatsapp[0]?.lastSync
    }
  };

  res.json(status);
};
