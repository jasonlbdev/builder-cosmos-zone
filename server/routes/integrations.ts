import { RequestHandler } from "express";
import { z } from "zod";

// Types for different integrations
export interface SlackIntegration {
  workspaceId: string;
  workspaceName: string;
  accessToken: string;
  botToken: string;
  teamId: string;
  channels: SlackChannel[];
  webhookUrl?: string;
  connected: boolean;
  lastSync: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
  members: number;
  enabled: boolean;
  lastMessage?: string;
  unreadCount: number;
}

export interface TelegramIntegration {
  botToken: string;
  webhookUrl?: string;
  chats: TelegramChat[];
  connected: boolean;
  lastSync: string;
}

export interface TelegramChat {
  id: string;
  title: string;
  type: 'private' | 'group' | 'channel';
  enabled: boolean;
  unreadCount: number;
}

export interface InstagramIntegration {
  accessToken: string;
  userId: string;
  username: string;
  conversations: InstagramConversation[];
  connected: boolean;
  lastSync: string;
}

export interface InstagramConversation {
  id: string;
  participants: string[];
  enabled: boolean;
  unreadCount: number;
  lastMessage?: string;
}

export interface FacebookIntegration {
  accessToken: string;
  pageId: string;
  pageName: string;
  conversations: FacebookConversation[];
  connected: boolean;
  lastSync: string;
}

export interface FacebookConversation {
  id: string;
  participants: string[];
  enabled: boolean;
  unreadCount: number;
  lastMessage?: string;
}

// Validation schemas
const SlackOAuthSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
  redirectUri: z.string().url()
});

const TelegramBotSchema = z.object({
  botToken: z.string().regex(/^\d+:[A-Za-z0-9_-]+$/),
  webhookUrl: z.string().url().optional()
});

const InstagramOAuthSchema = z.object({
  code: z.string(),
  redirectUri: z.string().url()
});

const FacebookOAuthSchema = z.object({
  code: z.string(),
  redirectUri: z.string().url()
});

// Mock database - in production, this would be replaced with actual database
let integrationsDB = {
  slack: [] as SlackIntegration[],
  telegram: [] as TelegramIntegration[],
  instagram: [] as InstagramIntegration[],
  facebook: [] as FacebookIntegration[]
};

// Helper functions for external API calls
const exchangeSlackCode = async (code: string, redirectUri: string) => {
  // In production, this would call Slack's OAuth API
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID || '',
      client_secret: process.env.SLACK_CLIENT_SECRET || '',
      code,
      redirect_uri: redirectUri,
    }),
  });
  return response.json();
};

const getSlackChannels = async (token: string) => {
  // In production, this would call Slack's conversations.list API
  const response = await fetch('https://slack.com/api/conversations.list', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};

const validateTelegramBot = async (token: string) => {
  // In production, this would call Telegram's getMe API
  const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  return response.json();
};

const exchangeInstagramCode = async (code: string, redirectUri: string) => {
  // In production, this would call Instagram's OAuth API
  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID || '',
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET || '',
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }),
  });
  return response.json();
};

const exchangeFacebookCode = async (code: string, redirectUri: string) => {
  // In production, this would call Facebook's OAuth API
  const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${redirectUri}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${code}`);
  return response.json();
};

// API Endpoints

export const getIntegrationStatus: RequestHandler = (req, res) => {
  const status = {
    slack: {
      connected: integrationsDB.slack.length > 0,
      workspaces: integrationsDB.slack.length,
      totalChannels: integrationsDB.slack.reduce((acc, ws) => acc + ws.channels.length, 0),
      unreadMessages: integrationsDB.slack.reduce((acc, ws) => 
        acc + ws.channels.reduce((chAcc, ch) => chAcc + ch.unreadCount, 0), 0
      )
    },
    telegram: {
      connected: integrationsDB.telegram.length > 0,
      bots: integrationsDB.telegram.length,
      totalChats: integrationsDB.telegram.reduce((acc, bot) => acc + bot.chats.length, 0),
      unreadMessages: integrationsDB.telegram.reduce((acc, bot) => 
        acc + bot.chats.reduce((chAcc, ch) => chAcc + ch.unreadCount, 0), 0
      )
    },
    instagram: {
      connected: integrationsDB.instagram.length > 0,
      accounts: integrationsDB.instagram.length,
      totalConversations: integrationsDB.instagram.reduce((acc, ig) => acc + ig.conversations.length, 0),
      unreadMessages: integrationsDB.instagram.reduce((acc, ig) => 
        acc + ig.conversations.reduce((convAcc, conv) => convAcc + conv.unreadCount, 0), 0
      )
    },
    facebook: {
      connected: integrationsDB.facebook.length > 0,
      pages: integrationsDB.facebook.length,
      totalConversations: integrationsDB.facebook.reduce((acc, fb) => acc + fb.conversations.length, 0),
      unreadMessages: integrationsDB.facebook.reduce((acc, fb) => 
        acc + fb.conversations.reduce((convAcc, conv) => convAcc + conv.unreadCount, 0), 0
      )
    }
  };

  res.json(status);
};

// Slack Integration Endpoints
export const initiateSlackOAuth: RequestHandler = (req, res) => {
  const clientId = process.env.SLACK_CLIENT_ID;
  const redirectUri = `${req.protocol}://${req.get('host')}/api/integrations/slack/callback`;
  const scopes = 'channels:read,chat:write,users:read,groups:read,im:read,mpim:read';
  const state = Math.random().toString(36).substring(7);

  const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  res.json({ authUrl, state });
};

