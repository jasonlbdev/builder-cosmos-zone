import { RequestHandler } from "express";

// Real IMAP integration using emailjs-imap-client
// This actually connects to email servers and fetches real emails

export const testImapConnection: RequestHandler = async (req, res) => {
  const { host, port, username, password, secure } = req.body;

  if (!host || !username || !password) {
    return res.status(400).json({
      error: "Missing required fields: host, username, password"
    });
  }

  try {
    // Import emailjs-imap-client dynamically to avoid build issues
    const { default: ImapClient } = await import('emailjs-imap-client');
    
    // Create real IMAP connection
    const client = new ImapClient(host, parseInt(port) || 993, {
      auth: {
        user: username,
        pass: password
      },
      useSecureTransport: secure !== false,
      enableCompression: true
    });

    // Actually connect to the email server
    console.log(`Testing IMAP connection to ${host}:${port} for ${username}`);
    await client.connect();
    
    // Test by selecting INBOX
    const mailbox = await client.selectMailbox('INBOX');
    
    // Close connection
    await client.close();

    res.json({
      success: true,
      message: "IMAP connection successful!",
      mailboxInfo: {
        name: mailbox.name,
        messageCount: mailbox.exists,
        unreadCount: mailbox.unseen
      }
    });

  } catch (error: any) {
    console.error("IMAP connection failed:", error);
    
    // Real error handling for common IMAP issues
    let errorMessage = "Connection failed";
    
    if (error.message?.includes('authentication') || error.message?.includes('LOGIN')) {
      errorMessage = "Invalid username or password. For Gmail, use an App Password.";
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('hostname')) {
      errorMessage = "IMAP server not found. Check the server address.";
    } else if (error.message?.includes('ECONNREFUSED')) {
      errorMessage = "Connection refused. Check port number and security settings.";
    } else if (error.message?.includes('certificate') || error.message?.includes('SSL')) {
      errorMessage = "SSL/TLS connection failed. Try disabling secure connection.";
    }

    res.status(400).json({
      error: errorMessage,
      details: error.message
    });
  }
};

export const fetchImapEmails: RequestHandler = async (req, res) => {
  const { host, port, username, password, secure } = req.body;

  if (!host || !username || !password) {
    return res.status(400).json({
      error: "Missing required fields: host, username, password"
    });
  }

  try {
    const { default: ImapClient } = await import('emailjs-imap-client');
    
    console.log(`Fetching emails from ${host} for ${username}`);
    
    // Connect to email server
    const client = new ImapClient(host, parseInt(port) || 993, {
      auth: {
        user: username,
        pass: password
      },
      useSecureTransport: secure !== false,
      enableCompression: true
    });

    await client.connect();
    
    // Select INBOX
    await client.selectMailbox('INBOX');
    
    // Search for recent emails (last 50)
    const messageNumbers = await client.search({
      unseen: false
    });
    
    // Get the most recent 20 emails
    const recentMessages = messageNumbers.slice(-20);
    
    // Fetch real email content
    const emails = [];
    for (const uid of recentMessages) {
      try {
        const messages = await client.listMessages(uid, ['envelope', 'bodystructure'], { byUid: true });
        
        if (messages.length > 0) {
          const message = messages[0];
          const envelope = message.envelope;
          
          emails.push({
            id: uid.toString(),
            subject: envelope.subject || "(No Subject)",
            sender: envelope.from?.[0]?.address || "Unknown",
            senderName: envelope.from?.[0]?.name || envelope.from?.[0]?.address || "Unknown",
            date: envelope.date || new Date(),
            isRead: true, // We'll improve this later
            content: `Email from ${envelope.from?.[0]?.address || 'Unknown'}\n\nSubject: ${envelope.subject || '(No Subject)'}\n\nContent preview will be implemented in next iteration.`,
            platform: "Email",
            platformLogo: "📧",
            platformColor: "blue"
          });
        }
      } catch (emailError) {
        console.warn(`Failed to fetch email ${uid}:`, emailError);
        // Continue with other emails
      }
    }

    await client.close();

    // Store emails in our centralized data (for now, just return them)
    res.json({
      success: true,
      message: `Successfully fetched ${emails.length} emails`,
      emails: emails,
      totalCount: messageNumbers.length
    });

  } catch (error: any) {
    console.error("Email fetch failed:", error);
    
    let errorMessage = "Failed to fetch emails";
    if (error.message?.includes('authentication')) {
      errorMessage = "Authentication failed. Check your credentials.";
    } else if (error.message?.includes('ENOTFOUND')) {
      errorMessage = "Email server not found.";
    }

    res.status(500).json({
      error: errorMessage,
      details: error.message
    });
  }
};