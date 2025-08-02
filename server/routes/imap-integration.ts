import { RequestHandler } from "express";
import Imap from "imap";
import { simpleParser } from "mailparser";
import { promisify } from "util";

interface IMAPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  tls?: boolean;
  authTimeout?: number;
  connTimeout?: number;
}

interface ParsedEmail {
  messageId: string;
  from: string;
  to: string[];
  cc: string[];
  subject: string;
  date: Date;
  text: string;
  html: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
  headers: Map<string, string>;
}

// Common IMAP configurations for major providers
const IMAP_PROVIDERS = {
  gmail: {
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    authTimeout: 3000,
    connTimeout: 5000,
  },
  outlook: {
    host: 'outlook.office365.com',
    port: 993,
    secure: true,
    authTimeout: 3000,
    connTimeout: 5000,
  },
  yahoo: {
    host: 'imap.mail.yahoo.com',
    port: 993,
    secure: true,
    authTimeout: 3000,
    connTimeout: 5000,
  },
  icloud: {
    host: 'imap.mail.me.com',
    port: 993,
    secure: true,
    authTimeout: 3000,
    connTimeout: 5000,
  },
  custom: {
    // Will be filled by user
    host: '',
    port: 993,
    secure: true,
    authTimeout: 3000,
    connTimeout: 5000,
  }
};

class IMAPService {
  private config: IMAPConfig;
  private imap: Imap;

