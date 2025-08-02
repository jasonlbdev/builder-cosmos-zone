import { RequestHandler } from "express";
import puppeteer, { Browser, Page } from "puppeteer";
import { promisify } from "util";

interface BrowserSession {
  sessionId: string;
  browser: Browser;
  page: Page;
  platform: 'whatsapp' | 'telegram';
  status: 'launching' | 'waiting_qr' | 'scanning' | 'connected' | 'disconnected' | 'error';
  createdAt: number;
  lastActivity: number;
  userAgent?: string;
  phoneNumber?: string;
}

// Active browser sessions
const activeSessions = new Map<string, BrowserSession>();

// Session cleanup after 10 minutes of inactivity
const SESSION_TIMEOUT = 10 * 60 * 1000;

// Browser configuration for WhatsApp Web and Telegram Web
const BROWSER_CONFIG = {
  headless: true, // Set to false for debugging
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
  ],
  defaultViewport: {
    width: 1366,
    height: 768,
  },
};

// WhatsApp Web selectors
const WHATSAPP_SELECTORS = {
  qrCode: '[data-ref] canvas, [data-testid="qr-code"]',
  qrCodeImg: '[data-ref] canvas',
  loginSuccess: '[data-testid="chats"], [data-ascii=":,\']"]',
  chatList: '[data-testid="chat-list"]',
  messageInput: '[data-testid="conversation-compose-box-input"]',
  sendButton: '[data-testid="compose-btn-send"]',
  profileName: '[data-testid="default-user"] span[title]',
  phoneNumberDisplay: '[data-testid="default-user"] span:not([title])',
};

// Telegram Web selectors  
const TELEGRAM_SELECTORS = {
  qrCode: '.qr-container canvas, .auth-qr-form canvas',
  phoneInput: 'input[name="phone_number"], input[type="tel"]',
  codeInput: 'input[name="phone_code"]',
  loginSuccess: '.chat-list, .sidebar-left',
  chatList: '.chat-list',
  messageInput: '.input-message-input',
  sendButton: '.btn-send',
  profileName: '.profile-name, .user-name',
};

class HeadlessBrowserService {
  private sessionId: string;
  private platform: 'whatsapp' | 'telegram';

  constructor(sessionId: string, platform: 'whatsapp' | 'telegram') {
    this.sessionId = sessionId;
    this.platform = platform;
  }

  async launchBrowser(): Promise<BrowserSession> {
    try {
      console.info(`[BROWSER] Launching ${this.platform} session: ${this.sessionId}`);
      
      const browser = await puppeteer.launch(BROWSER_CONFIG);
      const page = await browser.newPage();

      // Set a realistic user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Set additional headers to appear more human-like
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      });

      const session: BrowserSession = {
        sessionId: this.sessionId,
        browser,
        page,
        platform: this.platform,
        status: 'launching',
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };

