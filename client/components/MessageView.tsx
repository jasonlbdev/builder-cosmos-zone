import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MessageCircle,
  Trash,
  Tag,
  Clock,
  Flag,
  Copy,
  Share,
  CheckSquare,
  Database,
  Shield,
  Brain,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CRMIntegration from "./CRMIntegration";
import EmailToTaskExtraction from "./EmailToTaskExtraction";
import SecurityThreatDetection from "./SecurityThreatDetection";

interface Message {
  id: string;
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
  status?: "sent" | "delivered" | "read";
}

interface MessageViewProps {
  message: Message;
  className?: string;
  onReply?: () => void;
  onForward?: () => void;
  onArchive?: () => void;
  onStar?: () => void;
  onDelete?: () => void;
  onMarkAsRead?: () => void;
  onAddLabel?: () => void;
  onSnooze?: () => void;
}

const isMessagingPlatform = (platform: string) => {
  return ["WhatsApp", "Slack", "Telegram", "Instagram", "Facebook"].includes(
    platform,
  );
};

const isEmailPlatform = (platform: string) => {
  return ["Outlook", "Gmail"].includes(platform);
};

// Fetch conversation messages for messaging platforms (using mock data)
const fetchConversationMessages = async (
  messageId: string,
  platform: string,
): Promise<ConversationMessage[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Mock conversation data
  const mockConversations: Record<string, ConversationMessage[]> = {
    whatsapp: [
      {
        id: "1",
        sender: "You",
        content: "Hey, how's the project going?",
        time: "10:30 AM",
        isMe: true,
        avatar: "Y",
        status: "read"
      },
      {
        id: "2", 
        sender: "Sarah",
        content: "Going well! Just finished the design phase. Should have the prototype ready by Friday.",
        time: "10:32 AM",
        isMe: false,
        avatar: "S",
        status: "read"
      },
      {
        id: "3",
        sender: "You", 
        content: "Awesome! Let me know if you need any help with the implementation.",
        time: "10:35 AM",
        isMe: true,
        avatar: "Y",
        status: "delivered"
      }
    ],
    telegram: [
      {
        id: "1",
        sender: "Mike",
        content: "The client wants to add a new feature to the dashboard",
        time: "2:15 PM",
        isMe: false,
        avatar: "M"
      },
      {
        id: "2",
        sender: "You",
        content: "What kind of feature are they looking for?",
        time: "2:18 PM", 
        isMe: true,
        avatar: "Y",
        status: "read"
      },
      {
        id: "3",
        sender: "Mike",
        content: "Real-time analytics with interactive charts. I'll send over the requirements doc.",
        time: "2:20 PM",
        isMe: false,
        avatar: "M"
      }
    ],
    slack: [
      {
        id: "1",
        sender: "TeamBot",
        content: "🎉 New deployment to staging environment completed successfully!",
        time: "3:45 PM",
        isMe: false,
        avatar: "🤖"
      },
      {
        id: "2",
        sender: "You",
        content: "Great! I'll run the QA tests now.",
        time: "3:47 PM",
        isMe: true,
        avatar: "Y",
        status: "delivered"
      },
      {
        id: "3",
        sender: "QA Team",
        content: "All tests passed ✅ Ready for production deployment.",
        time: "4:15 PM",
        isMe: false,
        avatar: "QA"
      }
    ]
  };

  const platformKey = platform.toLowerCase();
  return mockConversations[platformKey] || [];
};