export const handleSlackCallback: RequestHandler = async (req, res) => {
  try {
    const validation = SlackOAuthSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request parameters', details: validation.error });
    }

    const { code, redirectUri } = validation.data;

    // Exchange code for access token
    const tokenResponse = await exchangeSlackCode(code, redirectUri);
    
    if (!tokenResponse.ok) {
      return res.status(400).json({ error: 'Failed to exchange code for token', details: tokenResponse });
    }

    // Get workspace channels
    const channelsResponse = await getSlackChannels(tokenResponse.access_token);
    
    const slackIntegration: SlackIntegration = {
      workspaceId: tokenResponse.team.id,
      workspaceName: tokenResponse.team.name,
      accessToken: tokenResponse.access_token,
      botToken: tokenResponse.access_token, // In v2, they're the same
      teamId: tokenResponse.team.id,
      channels: channelsResponse.channels?.map((ch: any) => ({
        id: ch.id,
        name: ch.name,
        isPrivate: ch.is_private,
        members: ch.num_members || 0,
        enabled: true,
        unreadCount: 0
      })) || [],
      connected: true,
      lastSync: new Date().toISOString()
    };

    integrationsDB.slack.push(slackIntegration);

    res.json({ 
      success: true, 
      workspace: {
        id: slackIntegration.workspaceId,
        name: slackIntegration.workspaceName,
        channels: slackIntegration.channels.length
      }
    });

  } catch (error) {
    console.error('Slack OAuth error:', error);
    res.status(500).json({ error: 'Internal server error during Slack integration' });
  }
};

export const getSlackWorkspaces: RequestHandler = (req, res) => {
  const workspaces = integrationsDB.slack.map(ws => ({
    id: ws.workspaceId,
    name: ws.workspaceName,
    teamId: ws.teamId,
    channelCount: ws.channels.length,
    enabledChannels: ws.channels.filter(ch => ch.enabled).length,
    lastSync: ws.lastSync,
    connected: ws.connected
  }));

  res.json({ workspaces });
};

export const updateSlackChannel: RequestHandler = (req, res) => {
  const { workspaceId, channelId } = req.params;
  const { enabled } = req.body;

  const workspace = integrationsDB.slack.find(ws => ws.workspaceId === workspaceId);
  if (!workspace) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  const channel = workspace.channels.find(ch => ch.id === channelId);
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  channel.enabled = enabled;
  res.json({ success: true });
};

// Telegram Integration Endpoints
export const connectTelegramBot: RequestHandler = async (req, res) => {
  try {
    const validation = TelegramBotSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid bot token format', details: validation.error });
    }

    const { botToken, webhookUrl } = validation.data;

    // Validate bot token
    const botInfo = await validateTelegramBot(botToken);
    
    if (!botInfo.ok) {
      return res.status(400).json({ error: 'Invalid bot token' });
    }

    const telegramIntegration: TelegramIntegration = {
      botToken,
      webhookUrl,
      chats: [], // Would be populated by getting updates
      connected: true,
      lastSync: new Date().toISOString()
    };

    integrationsDB.telegram.push(telegramIntegration);

    res.json({ 
      success: true, 
      bot: {
        username: botInfo.result.username,
        firstName: botInfo.result.first_name
      }
    });

  } catch (error) {
    console.error('Telegram bot connection error:', error);
    res.status(500).json({ error: 'Internal server error during Telegram integration' });
  }
};

// Instagram Integration Endpoints
export const initiateInstagramOAuth: RequestHandler = (req, res) => {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = `${req.protocol}://${req.get('host')}/api/integrations/instagram/callback`;
  const scopes = 'user_profile,user_media';

  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;

  res.json({ authUrl });
};