      activeSessions.set(this.sessionId, session);
      return session;
    } catch (error) {
      console.error(`[BROWSER] Failed to launch ${this.platform} browser:`, error);
      throw error;
    }
  }

  async navigateToWhatsApp(session: BrowserSession): Promise<void> {
    try {
      console.info(`[WHATSAPP] Navigating to WhatsApp Web`);
      
      await session.page.goto('https://web.whatsapp.com', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      session.status = 'waiting_qr';
      session.lastActivity = Date.now();

      // Wait for QR code to appear
      await session.page.waitForSelector(WHATSAPP_SELECTORS.qrCode, {
        timeout: 30000,
      });

      console.info(`[WHATSAPP] QR code loaded for session: ${this.sessionId}`);
    } catch (error) {
      session.status = 'error';
      console.error(`[WHATSAPP] Navigation failed:`, error);
      throw error;
    }
  }

  async navigateToTelegram(session: BrowserSession): Promise<void> {
    try {
      console.info(`[TELEGRAM] Navigating to Telegram Web`);
      
      await session.page.goto('https://web.telegram.org/k/', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      session.status = 'waiting_qr';
      session.lastActivity = Date.now();

      // Wait for either QR code or phone input
      await Promise.race([
        session.page.waitForSelector(TELEGRAM_SELECTORS.qrCode, { timeout: 15000 }),
        session.page.waitForSelector(TELEGRAM_SELECTORS.phoneInput, { timeout: 15000 }),
      ]);

      console.info(`[TELEGRAM] Login page loaded for session: ${this.sessionId}`);
    } catch (error) {
      session.status = 'error';
      console.error(`[TELEGRAM] Navigation failed:`, error);
      throw error;
    }
  }

  async getQRCode(session: BrowserSession): Promise<string | null> {
    try {
      const selectors = session.platform === 'whatsapp' 
        ? WHATSAPP_SELECTORS 
        : TELEGRAM_SELECTORS;

      // Wait for QR code to be present
      await session.page.waitForSelector(selectors.qrCode, { timeout: 10000 });

      // Take screenshot of QR code area
      const qrElement = await session.page.$(selectors.qrCode);
      if (!qrElement) {
        return null;
      }

      const screenshot = await qrElement.screenshot({
        encoding: 'base64',
        type: 'png',
      });

      session.lastActivity = Date.now();
      return `data:image/png;base64,${screenshot}`;
    } catch (error) {
      console.error(`[${session.platform.toUpperCase()}] Failed to get QR code:`, error);
      return null;
    }
  }

  async checkLoginStatus(session: BrowserSession): Promise<{
    connected: boolean;
    status: string;
    profileInfo?: any;
  }> {
    try {
      const selectors = session.platform === 'whatsapp' 
        ? WHATSAPP_SELECTORS 
        : TELEGRAM_SELECTORS;

      // Check if we're logged in by looking for chat interface
      try {
        await session.page.waitForSelector(selectors.loginSuccess, { timeout: 5000 });
        
        session.status = 'connected';
        session.lastActivity = Date.now();

        // Try to extract profile information
        let profileInfo = {};
        try {
          if (session.platform === 'whatsapp') {
            const profileName = await session.page.$eval(
              WHATSAPP_SELECTORS.profileName,
              el => el.textContent
            ).catch(() => 'WhatsApp User');

            profileInfo = {
              name: profileName,
              platform: 'WhatsApp Web',
              connected: true,
            };
          } else {
            const profileName = await session.page.$eval(
              TELEGRAM_SELECTORS.profileName,
              el => el.textContent
            ).catch(() => 'Telegram User');

            profileInfo = {
              name: profileName,
              platform: 'Telegram Web',
              connected: true,
            };
          }
        } catch (profileError) {
          console.warn(`[${session.platform.toUpperCase()}] Could not extract profile info:`, profileError);
        }

        return {
          connected: true,
          status: 'connected',
          profileInfo,
        };
      } catch (waitError) {
        // Still waiting for login
        return {
          connected: false,
          status: session.status,
        };
      }
    } catch (error) {
      console.error(`[${session.platform.toUpperCase()}] Login status check failed:`, error);
      session.status = 'error';
      return {
        connected: false,
        status: 'error',
      };
    }
  }

  async getMessages(session: BrowserSession, chatName?: string): Promise<any[]> {
    try {
      if (session.status !== 'connected') {
        throw new Error('Session not connected');
      }

      const selectors = session.platform === 'whatsapp' 
        ? WHATSAPP_SELECTORS 
        : TELEGRAM_SELECTORS;

      // Wait for chat list
      await session.page.waitForSelector(selectors.chatList, { timeout: 10000 });

      // Get recent messages (simplified implementation)
      const messages = await session.page.evaluate(() => {
        // This would need platform-specific selectors for actual message extraction
        return [
          {
            id: 'sample_1',
            sender: 'Contact 1',
            content: 'Sample message from headless browser integration',
            timestamp: new Date().toISOString(),
            platform: 'headless_web',
          }
        ];
      });

      session.lastActivity = Date.now();
      return messages;
    } catch (error) {
      console.error(`[${session.platform.toUpperCase()}] Failed to get messages:`, error);
      return [];
    }
  }

  async cleanup(session: BrowserSession): Promise<void> {
    try {
      console.info(`[BROWSER] Cleaning up session: ${this.sessionId}`);
      
      if (session.browser) {
        await session.browser.close();
      }
      
      activeSessions.delete(this.sessionId);
    } catch (error) {
      console.error(`[BROWSER] Cleanup failed:`, error);
    }
  }
}

// Session cleanup task
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of activeSessions) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      console.info(`[BROWSER] Cleaning up inactive session: ${sessionId}`);
      const service = new HeadlessBrowserService(sessionId, session.platform);
      service.cleanup(session);
    }
  }
}, 60000); // Check every minute

// API Endpoints