const EmailView = ({ message }: { message: Message }) => {
  return (
    <>
      {/* Email Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>{message.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{message.sender}</h3>
              <p className="text-sm text-muted-foreground">{message.email}</p>
              <p className="text-xs text-muted-foreground">{message.time}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                message.categoryColor.replace("bg-", "bg-"),
                "text-white"
              )}
            >
              {message.category}
            </Badge>
            {message.platform && (
              <Badge variant="outline" className="text-xs">
                <span className="mr-1">{message.platformLogo}</span>
                {message.platform}
              </Badge>
            )}
          </div>
        </div>

        <h2 className="text-lg font-medium mb-2">{message.subject}</h2>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Button size="sm" onClick={() => console.log('Reply clicked')}>
            <Reply className="w-4 h-4 mr-2" />
            Reply
          </Button>
          <Button size="sm" variant="outline" onClick={() => console.log('Forward clicked')}>
            <Forward className="w-4 h-4 mr-2" />
            Forward
          </Button>
          <Button size="sm" variant="outline" onClick={() => console.log('Archive clicked')}>
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => console.log('Star clicked')}
            className={message.important ? "text-yellow-500" : ""}
          >
            <Star className={`w-4 h-4 ${message.important ? 'fill-current' : ''}`} />
          </Button>
          
          {/* New Feature Buttons */}
          <CRMIntegration
            emailSender={message.email || message.sender}
            emailSubject={message.subject}
            emailContent={message.content}
            emailId={message.id}
          >
            <Button size="sm" variant="outline">
              <Database className="w-4 h-4 mr-2" />
              CRM
            </Button>
          </CRMIntegration>
          
          <EmailToTaskExtraction
            emailContext={{
              id: message.id,
              subject: message.subject || "No Subject",
              content: message.content || message.preview,
              sender: message.email || message.sender,
              recipients: [],
              timestamp: message.time
            }}
          >
            <Button size="sm" variant="outline">
              <CheckSquare className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </EmailToTaskExtraction>
          
          <SecurityThreatDetection
            emailId={message.id}
            emailContent={message.content}
            emailSender={message.email || message.sender}
            emailSubject={message.subject}
          >
            <Button size="sm" variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </Button>
          </SecurityThreatDetection>
          
          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log('Mark as read clicked')}>
                <Clock className="w-4 h-4 mr-2" />
                {message.unread ? "Mark as Read" : "Mark as Unread"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Add label clicked')}>
                <Tag className="w-4 h-4 mr-2" />
                Add Label
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Snooze clicked')}>
                <Clock className="w-4 h-4 mr-2" />
                Snooze
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content || message.preview)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Content
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Sharing email:', message.subject)}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log('Delete clicked')} className="text-red-600">
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-line text-sm leading-relaxed">
            {message.content || message.preview}
          </div>
        </div>
      </ScrollArea>

      {/* Enhanced AI Assistant Panel */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium">AI Smart Actions</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs"
            onClick={() => {
              // Open AI modal with generate reply action
              const event = new CustomEvent('openAI', { 
                detail: { 
                  action: 'generateReply', 
                  emailId: message.id,
                  subject: message.subject,
                  content: message.content,
                  sender: message.sender 
                } 
              });
              window.dispatchEvent(event);
            }}
          >
            ✨ Generate Reply
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs"
            onClick={() => {
              // Open AI modal with summarize action
              const event = new CustomEvent('openAI', { 
                detail: { 
                  action: 'summarize', 
                  emailId: message.id,
                  subject: message.subject,
                  content: message.content,
                  sender: message.sender 
                } 
              });
              window.dispatchEvent(event);
            }}
          >
            📝 Summarize
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => {
              const url = `/calendar?from-email=true&messageId=${message.id}&sender=${encodeURIComponent(message.sender)}&subject=${encodeURIComponent(message.subject || "")}&platform=${message.platform}`;
              window.open(url, "_blank");
            }}
          >
            📅 Schedule Meeting
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => {
              const url = `/tasks?from-email=true&messageId=${message.id}&sender=${encodeURIComponent(message.sender)}&subject=${encodeURIComponent(message.subject || "")}&platform=${message.platform}&platformLogo=${encodeURIComponent(message.platformLogo)}`;
              window.open(url, "_blank");
            }}
          >
            🔖 Add to Task
          </Button>
        </div>
      </div>
    </>
  );
};

const MessagingConversationView = ({ message }: { message: Message }) => {
  const [replyText, setReplyText] = useState("");
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversation = async () => {
      setLoading(true);
      try {
        const messages = await fetchConversationMessages(
          message.id.toString(),
          message.platform,
        );
        if (messages.length > 0) {
          setConversationMessages(messages);
        } else {
          // Fallback to single message if no conversation found
          setConversationMessages([
            {
              id: message.id,
              sender: message.sender,
              content: message.content || message.preview,
              time: message.time,
              isMe: false,
              avatar: message.avatar,
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
        // Fallback to single message
        setConversationMessages([
          {
            id: message.id,
            sender: message.sender,
            content: message.content || message.preview,
            time: message.time,
            isMe: false,
            avatar: message.avatar,
          },
        ]);
      }
      setLoading(false);
    };

    loadConversation();
  }, [message]);

  const handleSendReply = () => {
    if (replyText.trim()) {
      const newMessage: ConversationMessage = {
        id: Date.now().toString(),
        sender: "You",
        content: replyText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: true,
        avatar: "Y",
        status: "sent",
      };

      setConversationMessages((prev) => [...prev, newMessage]);
      setReplyText("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Conversation Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>{message.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{message.sender}</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  <span className="mr-1">{message.platformLogo}</span>
                  {message.platform}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Active now
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline">
              <Phone className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Video className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Conversation Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversationMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start space-x-2",
                msg.isMe ? "flex-row-reverse space-x-reverse" : "",
              )}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">{msg.avatar}</AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                  msg.isMe
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted",
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <div
                  className={cn(
                    "flex items-center justify-between mt-1 text-xs",
                    msg.isMe ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  <span>{msg.time}</span>
                  {msg.isMe && msg.status && (
                    <span className="ml-2">
                      {msg.status === "sent" && "✓"}
                      {msg.status === "delivered" && "✓✓"}
                      {msg.status === "read" && "✓✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Reply Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${message.sender}...`}
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
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
            <Button size="sm" onClick={handleSendReply} disabled={!replyText.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default function MessageView({
  message,
  className,
  onReply,
  onForward,
  onArchive,
  onStar,
  onDelete,
  onMarkAsRead,
  onAddLabel,
  onSnooze,
}: MessageViewProps) {
  if (!message) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No message selected</h3>
          <p className="text-muted-foreground">
            Select a message from the list to view it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      {isEmailPlatform(message.platform) ? (
        <EmailView message={message} />
      ) : (
        <MessagingConversationView message={message} />
      )}
    </div>
  );
}