  constructor(config: IMAPConfig) {
    this.config = config;
    this.imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.secure,
      authTimeout: config.authTimeout || 3000,
      connTimeout: config.connTimeout || 5000,
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        console.info(`[IMAP] Connected to ${this.config.host}`);
        resolve();
      });

      this.imap.once('error', (err) => {
        console.error(`[IMAP] Connection error:`, err);
        reject(err);
      });

      this.imap.connect();
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.imap.once('end', () => {
        console.info(`[IMAP] Disconnected from ${this.config.host}`);
        resolve();
      });
      this.imap.end();
    });
  }

  async getMailboxes(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.imap.getBoxes((err, boxes) => {
        if (err) {
          reject(err);
          return;
        }

        const extractBoxNames = (boxObj: any, prefix = ''): string[] => {
          const names: string[] = [];
          for (const [name, box] of Object.entries(boxObj)) {
            const fullName = prefix ? `${prefix}${box.delimiter}${name}` : name;
            names.push(fullName);
            if (box.children) {
              names.push(...extractBoxNames(box.children, fullName));
            }
          }
          return names;
        };

        resolve(extractBoxNames(boxes));
      });
    });
  }

  async selectFolder(folderName: string = 'INBOX'): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(folderName, false, (err) => {
        if (err) {
          reject(err);
          return;
        }
        console.info(`[IMAP] Opened folder: ${folderName}`);
        resolve();
      });
    });
  }

  async fetchEmails(options: {
    folder?: string;
    limit?: number;
    since?: Date;
    unseen?: boolean;
  } = {}): Promise<ParsedEmail[]> {
    const { folder = 'INBOX', limit = 50, since, unseen = false } = options;
    
    await this.selectFolder(folder);

    return new Promise((resolve, reject) => {
      let searchCriteria: any[] = ['ALL'];
      
      if (unseen) {
        searchCriteria = ['UNSEEN'];
      }
      
      if (since) {
        searchCriteria.push(['SINCE', since]);
      }

      this.imap.search(searchCriteria, (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        if (!results || results.length === 0) {
          resolve([]);
          return;
        }

        // Limit results
        const limitedResults = results.slice(-limit);
        const emails: ParsedEmail[] = [];
        let processed = 0;

        const fetch = this.imap.fetch(limitedResults, {
          bodies: '',
          struct: true,
          envelope: true,
        });

        fetch.on('message', (msg, seqno) => {
          let emailData = '';

          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              emailData += chunk.toString('utf8');
            });
          });

          msg.once('end', async () => {
            try {
              const parsed = await simpleParser(emailData);
              
              const email: ParsedEmail = {
                messageId: parsed.messageId || `seq-${seqno}`,
                from: parsed.from?.text || '',
                to: parsed.to?.map(addr => addr.address) || [],
                cc: parsed.cc?.map(addr => addr.address) || [],
                subject: parsed.subject || '',
                date: parsed.date || new Date(),
                text: parsed.text || '',
                html: parsed.html || '',
                attachments: (parsed.attachments || []).map(att => ({
                  filename: att.filename || 'untitled',
                  contentType: att.contentType || 'application/octet-stream',
                  size: att.size || 0,
                })),
                headers: parsed.headers || new Map(),
              };

              emails.push(email);
              processed++;

              if (processed === limitedResults.length) {
                resolve(emails);
              }
            } catch (parseError) {
              console.error('[IMAP] Failed to parse email:', parseError);
              processed++;
              if (processed === limitedResults.length) {
                resolve(emails);
              }
            }
          });
        });

        fetch.once('error', (err) => {
          console.error('[IMAP] Fetch error:', err);
          reject(err);
        });

        fetch.once('end', () => {
          if (processed === 0) {
            resolve([]);
          }
        });
      });
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.addFlags(messageId, '\\Seen', (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async moveToFolder(messageId: string, targetFolder: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.move(messageId, targetFolder, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}

// API Endpoints

export const testIMAPConnection: RequestHandler = async (req, res) => {
  try {
    const { provider, host, port, user, password, secure } = req.body;

    let config: IMAPConfig;

    if (provider && IMAP_PROVIDERS[provider]) {
      config = {
        ...IMAP_PROVIDERS[provider],
        user,
        password,
      };
    } else {
      config = {
        host: host || 'imap.gmail.com',
        port: port || 993,
        secure: secure !== false,
        user,
        password,
      };
    }

    const imapService = new IMAPService(config);
    
    try {
      await imapService.connect();
      const mailboxes = await imapService.getMailboxes();
      await imapService.disconnect();

      res.json({
        success: true,
        message: 'IMAP connection successful',
        mailboxes: mailboxes.slice(0, 10), // Return first 10 folders
        provider: provider || 'custom',
      });
    } catch (error) {
      await imapService.disconnect().catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error('[IMAP] Connection test failed:', error);
    res.status(400).json({
      success: false,
      error: 'IMAP connection failed',
      message: error.message,
      suggestions: [
        'Check username and password',
        'Verify IMAP is enabled in your email provider',
        'Check if 2FA requires app-specific password',
        'Verify host and port settings',
      ],
    });
  }
};

export const setupIMAPIntegration: RequestHandler = async (req, res) => {
  try {
    const { provider, host, port, user, password, secure, name } = req.body;

    let config: IMAPConfig;

    if (provider && IMAP_PROVIDERS[provider]) {
      config = {
        ...IMAP_PROVIDERS[provider],
        user,
        password,
      };
    } else {
      config = {
        host: host || 'imap.gmail.com',
        port: port || 993,
        secure: secure !== false,
        user,
        password,
      };
    }

    const imapService = new IMAPService(config);
    
    try {
      await imapService.connect();
      const mailboxes = await imapService.getMailboxes();
      
      // Test fetch a few emails to ensure read access
      const testEmails = await imapService.fetchEmails({ limit: 5 });
      
      await imapService.disconnect();

      // Store integration (in production, encrypt and store in database)
      const integration = {
        id: `imap-${Date.now()}`,
        type: 'imap',
        provider: provider || 'custom',
        name: name || `${user} (${provider || 'IMAP'})`,
        config: {
          ...config,
          password: '***', // Never return actual password
        },
        status: 'connected',
        lastSync: new Date().toISOString(),
        mailboxCount: mailboxes.length,
        testEmailCount: testEmails.length,
        capabilities: ['read', 'mark_read', 'move'],
      };

      res.json({
        success: true,
        message: 'IMAP integration configured successfully',
        integration,
        mailboxes: mailboxes.slice(0, 20),
      });
    } catch (error) {
      await imapService.disconnect().catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error('[IMAP] Integration setup failed:', error);
    res.status(400).json({
      success: false,
      error: 'IMAP integration setup failed',
      message: error.message,
    });
  }
};

export const syncIMAPEmails: RequestHandler = async (req, res) => {
  try {
    const { integrationId, folder = 'INBOX', limit = 100, unseenOnly = true } = req.body;

    // In production, retrieve config from encrypted database
    // For now, use the test configuration
    const config: IMAPConfig = {
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      user: 'user@gmail.com',
      password: 'password',
    };

    const imapService = new IMAPService(config);
    
    try {
      await imapService.connect();
      
      const emails = await imapService.fetchEmails({
        folder,
        limit,
        unseen: unseenOnly,
      });

      await imapService.disconnect();

      // Convert to our standard email format
      const standardEmails = emails.map(email => ({
        id: email.messageId,
        sender: email.from,
        recipient: email.to.join(', '),
        subject: email.subject,
        content: email.text || email.html,
        timestamp: email.date.toISOString(),
        platform: 'IMAP',
        platformLogo: '📧',
        platformColor: 'blue',
        read: false,
        important: false,
        labels: [],
        hasAttachments: email.attachments.length > 0,
        attachmentCount: email.attachments.length,
        metadata: {
          messageId: email.messageId,
          cc: email.cc,
          headers: Object.fromEntries(email.headers),
          folder,
        },
      }));

      res.json({
        success: true,
        message: `Synced ${emails.length} emails from ${folder}`,
        emails: standardEmails,
        stats: {
          total: emails.length,
          withAttachments: emails.filter(e => e.attachments.length > 0).length,
          dateRange: emails.length > 0 ? {
            oldest: Math.min(...emails.map(e => e.date.getTime())),
            newest: Math.max(...emails.map(e => e.date.getTime())),
          } : null,
        },
      });
    } catch (error) {
      await imapService.disconnect().catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error('[IMAP] Email sync failed:', error);
    res.status(500).json({
      success: false,
      error: 'IMAP email sync failed',
      message: error.message,
    });
  }
};

export const getIMAPProviders: RequestHandler = (req, res) => {
  const providers = Object.entries(IMAP_PROVIDERS).map(([key, config]) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    host: config.host,
    port: config.port,
    secure: config.secure,
    popular: ['gmail', 'outlook', 'yahoo', 'icloud'].includes(key),
  }));

  res.json({
    success: true,
    providers,
    instructions: {
      gmail: 'Enable "Less secure app access" or use App Password with 2FA',
      outlook: 'Use your Microsoft account credentials',
      yahoo: 'Generate App Password in Account Security settings',
      icloud: 'Generate App-specific password in Apple ID settings',
      custom: 'Contact your email provider for IMAP settings',
    },
  });
};