import { Request, Response } from "express";
// Mock conversation data - in production this would come from database
interface ConversationMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
  avatar: string;
  status?: "sent" | "delivered" | "read";
}

const conversationData: Record<string, ConversationMessage[]> = {
  whatsapp_6: [
    {
      id: "1",
      sender: "Amazon Support",
      content: "Hello! Your package #AMZ123456 has been shipped and is on its way.",
      time: "2h ago",
      isMe: false,
      avatar: "AS",
    },
    {
      id: "2",
      sender: "You",
      content: "Great! Can you provide an estimated delivery time?",
      time: "2h ago",
      isMe: true,
      avatar: "YU",
      status: "read",
    },
  ],
  slack_5: [
    {
      id: "1",
      sender: "GitHub Bot",
      content: "Pull request merged: feat/new-dashboard",
      time: "5h ago",
      isMe: false,
      avatar: "GB",
    },
    {
      id: "2",
      sender: "You",
      content: "Thanks! Was this tested in staging?",
      time: "5h ago",
      isMe: true,
      avatar: "YU",
      status: "delivered",
    },
  ],
};

const getConversations = () => conversationData;

export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { platform } = req.query;

    if (!messageId || !platform) {
      return res.status(400).json({
        success: false,
        error: "Message ID and platform are required",
      });
    }

    const conversationKey = `${(platform as string).toLowerCase()}_${messageId}`;
    const conversationData = getConversations();
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
        hasMore: false, // In production, implement pagination
      },
    });
  } catch (error) {
    console.error("Get conversation messages error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversation messages",
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
        error: "Message ID, platform, and content are required",
      });
    }

    // In production, this would send the message via the appropriate platform API
    console.log(`Sending message via ${platform}:`, {
      messageId,
      content,
      replyTo,
    });

    // Mock response
    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      sender: "You",
      content,
      time: "Just now",
      isMe: true,
      avatar: "YU",
      status: "sent",
    };

    // Add to conversation data for demo purposes
    const conversationKey = `${(platform as string).toLowerCase()}_${messageId}`;
    const conversationData = getConversations();
    if (conversationData[conversationKey]) {
      conversationData[conversationKey].push(newMessage);
    }

    res.json({
      success: true,
      message: newMessage,
      metadata: {
        platform,
        messageId,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send message",
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
        error: "Message ID and platform are required",
      });
    }

    // In production, this would mark the message as read via the platform API
    console.log(`Marking message as read on ${platform}:`, messageId);

    res.json({
      success: true,
      metadata: {
        platform,
        messageId,
        markedReadAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark message as read",
    });
  }
};
