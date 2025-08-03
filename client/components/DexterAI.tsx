import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Zap, MessageCircle, Database } from "lucide-react";

interface DexterAIProps {
  open: boolean;
  onClose: () => void;
  initialContext?: {
    action?: 'generateReply' | 'summarize' | 'smartReply' | 'summarizeChat';
    sender?: string;
    subject?: string;
    content?: string;
    platform?: string;
  };
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
}

const dexterSuggestions = [
  "📧 Help me draft a reply to this email",
  "📝 Summarize this email thread",
  "🔍 What can you tell me about my emails?",
  "⚙️ How do I connect my email accounts?",
  "🤖 What AI features are available?",
  "📊 What can you analyze once I connect accounts?",
];

export function DexterAI({ open, onClose, initialContext }: DexterAIProps) {
  const getInitialMessage = () => {
    if (initialContext) {
      switch (initialContext.action) {
        case 'generateReply':
          return `I'll help you generate a reply to "${initialContext.subject}" from ${initialContext.sender}.\n\nTo create a personalized response, I'll need you to connect your email accounts first in Settings → Email Accounts. Once connected, I can draft contextual replies based on your conversation history.`;
        case 'summarize':
          return `I can summarize the email "${initialContext.subject}" from ${initialContext.sender}.\n\nFor accurate summaries, please connect your email accounts in Settings → Email Accounts first. This allows me to provide detailed analysis of your actual email content.`;
        case 'smartReply':
          return `I'll help you craft a smart reply to ${initialContext.sender} on ${initialContext.platform}.\n\nTo provide relevant suggestions, I need access to your connected accounts. Please set up your integrations in Settings → Email Accounts first.`;
        case 'summarizeChat':
          return `I can analyze your conversation with ${initialContext.sender} on ${initialContext.platform}.\n\nConnect your accounts in Settings → Email Accounts to enable conversation analysis and insights.`;
        default:
          return "Hey there! I'm Dexter AI, your intelligent email assistant! 🤖\n\nI can help you draft replies, summarize emails, and provide insights about your communications. To get started, connect your email accounts in Settings → Email Accounts.";
      }
    }
    return "Hey there! I'm Dexter AI, your intelligent email assistant! 🤖\n\nI can help you draft replies, summarize emails, and provide insights about your communications. To get started, connect your email accounts in Settings → Email Accounts.";
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

  // Reset messages when context changes
  useEffect(() => {
    setMessages([
      {
        id: "1",
        type: "assistant", 
        content: getInitialMessage(),
        timestamp: new Date().toLocaleTimeString(),
        suggestions: dexterSuggestions,
      },
    ]);
  }, [initialContext]);

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

    // Try real AI processing first
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

    if (lowerQuery.includes("summary") || lowerQuery.includes("today") || lowerQuery.includes("emails")) {
      return {
        content: "I'd love to analyze your emails and provide a real summary! To do this, I need you to:\n\n1. **Connect your email accounts** in Settings → Email Accounts\n2. **Set up IMAP/POP3** for real email access\n3. **Configure AI settings** in Settings → AI Setup\n\nOnce connected, I can provide detailed insights about your actual email data.",
        suggestions: [
          "🔧 How do I connect email accounts?",
          "📊 What insights can you provide?",
          "⚙️ Show me the setup process",
        ],
      };
    }

    if (lowerQuery.includes("reply") || lowerQuery.includes("draft") || lowerQuery.includes("response")) {
      return {
        content: "I can help you draft professional email replies! Here's what I need:\n\n1. **Email accounts connected** for context\n2. **AI API keys configured** for smart generation\n3. **The specific email** you want to reply to\n\nOnce set up, I can analyze the original email and draft contextual, professional responses in your style.",
        suggestions: [
          "📧 How do I set up email accounts?",
          "🤖 Configure AI for reply generation",
          "📝 What makes a good email reply?",
        ],
      };
    }

    if (lowerQuery.includes("help") || lowerQuery.includes("setup") || lowerQuery.includes("start")) {
      return {
        content: "I'm here to help! Here's how to get started:\n\n**🔧 Email Setup:**\n• Settings → Email Accounts\n• Add IMAP/POP3 accounts\n• Test connection\n\n**🤖 AI Setup:**\n• Settings → AI Setup\n• Add OpenAI or Anthropic API key\n• Test AI capabilities\n\n**✨ What I can do:**\n• Draft email replies\n• Summarize email threads\n• Answer questions about your emails\n• Provide writing assistance",
        suggestions: [
          "📧 Set up email accounts",
          "🤖 Configure AI settings",
          "📊 What can you analyze?",
        ],
      };
    }

    if (lowerQuery.includes("what") || lowerQuery.includes("can you") || lowerQuery.includes("capabilities")) {
      return {
        content: "Here's what I can do for you:\n\n**📧 Email Management:**\n• Draft professional replies\n• Summarize long email threads\n• Analyze conversation context\n\n**🔍 Data Analysis:**\n• Search through your emails\n• Find specific conversations\n• Identify important messages\n\n**⚙️ Setup Required:**\n• Connect email accounts (Settings → Email Accounts)\n• Configure AI settings (Settings → AI Setup)\n• Add IMAP/POP3 for real email access",
        suggestions: [
          "🔧 Start setup process",
          "📝 Draft a sample reply",
          "📊 Analyze my emails",
        ],
      };
    }

    // Default response
    return {
      content: `I understand you're asking about: "${query}"\n\nI'm designed to be your intelligent email assistant! I can:\n• **Draft email replies** with context and professionalism\n• **Summarize email threads** for quick understanding\n• **Answer questions** about your email communications\n\nTo provide accurate assistance, I need access to your actual email data. Please connect your accounts in Settings → Email Accounts.`,
      suggestions: [
        "⚙️ Connect email accounts",
        "🤖 Configure AI settings", 
        "📧 Learn about email setup",
        "🔧 Get help with setup",
      ],
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion.replace(/[📊🔍📈⚡🤖📅📧⏰🎯✉️📋🔄⚙️🔧📝]/g, "").trim());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl">Dexter AI Assistant</DialogTitle>
            <Badge variant="secondary" className="ml-auto">AI-Powered</Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 p-6 pt-0">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === "assistant" && (
                        <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      {message.type === "user" && (
                        <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                    {message.suggestions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="mt-4 space-y-3">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your emails..."
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
                  <span>Ready for analysis</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>Multi-platform support</span>
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