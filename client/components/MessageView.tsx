import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Reply, 
  Forward, 
  Archive, 
  Star, 
  Zap, 
  Send, 
  Paperclip, 
  Smile,
  Phone,
  Video,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  sender: string;
  email?: string;
  subject?: string;
  preview: string;
  content?: string;
  time: string;
  unread: boolean;
  important: boolean;
  category: string;
  categoryColor: string;
  avatar: string;
  platform: string;
  platformLogo: string;
  platformColor: string;
}

interface ConversationMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
  avatar: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface MessageViewProps {
  message: Message;
  className?: string;
}

const isMessagingPlatform = (platform: string) => {
  return ['WhatsApp', 'Slack', 'Telegram', 'Instagram', 'Facebook'].includes(platform);
};

const isEmailPlatform = (platform: string) => {
  return ['Outlook', 'Gmail'].includes(platform);
};

// Fetch conversation messages for messaging platforms
const fetchConversationMessages = async (messageId: string, platform: string): Promise<ConversationMessage[]> => {
  try {
    const response = await fetch(`/api/messages/${messageId}/conversation?platform=${platform}`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching conversation:', error);
    // Fallback to current message only
    return [];
  }
};

const EmailMessageView = ({ message }: { message: Message }) => {
  return (
    <>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{message.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{message.sender}</h3>
              <p className="text-sm text-muted-foreground">{message.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className="text-xs"
            >
              <span className="mr-1">{message.platformLogo}</span>
              {message.platform}
            </Badge>
            <span className="text-sm text-muted-foreground">{message.time}</span>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">{message.subject}</h2>
        
        <div className="flex items-center space-x-2">
          <Button size="sm">
            <Reply className="w-4 h-4 mr-2" />
            Reply
          </Button>
          <Button size="sm" variant="outline">
            <Forward className="w-4 h-4 mr-2" />
            Forward
          </Button>
          <Button size="sm" variant="outline">
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>
          <Button size="sm" variant="outline">
            <Star className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-line text-sm leading-relaxed">
            {message.content || message.preview}
          </div>
        </div>
      </ScrollArea>

      {/* AI Assistant Panel */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI Assistant</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="text-xs">
            ✨ Generate Reply
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            📝 Summarize
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            📅 Schedule Meeting
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            🔖 Add to Task
          </Button>
        </div>
      </div>
    </>
  );
};

const MessagingConversationView = ({ message }: { message: Message }) => {
  const [replyText, setReplyText] = useState('');
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversation = async () => {
      setLoading(true);
      try {
        const messages = await fetchConversationMessages(message.id.toString(), message.platform);
        if (messages.length > 0) {
          setConversationMessages(messages);
        } else {
          // Fallback: create a single message from the current message data
          setConversationMessages([{
            id: message.id.toString(),
            sender: message.sender,
            content: message.preview,
            time: message.time,
            isMe: false,
            avatar: message.avatar
          }]);
        }
      } catch (error) {
        console.error('Failed to load conversation:', error);
        // Fallback: create a single message from the current message data
        setConversationMessages([{
          id: message.id.toString(),
          sender: message.sender,
          content: message.preview,
          time: message.time,
          isMe: false,
          avatar: message.avatar
        }]);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [message.id, message.platform]);

  const handleSendMessage = () => {
    if (replyText.trim()) {
      // Handle send message logic here
      console.log('Sending message:', replyText);
      setReplyText('');
    }
  };

  const getPlatformFeatures = (platform: string) => {
    switch (platform) {
      case 'WhatsApp':
        return { supportsVoice: true, supportsVideo: true, hasOnlineStatus: true };
      case 'Slack':
        return { supportsVoice: false, supportsVideo: true, hasOnlineStatus: true };
      case 'Telegram':
        return { supportsVoice: true, supportsVideo: true, hasOnlineStatus: false };
      case 'Instagram':
        return { supportsVoice: true, supportsVideo: true, hasOnlineStatus: true };
      case 'Facebook':
        return { supportsVoice: true, supportsVideo: true, hasOnlineStatus: true };
      default:
        return { supportsVoice: false, supportsVideo: false, hasOnlineStatus: false };
    }
  };

  const features = getPlatformFeatures(message.platform);

  return (
    <>
      {/* Conversation Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{message.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold flex items-center space-x-2">
                <span>{message.sender}</span>
                {features.hasOnlineStatus && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
                )}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  <span className="mr-1">{message.platformLogo}</span>
                  {message.platform}
                </Badge>
                {features.hasOnlineStatus && (
                  <span className="text-xs text-muted-foreground">Last seen recently</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {features.supportsVoice && (
              <Button size="sm" variant="outline">
                <Phone className="w-4 h-4" />
              </Button>
            )}
            {features.supportsVideo && (
              <Button size="sm" variant="outline">
                <Video className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="outline">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Conversation Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {mockConversation.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.isMe ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "flex items-start space-x-2 max-w-[70%]",
                  msg.isMe && "flex-row-reverse space-x-reverse"
                )}
              >
                {!msg.isMe && (
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">{msg.avatar}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm",
                    msg.isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <div className={cn(
                    "flex items-center justify-between mt-2 text-xs",
                    msg.isMe ? "text-primary-foreground/70" : "text-muted-foreground/70"
                  )}>
                    <span>{msg.time}</span>
                    {msg.isMe && msg.status && (
                      <span className="flex items-center space-x-1">
                        {msg.status === 'sent' && '✓'}
                        {msg.status === 'delivered' && '✓✓'}
                        {msg.status === 'read' && <span className="text-blue-400">✓✓</span>}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Textarea
              placeholder={`Message ${message.sender}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Button size="sm" variant="outline">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            size="sm" 
            onClick={handleSendMessage}
            disabled={!replyText.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* AI Assistant Actions */}
        <Separator className="my-3" />
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI Assistant</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <Button size="sm" variant="outline" className="text-xs">
            ✨ Smart Reply
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            📝 Summarize Chat
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            🔖 Create Task
          </Button>
        </div>
      </div>
    </>
  );
};

export default function MessageView({ message, className }: MessageViewProps) {
  if (isMessagingPlatform(message.platform)) {
    return (
      <div className={cn("h-full flex flex-col", className)}>
        <MessagingConversationView message={message} />
      </div>
    );
  }

  if (isEmailPlatform(message.platform)) {
    return (
      <div className={cn("h-full flex flex-col", className)}>
        <EmailMessageView message={message} />
      </div>
    );
  }

  // Fallback for unknown platforms
  return (
    <div className={cn("h-full flex flex-col", className)}>
      <EmailMessageView message={message} />
    </div>
  );
}
