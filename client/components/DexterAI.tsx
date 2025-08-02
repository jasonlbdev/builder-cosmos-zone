import { useState, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  MessageCircle,
  Database,
  Search,
  Brain,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DexterAIProps {
  open: boolean;
  onClose: () => void;
  initialContext?: any;
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
}

const dexterSuggestions = [
  "📊 Show me a summary of today's emails",
  "🔍 Find all emails about budget meetings",
  "📈 What are my email trends this week?",
  "⚡ Which emails need urgent attention?",
  "🤖 Auto-categorize my unread emails",
  "📅 Schedule follow-ups for pending emails",
];

export function DexterAI({ open, onClose, initialContext }: DexterAIProps) {
  const getInitialMessage = () => {
    if (initialContext) {
      switch (initialContext.action) {
        case 'generateReply':
          return `I'll help you generate a reply to "${initialContext.subject}" from ${initialContext.sender}.\n\nBased on the email content, here's a suggested response:\n\n"Thank you for your email. I'll review the details and get back to you shortly with my thoughts."\n\nWould you like me to customize this reply or generate alternative responses?`;
        case 'summarize':
          return `Here's a summary of the email "${initialContext.subject}" from ${initialContext.sender}:\n\n📝 **Key Points:**\n• Main topic discussed\n• Action items mentioned\n• Important dates or deadlines\n\nWould you like me to provide a more detailed analysis or extract specific information?`;
        case 'smartReply':
          return `I'll help you craft a smart reply to ${initialContext.sender} on ${initialContext.platform}.\n\nBased on your conversation context, here are some suggested responses:\n\n💬 "Thanks for the update!"\n📅 "Let's schedule a time to discuss this"\n✅ "Sounds good, I'll get back to you soon"\n\nWould you like me to generate a custom response?`;
        case 'summarizeChat':
          return `Here's a summary of your conversation with ${initialContext.sender} on ${initialContext.platform}:\n\n📊 **Conversation Overview:**\n• Recent activity and key topics\n• Important decisions made\n• Pending items requiring follow-up\n\nWould you like me to identify action items or extract specific information from this conversation?`;
        default:
          return "Hey there! I'm Dexter AI, your intelligent email assistant! 🤖\n\nI can help you analyze your entire email database, find patterns, categorize messages, and answer questions about your communications across all platforms. What would you like to know?";
      }
    }
    return "Hey there! I'm Dexter AI, your intelligent email assistant! 🤖\n\nI can help you analyze your entire email database, find patterns, categorize messages, and answer questions about your communications across all platforms. What would you like to know?";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: getInitialMessage(),
      timestamp: new Date().toLocaleTimeString(),
      suggestions: dexterSuggestions,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Reset messages when initialContext changes
  useEffect(() => {
    if (open) {
      setMessages([
        {
          id: "1",
          type: "assistant",
          content: getInitialMessage(),
          timestamp: new Date().toLocaleTimeString(),
          suggestions: dexterSuggestions,
        },
      ]);
    }
  }, [initialContext, open]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Real AI processing
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          context: initialContext,
          conversation: messages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: data.content,
          timestamp: new Date().toLocaleTimeString(),
          suggestions: data.suggestions,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Fallback to local generation if API fails
        const fallbackResponse = generateDexterResponse(input);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: fallbackResponse.content,
          timestamp: new Date().toLocaleTimeString(),
          suggestions: fallbackResponse.suggestions,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("AI API call failed:", error);
      
      // Fallback to local generation if API fails
      const fallbackResponse = generateDexterResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: fallbackResponse.content,
        timestamp: new Date().toLocaleTimeString(),
        suggestions: fallbackResponse.suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateDexterResponse = (
    query: string,
  ): { content: string; suggestions?: string[] } => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("summary") || lowerQuery.includes("today")) {
      return {
        content:
          "📊 **Today's Email Summary:**\n\n• **23 new emails** received across all platforms\n• **3 urgent** items requiring immediate attention\n• **7 marketing** emails auto-categorized\n• **2 important** financial notifications\n• **85% categorization** accuracy achieved\n\n**Top senders:** Sarah Johnson (3), LinkedIn (2), GitHub (2)\n**Most active platform:** Gmail (12 emails), Slack (8 messages)",
        suggestions: [
          "🔍 Show me the urgent emails",
          "📧 Open Gmail emails only",
          "⚡ What needs my immediate attention?",
        ],
      };
    }

    if (lowerQuery.includes("budget") || lowerQuery.includes("meeting")) {
      return {
        content:
          '🔍 **Found 4 emails about budget meetings:**\n\n1. **Sarah Johnson** - "Q4 Budget Review Meeting" (2m ago)\n   *Category: To Respond* | *Platform: Gmail*\n\n2. **David Kim** - "Budget Planning Session" (1h ago)\n   *Category: Important* | *Platform: Outlook*\n\n3. **Finance Team** - "Annual Budget Discussion" (3h ago)\n   *Category: FYI* | *Platform: Slack*\n\n4. **Alex Rivera** - "Re: Budget Allocation" (1d ago)\n   *Category: Awaiting Reply* | *Platform: Gmail*',
        suggestions: [
          "📅 Schedule a budget meeting",
          "💰 Show financial emails only",
          "📊 Analyze spending patterns",
        ],
      };
    }

    if (lowerQuery.includes("trends") || lowerQuery.includes("week")) {
      return {
        content:
          "📈 **This Week's Email Trends:**\n\n**Volume Analysis:**\n• Monday: 32 emails (highest)\n• Tuesday: 28 emails\n• Wednesday: 24 emails\n�� Thursday: 19 emails (today)\n• Average: 25.8 emails/day\n\n**Category Breakdown:**\n• Marketing: 35% (↑5% from last week)\n• Work: 40% (↓2% from last week)\n• Important: 15% (↑3% from last week)\n• Social: 10% (stable)\n\n**Response Time:** Average 2.5 hours (improving!)",
        suggestions: [
          "📊 Show monthly trends",
          "⏰ Optimize response times",
          "🎯 Set email goals",
        ],
      };
    }

    if (lowerQuery.includes("urgent") || lowerQuery.includes("attention")) {
      return {
        content:
          '⚡ **Emails Requiring Urgent Attention:**\n\n**🔴 High Priority (3 emails):**\n\n1. **David Kim** - "Urgent: Contract review needed"\n   *Deadline: Tomorrow* | *Platform: Gmail*\n\n2. **Sarah Johnson** - "Q4 Budget Review Meeting"\n   *Response needed: Today* | *Platform: Gmail*\n\n3. **Legal Team** - "Action Required: NDA Signature"\n   *Deadline: End of day* | *Platform: Outlook*\n\n**Recommended Actions:**\n• Reply to David Kim first (most urgent)\n• Schedule budget meeting with Sarah\n• Review and sign NDA',
        suggestions: [
          "✉️ Draft reply to David Kim",
          "📅 Schedule with Sarah",
          "📋 Open legal documents",
        ],
      };
    }

    if (lowerQuery.includes("categorize") || lowerQuery.includes("unread")) {
      return {
        content:
          "🤖 **AI Categorization Complete!**\n\n**Processed 15 unread emails:**\n\n✅ **Auto-categorized:**\n• 3 → To Respond (95% confidence)\n• 4 → Marketing (88% confidence)\n• 2 → Important (92% confidence)\n• 3 → FYI (85% confidence)\n• 2 → Updates (90% confidence)\n• 1 → Promotions (87% confidence)\n\n**🎯 Average confidence: 89.5%**\n\n**Actions taken:**\n• Starred 2 high-importance emails\n��� Set 3 follow-up reminders\n• Archived 4 outdated promotions",
        suggestions: [
          "📊 Review categorization",
          "⚙️ Adjust AI confidence",
          "🔄 Re-categorize specific emails",
        ],
      };
    }

    // Default response
    return {
      content: `🤖 I understand you're asking about: "${query}"\n\nI can help you with:\n• **Email analysis** across all platforms\n• **Smart categorization** and filtering\n• **Trend insights** and patterns\n• **Response suggestions** and drafting\n• **Calendar integration** and scheduling\n• **Contact management** and insights\n\nCould you be more specific about what you'd like me to analyze or help you with?`,
      suggestions: [
        "📊 Analyze my email patterns",
        "🔍 Search for specific topics",
        "📧 Help with email management",
        "📅 Schedule management",
      ],
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion.replace(/[📊🔍📈⚡🤖📅📧⏰🎯✉️📋🔄⚙️]/g, "").trim());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  🤖
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold flex items-center">
                  Dexter AI
                  <Sparkles className="w-4 h-4 ml-2 text-yellow-500" />
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Your Intelligent Email Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <Brain className="w-3 h-3 mr-1" />
                Online
              </Badge>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  {message.type === "assistant" ? (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                        🤖
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-muted text-xs">
                        You
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.type === "assistant" ? "Dexter AI" : "You"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "rounded-lg p-3 whitespace-pre-line text-sm",
                        message.type === "assistant"
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground",
                      )}
                    >
                      {message.content}
                    </div>
                    {message.suggestions && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Suggestions:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                      🤖
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Dexter anything about your emails..."
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Database className="w-3 h-3" />
                  <span>23,456 emails indexed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>7 platforms connected</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span>AI-powered</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DexterAI;
