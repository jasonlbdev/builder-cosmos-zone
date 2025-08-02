import { Request, Response } from 'express';

interface ConversationMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
  avatar: string;
  status?: 'sent' | 'delivered' | 'read';
}

// Mock conversation data by platform and message ID
const conversationData: Record<string, ConversationMessage[]> = {
  'whatsapp_6': [
    {
      id: '1',
      sender: 'Amazon Support',
      content: 'Hello! Your package #AMZ123456 has been shipped and is on its way.',
      time: '2h ago',
      isMe: false,
      avatar: 'AS'
    },
    {
      id: '2',
      sender: 'You',
      content: 'Great! Can you provide an estimated delivery time?',
      time: '2h ago',
      isMe: true,
      avatar: 'YU',
      status: 'read'
    },
    {
      id: '3',
      sender: 'Amazon Support',
      content: 'Your package will be delivered today between 2-6 PM. You can track it here: [tracking link]',
      time: '1h ago',
      isMe: false,
      avatar: 'AS'
    },
    {
      id: '4',
      sender: 'Amazon Support',
      content: 'Great news! Your recent order has been delivered to your address. You can track your order history in your account.',
      time: '30m ago',
      isMe: false,
      avatar: 'AS'
    }
  ],
  'slack_5': [
    {
      id: '1',
      sender: 'GitHub Bot',
      content: 'Pull request merged: feat/new-dashboard',
      time: '5h ago',
      isMe: false,
      avatar: 'GB'
    },
    {
      id: '2',
      sender: 'You',
      content: 'Thanks! Was this tested in staging?',
      time: '5h ago',
      isMe: true,
      avatar: 'YU',
      status: 'delivered'
    },
    {
      id: '3',
      sender: 'GitHub Bot',
      content: 'Yes, all tests passed. The deployment has been triggered automatically.',
      time: '4h ago',
      isMe: false,
      avatar: 'GB'
    }
  ],
  'telegram_7': [
    {
      id: '1',
      sender: 'Notion Updates',
      content: 'New features in Notion AI',
      time: '4h ago',
      isMe: false,
      avatar: 'NO'
    },
    {
      id: '2',
      sender: 'Notion Updates',
      content: 'Discover the latest AI-powered features that will supercharge your productivity and help you work smarter, not harder.',
      time: '4h ago',
      isMe: false,
      avatar: 'NO'
    }
  ]
};

export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { platform } = req.query;

    if (!messageId || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Message ID and platform are required'
      });
    }

    const conversationKey = `${(platform as string).toLowerCase()}_${messageId}`;
    const messages = conversationData[conversationKey] || [];

    // In production, this would fetch from the actual platform APIs:
    // - WhatsApp Business API for WhatsApp messages
    // - Slack API for Slack thread messages
    // - Telegram Bot API for Telegram chat history
    // - Instagram Graph API for Instagram conversations
    // - Facebook Messenger API for Facebook conversations

    res.json({
      success: true,
      messages,
      metadata: {
        platform,
        messageId,
        totalMessages: messages.length,
        hasMore: false // In production, implement pagination
      }
    });

  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation messages'
    });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { platform } = req.query;
    const { content, replyTo } = req.body;

    if (!messageId || !platform || !content) {
      return res.status(400).json({
        success: false,
        error: 'Message ID, platform, and content are required'
      });
    }

    // In production, this would send the message via the appropriate platform API
    console.log(`Sending message via ${platform}:`, {
      messageId,
      content,
      replyTo
    });

    // Mock response
    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      sender: 'You',
      content,
      time: 'Just now',
      isMe: true,
      avatar: 'YU',
      status: 'sent'
    };

    // Add to conversation data for demo purposes
    const conversationKey = `${(platform as string).toLowerCase()}_${messageId}`;
    if (conversationData[conversationKey]) {
      conversationData[conversationKey].push(newMessage);
    }

    res.json({
      success: true,
      message: newMessage,
      metadata: {
        platform,
        messageId,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { platform } = req.query;

    if (!messageId || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Message ID and platform are required'
      });
    }

    // In production, this would mark the message as read via the platform API
    console.log(`Marking message as read on ${platform}:`, messageId);

    res.json({
      success: true,
      metadata: {
        platform,
        messageId,
        markedReadAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark message as read'
    });
  }
};