export const handleInstagramCallback: RequestHandler = async (req, res) => {
  try {
    const validation = InstagramOAuthSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request parameters', details: validation.error });
    }

    const { code, redirectUri } = validation.data;

    // Exchange code for access token
    const tokenResponse = await exchangeInstagramCode(code, redirectUri);
    
    if (!tokenResponse.access_token) {
      return res.status(400).json({ error: 'Failed to exchange code for token' });
    }

    const instagramIntegration: InstagramIntegration = {
      accessToken: tokenResponse.access_token,
      userId: tokenResponse.user_id,
      username: tokenResponse.user_id, // Would get actual username from API
      conversations: [], // Would be populated by getting conversations
      connected: true,
      lastSync: new Date().toISOString()
    };

    integrationsDB.instagram.push(instagramIntegration);

    res.json({ 
      success: true, 
      account: {
        userId: instagramIntegration.userId,
        username: instagramIntegration.username
      }
    });

  } catch (error) {
    console.error('Instagram OAuth error:', error);
    res.status(500).json({ error: 'Internal server error during Instagram integration' });
  }
};

// Facebook Integration Endpoints
export const initiateFacebookOAuth: RequestHandler = (req, res) => {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const redirectUri = `${req.protocol}://${req.get('host')}/api/integrations/facebook/callback`;
  const scopes = 'pages_manage_metadata,pages_read_engagement,pages_messaging';

  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}`;

  res.json({ authUrl });
};

export const handleFacebookCallback: RequestHandler = async (req, res) => {
  try {
    const validation = FacebookOAuthSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request parameters', details: validation.error });
    }

    const { code, redirectUri } = validation.data;

    // Exchange code for access token
    const tokenResponse = await exchangeFacebookCode(code, redirectUri);
    
    if (!tokenResponse.access_token) {
      return res.status(400).json({ error: 'Failed to exchange code for token' });
    }

    // Get pages managed by user
    const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenResponse.access_token}`);
    const pagesData = await pagesResponse.json();

    // For simplicity, connect the first page
    const firstPage = pagesData.data?.[0];
    if (!firstPage) {
      return res.status(400).json({ error: 'No Facebook pages found' });
    }

    const facebookIntegration: FacebookIntegration = {
      accessToken: firstPage.access_token,
      pageId: firstPage.id,
      pageName: firstPage.name,
      conversations: [], // Would be populated by getting conversations
      connected: true,
      lastSync: new Date().toISOString()
    };

    integrationsDB.facebook.push(facebookIntegration);

    res.json({ 
      success: true, 
      page: {
        id: facebookIntegration.pageId,
        name: facebookIntegration.pageName
      }
    });

  } catch (error) {
    console.error('Facebook OAuth error:', error);
    res.status(500).json({ error: 'Internal server error during Facebook integration' });
  }
};

// Generic Integration Management
export const disconnectIntegration: RequestHandler = (req, res) => {
  const { platform, id } = req.params;

  switch (platform) {
    case 'slack':
      integrationsDB.slack = integrationsDB.slack.filter(ws => ws.workspaceId !== id);
      break;
    case 'telegram':
      integrationsDB.telegram = integrationsDB.telegram.filter((_, index) => index.toString() !== id);
      break;
    case 'instagram':
      integrationsDB.instagram = integrationsDB.instagram.filter(ig => ig.userId !== id);
      break;
    case 'facebook':
      integrationsDB.facebook = integrationsDB.facebook.filter(fb => fb.pageId !== id);
      break;
    default:
      return res.status(400).json({ error: 'Invalid platform' });
  }

  res.json({ success: true, message: `${platform} integration disconnected` });
};

export const syncIntegration: RequestHandler = async (req, res) => {
  const { platform, id } = req.params;

  try {
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update last sync timestamp
    const now = new Date().toISOString();
    
    switch (platform) {
      case 'slack':
        const workspace = integrationsDB.slack.find(ws => ws.workspaceId === id);
        if (workspace) {
          workspace.lastSync = now;
        }
        break;
      case 'telegram':
        if (integrationsDB.telegram[parseInt(id)]) {
          integrationsDB.telegram[parseInt(id)].lastSync = now;
        }
        break;
      // Add other platforms as needed
    }

    res.json({ 
      success: true, 
      message: `${platform} integration synced successfully`,
      lastSync: now
    });

  } catch (error) {
    console.error(`${platform} sync error:`, error);
    res.status(500).json({ error: `Failed to sync ${platform} integration` });
  }
};
