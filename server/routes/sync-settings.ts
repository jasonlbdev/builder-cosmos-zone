import { Request, Response } from "express";

interface SyncSettings {
  autoSync?: boolean;
  interval?: number;
  realTimeNotifications?: boolean;
  backgroundSync?: boolean;
  forceRefresh?: boolean;
}

// In-memory storage for demo purposes
// In production, this would be stored in a database per customer
let syncSettings: Record<string, SyncSettings> = {};

export const updateSyncSettings = async (req: Request, res: Response) => {
  try {
    const customerId = (req.headers["x-customer-id"] as string) || "default";
    const settings: SyncSettings = req.body;

    // Update settings
    syncSettings[customerId] = {
      ...syncSettings[customerId],
      ...settings,
    };

    // Handle immediate actions
    if (settings.autoSync !== undefined) {
      if (settings.autoSync) {
        console.info(`[SYNC] Enabling auto-sync for customer ${customerId} with interval ${settings.interval || 5} minutes`);
        // In production: Set up recurring sync job
        triggerImmediateSync(customerId);
      } else {
        console.info(`[SYNC] Disabling auto-sync for customer ${customerId}`);
        // In production: Cancel recurring sync job
      }
    }

    if (settings.realTimeNotifications !== undefined) {
      if (settings.realTimeNotifications) {
        console.info(`[SYNC] Enabling real-time notifications for customer ${customerId}`);
        // In production: Set up WebSocket connections or push notifications
      } else {
        console.info(`[SYNC] Disabling real-time notifications for customer ${customerId}`);
      }
    }

    if (settings.backgroundSync !== undefined) {
      if (settings.backgroundSync) {
        console.info(`[SYNC] Enabling background sync for customer ${customerId}`);
        // In production: Register service worker sync events
      } else {
        console.info(`[SYNC] Disabling background sync for customer ${customerId}`);
      }
    }

    if (settings.forceRefresh) {
      console.info(`[SYNC] Force refresh requested for customer ${customerId}`);
      await forceRefreshAllIntegrations(customerId);
    }

    res.json({
      success: true,
      settings: syncSettings[customerId],
    });
  } catch (error) {
    console.error("Sync settings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update sync settings",
    });
  }
};

export const getSyncSettings = async (req: Request, res: Response) => {
  try {
    const customerId = (req.headers["x-customer-id"] as string) || "default";

    const customerSettings = syncSettings[customerId] || {
      autoSync: true,
      interval: 5,
      realTimeNotifications: true,
      backgroundSync: false,
    };

    res.json({
      success: true,
      settings: customerSettings,
    });
  } catch (error) {
    console.error("Get sync settings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get sync settings",
    });
  }
};

const triggerImmediateSync = async (customerId: string) => {
  try {
    console.info(`[SYNC] Triggering immediate sync for customer ${customerId}`);

    // Get all connected integrations for this customer
    const integrations = await getCustomerIntegrations(customerId);

    // Sync each integration
    for (const integration of integrations) {
      try {
        await syncIntegration(integration);
      } catch (error) {
        console.error(`Failed to sync ${integration.platform}:`, error);
      }
    }

    console.info(`[SYNC] Immediate sync completed for customer ${customerId}`);
  } catch (error) {
    console.error("Immediate sync error:", error);
  }
};

const forceRefreshAllIntegrations = async (customerId: string) => {
  try {
    console.info(`[SYNC] Force refreshing all integrations for customer ${customerId}`);

    // Clear any cached data
    await clearIntegrationCache(customerId);

    // Re-authenticate all integrations
    const integrations = await getCustomerIntegrations(customerId);

    for (const integration of integrations) {
      try {
        await refreshIntegrationAuth(integration);
        await syncIntegration(integration, { forceRefresh: true });
      } catch (error) {
        console.error(`Failed to refresh ${integration.platform}:`, error);
      }
    }

    console.info(`[SYNC] Force refresh completed for customer ${customerId}`);
  } catch (error) {
    console.error("Force refresh error:", error);
  }
};

// Mock functions - in production these would interact with actual services
const getCustomerIntegrations = async (customerId: string) => {
  // Mock data - in production, fetch from database
  return [
    { id: "1", platform: "outlook", connected: true },
    { id: "2", platform: "gmail", connected: true },
    { id: "3", platform: "slack", connected: true },
  ];
};

const syncIntegration = async (
  integration: any,
  options: { forceRefresh?: boolean } = {},
) => {
  console.info(`[SYNC] Syncing ${integration.platform}${options.forceRefresh ? " (force refresh)" : ""}`);

  switch (integration.platform.toLowerCase()) {
    case "outlook":
      await syncOutlook(integration, options);
      break;
    case "gmail":
      await syncGmail(integration, options);
      break;
    case "slack":
      await syncSlack(integration, options);
      break;
    case "whatsapp":
      await syncWhatsApp(integration, options);
      break;
    case "telegram":
      await syncTelegram(integration, options);
      break;
    default:
      console.warn(`Sync not implemented for platform: ${integration.platform}`);
  }
};

const syncOutlook = async (integration: any, options: any) => {
  try {
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages`, {
      headers: {
        'Authorization': `Bearer ${integration.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Outlook sync failed: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, count: data.value?.length || 0 };
  } catch (error) {
    console.error('Outlook sync error:', error);
    throw error;
  }
};