export const initiateWhatsAppBrowser: RequestHandler = async (req, res) => {
  try {
    const sessionId = `wa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const service = new HeadlessBrowserService(sessionId, 'whatsapp');

    const session = await service.launchBrowser();
    await service.navigateToWhatsApp(session);

    res.json({
      success: true,
      sessionId,
      message: 'WhatsApp Web browser session started',
      instructions: [
        'Scan the QR code with your WhatsApp mobile app',
        'Go to WhatsApp > Settings > Linked Devices',
        'Tap "Link a Device" and scan the code',
        'Keep your phone connected to the internet',
      ],
      status: session.status,
    });
  } catch (error) {
    console.error('[WHATSAPP] Browser initiation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start WhatsApp Web session',
      message: error.message,
    });
  }
};

export const initiateTelegramBrowser: RequestHandler = async (req, res) => {
  try {
    const sessionId = `tg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const service = new HeadlessBrowserService(sessionId, 'telegram');

    const session = await service.launchBrowser();
    await service.navigateToTelegram(session);

    res.json({
      success: true,
      sessionId,
      message: 'Telegram Web browser session started',
      instructions: [
        'Option 1: Scan QR code with Telegram mobile app (Settings > Devices > Link Desktop Device)',
        'Option 2: Enter your phone number for SMS verification',
        'Keep your primary device connected',
      ],
      status: session.status,
    });
  } catch (error) {
    console.error('[TELEGRAM] Browser initiation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start Telegram Web session',
      message: error.message,
    });
  }
};

export const getBrowserQRCode: RequestHandler = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        message: 'Browser session may have expired or been cleaned up',
      });
    }

    const service = new HeadlessBrowserService(sessionId, session.platform);
    const qrCodeData = await service.getQRCode(session);

    if (!qrCodeData) {
      return res.status(400).json({
        success: false,
        error: 'QR code not available',
        message: 'QR code may not be loaded yet or session may be in different state',
        status: session.status,
      });
    }

    res.json({
      success: true,
      qrCode: qrCodeData,
      sessionId,
      platform: session.platform,
      status: session.status,
      expiresIn: '5 minutes',
    });
  } catch (error) {
    console.error('[BROWSER] QR code retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get QR code',
      message: error.message,
    });
  }
};

export const checkBrowserStatus: RequestHandler = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        connected: false,
        status: 'not_found',
      });
    }

    const service = new HeadlessBrowserService(sessionId, session.platform);
    const statusResult = await service.checkLoginStatus(session);

    res.json({
      success: true,
      sessionId,
      platform: session.platform,
      ...statusResult,
      lastActivity: session.lastActivity,
      sessionAge: Date.now() - session.createdAt,
    });
  } catch (error) {
    console.error('[BROWSER] Status check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check session status',
      message: error.message,
    });
  }
};

export const getBrowserMessages: RequestHandler = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { chatName, limit = 20 } = req.query;
    
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    if (session.status !== 'connected') {
      return res.status(400).json({
        success: false,
        error: 'Session not connected',
        status: session.status,
        message: 'Please complete the login process first',
      });
    }

    const service = new HeadlessBrowserService(sessionId, session.platform);
    const messages = await service.getMessages(session, chatName as string);

    res.json({
      success: true,
      messages: messages.slice(0, Number(limit)),
      platform: session.platform,
      sessionId,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[BROWSER] Message retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get messages',
      message: error.message,
    });
  }
};

export const closeBrowserSession: RequestHandler = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    const service = new HeadlessBrowserService(sessionId, session.platform);
    await service.cleanup(session);

    res.json({
      success: true,
      message: `${session.platform} browser session closed`,
      sessionId,
    });
  } catch (error) {
    console.error('[BROWSER] Session cleanup failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to close session',
      message: error.message,
    });
  }
};

export const getBrowserSessions: RequestHandler = (req, res) => {
  const sessions = Array.from(activeSessions.values()).map(session => ({
    sessionId: session.sessionId,
    platform: session.platform,
    status: session.status,
    createdAt: session.createdAt,
    lastActivity: session.lastActivity,
    sessionAge: Date.now() - session.createdAt,
    isActive: Date.now() - session.lastActivity < SESSION_TIMEOUT,
  }));

  res.json({
    success: true,
    sessions,
    total: sessions.length,
    active: sessions.filter(s => s.isActive).length,
  });
};