const syncGmail = async (integration: any, options: any) => {
  try {
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50`, {
      headers: {
        'Authorization': `Bearer ${integration.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Gmail sync failed: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, count: data.messages?.length || 0 };
  } catch (error) {
    console.error('Gmail sync error:', error);
    throw error;
  }
};

const syncSlack = async (integration: any, options: any) => {
  try {
    const response = await fetch(`https://slack.com/api/conversations.history?channel=${integration.channelId}&limit=50`, {
      headers: {
        'Authorization': `Bearer ${integration.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Slack sync failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }
    
    return { success: true, count: data.messages?.length || 0 };
  } catch (error) {
    console.error('Slack sync error:', error);
    throw error;
  }
};

const syncWhatsApp = async (integration: any, options: any) => {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${integration.phoneNumberId}/messages`, {
      headers: {
        'Authorization': `Bearer ${integration.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`WhatsApp sync failed: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, count: data.data?.length || 0 };
  } catch (error) {
    console.error('WhatsApp sync error:', error);
    throw error;
  }
};

const syncTelegram = async (integration: any, options: any) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${integration.botToken}/getUpdates?limit=50`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Telegram sync failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }
    
    return { success: true, count: data.result?.length || 0 };
  } catch (error) {
    console.error('Telegram sync error:', error);
    throw error;
  }
};

const clearIntegrationCache = async (customerId: string) => {
  try {
    // Production: Clear cache storage (Redis, Memcached, etc.)
    // For now, clear any in-memory caches
    const cacheKey = `integrations:${customerId}`;
    
    // If using Redis:
    // await redisClient.del(cacheKey);
    
    // If using in-memory cache:
    if (global.integrationCache) {
      delete global.integrationCache[cacheKey];
    }
    
    return { success: true };
  } catch (error) {
    console.error('Cache clear error:', error);
    throw error;
  }
};

const refreshIntegrationAuth = async (integration: any) => {
  try {
    switch (integration.platform) {
      case "outlook":
        // Refresh Microsoft Graph token
        const outlookResponse = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.OUTLOOK_CLIENT_ID || "",
            client_secret: process.env.OUTLOOK_CLIENT_SECRET || "",
            refresh_token: integration.refreshToken,
            grant_type: "refresh_token"
          })
        });
        
        if (!outlookResponse.ok) {
          throw new Error(`Outlook token refresh failed: ${outlookResponse.status}`);
        }
        
        const outlookData = await outlookResponse.json();
        integration.accessToken = outlookData.access_token;
        integration.refreshToken = outlookData.refresh_token || integration.refreshToken;
        break;
        
      case "gmail":
        // Refresh Google OAuth token
        const gmailResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GMAIL_CLIENT_ID || "",
            client_secret: process.env.GMAIL_CLIENT_SECRET || "",
            refresh_token: integration.refreshToken,
            grant_type: "refresh_token"
          })
        });
        
        if (!gmailResponse.ok) {
          throw new Error(`Gmail token refresh failed: ${gmailResponse.status}`);
        }
        
        const gmailData = await gmailResponse.json();
        integration.accessToken = gmailData.access_token;
        break;
        
      case "slack":
        // Slack tokens typically don't expire, but check if refresh is needed
        if (integration.refreshToken) {
          const slackResponse = await fetch("https://slack.com/api/oauth.v2.access", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.SLACK_CLIENT_ID || "",
              client_secret: process.env.SLACK_CLIENT_SECRET || "",
              refresh_token: integration.refreshToken,
              grant_type: "refresh_token"
            })
          });
          
          if (slackResponse.ok) {
            const slackData = await slackResponse.json();
            if (slackData.ok) {
              integration.accessToken = slackData.access_token;
            }
          }
        }
        break;
        
      default:
        throw new Error(`Token refresh not implemented for ${integration.platform}`);
    }
    
    return { success: true, accessToken: integration.accessToken };
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

// Auto-sync scheduler
const scheduledSyncs: Record<string, NodeJS.Timeout> = {};

export const scheduleAutoSync = (
  customerId: string,
  intervalMinutes: number,
) => {
  // Clear existing schedule
  if (scheduledSyncs[customerId]) {
    clearInterval(scheduledSyncs[customerId]);
  }

  // Set up new schedule
  scheduledSyncs[customerId] = setInterval(
    () => {
      triggerImmediateSync(customerId);
    },
    intervalMinutes * 60 * 1000,
  );

  console.info(`[SYNC] Scheduled auto-sync for customer ${customerId} every ${intervalMinutes} minutes`);
};

export const cancelAutoSync = (customerId: string) => {
  if (scheduledSyncs[customerId]) {
    clearInterval(scheduledSyncs[customerId]);
    delete scheduledSyncs[customerId];
    console.info(`[SYNC] Cancelled auto-sync for customer ${customerId}`);
  }
};

// Real-time notification handlers
export const enableRealTimeNotifications = async (customerId: string) => {
  console.info(`[SYNC] Setting up real-time notifications for customer ${customerId}`);
  // In production: Set up WebSocket connections, push notifications, etc.
};

export const disableRealTimeNotifications = async (customerId: string) => {
  console.info(`[SYNC] Disabling real-time notifications for customer ${customerId}`);
  // In production: Clean up WebSocket connections, unregister push notifications, etc.
};
