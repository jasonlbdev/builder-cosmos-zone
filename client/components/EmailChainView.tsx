import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  GitBranch,
  GitMerge,
  Users,
  Lock,
  Globe,
  MessageSquare,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailParticipant {
  email: string;
  name: string;
  avatar: string;
  type: "external" | "internal";
  domain?: string;
}

interface Email {
  id: string;
  sender: string;
  email: string;
  subject: string;
  content: string;
  preview: string;
  time: string;
  unread: boolean;
  important: boolean;
  category: string;
  categoryColor: string;
  avatar: string;
  labels?: string[];
  platform?: string;
  platformLogo?: string;
  platformColor?: string;
  threadId?: string;
  parentId?: string;
  conversationType?: "external" | "internal" | "mixed";
  participants?: EmailParticipant[];
  threadPosition?: number;
  hasReplies?: boolean;
  isThreadHead?: boolean;
  forkPoint?: boolean;
}

interface EmailChainViewProps {
  emails: Email[];
  selectedEmailId?: string;
  onEmailSelect: (emailId: string) => void;
  className?: string;
}

const getConversationTypeIcon = (type?: string) => {
  switch (type) {
    case "internal":
      return <Lock className="w-3 h-3" />;
    case "external":
      return <Globe className="w-3 h-3" />;
    case "mixed":
      return <Users className="w-3 h-3" />;
    default:
      return <MessageSquare className="w-3 h-3" />;
  }
};

const getConversationTypeColor = (type?: string) => {
  switch (type) {
    case "internal":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "external":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "mixed":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const EmailThreadItem = ({ 
  email, 
  isSelected, 
  onSelect, 
  isLast,
  level = 0 
}: { 
  email: Email; 
  isSelected: boolean; 
  onSelect: (id: string) => void;
  isLast: boolean;
  level?: number;
}) => {
  const [showFullContent, setShowFullContent] = useState(false);
  
  return (
    <div className={cn("relative", level > 0 && "ml-6")}>
      {/* Connection Line */}
      {level > 0 && (
        <div className="absolute -left-6 top-0 bottom-0 w-6 flex items-start">
          <div className="w-full h-8 border-l-2 border-b-2 border-muted-foreground/20 rounded-bl-lg mt-2" />
        </div>
      )}
      
      {/* Fork Indicator */}
      {email.forkPoint && (
        <div className="flex items-center space-x-2 mb-2 text-xs text-muted-foreground">
          <GitBranch className="w-3 h-3" />
          <span>Conversation forked to internal discussion</span>
        </div>
      )}
      
      <div
        className={cn(
          "p-3 rounded-lg border cursor-pointer transition-all duration-200",
          isSelected
            ? "bg-accent border-accent-foreground/20 shadow-sm"
            : "border-border hover:bg-accent/50 hover:border-accent-foreground/10",
          email.unread && "border-l-4 border-l-primary"
        )}
        onClick={() => onSelect(email.id)}
      >
        {/* Email Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs">{email.avatar}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className={cn("text-sm truncate", email.unread ? "font-medium" : "font-normal")}>
                  {email.sender}
                </span>
                
                {/* Platform Badge */}
                {email.platform && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    <span className="mr-1">{email.platformLogo}</span>
                    {email.platform}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                {/* Conversation Type */}
                <Badge 
                  variant="outline" 
                  className={cn("text-xs px-2 py-0", getConversationTypeColor(email.conversationType))}
                >
                  {getConversationTypeIcon(email.conversationType)}
                  <span className="ml-1 capitalize">{email.conversationType || "external"}</span>
                </Badge>
                
                {/* Category Badge */}
                <Badge
                  variant="secondary"
                  className={cn("text-xs", email.categoryColor, "text-white")}
                >
                  {email.category}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">{email.time}</span>
            {email.unread && <div className="w-2 h-2 bg-primary rounded-full" />}
          </div>
        </div>
        
        {/* Subject */}
        <h4 className={cn("text-sm mb-2 truncate", email.unread ? "font-medium" : "font-normal")}>
          {email.subject}
        </h4>
        
        {/* Preview/Content */}
        <div className="text-xs text-muted-foreground">
          <div className={cn("transition-all duration-200", showFullContent ? "" : "line-clamp-2")}>
            {showFullContent ? email.content : email.preview}
          </div>
          
          {email.content && email.content.length > email.preview.length && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary hover:text-primary/80 mt-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullContent(!showFullContent);
              }}
            >
              {showFullContent ? (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Show more
                </>
              )}
            </Button>
          )}
        </div>
        
        {/* Participants */}
        {email.participants && email.participants.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>Participants:</span>
              <div className="flex items-center space-x-1">
                {email.participants.slice(0, 3).map((participant, index) => (
                  <div key={participant.email} className="flex items-center">
                    <Avatar className="w-4 h-4">
                      <AvatarFallback className="text-xs">{participant.avatar}</AvatarFallback>
                    </Avatar>
                    <span className={cn(
                      "ml-1",
                      participant.type === "internal" ? "text-orange-600" : "text-blue-600"
                    )}>
                      {participant.name}
                    </span>
                    {index < Math.min(email.participants.length, 3) - 1 && (
                      <span className="mx-1">,</span>
                    )}
                  </div>
                ))}
                {email.participants.length > 3 && (
                  <span className="text-muted-foreground">+{email.participants.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Merge Back Indicator */}
      {email.conversationType === "mixed" && email.parentId && (
        <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
          <GitMerge className="w-3 h-3" />
          <span>Conversation rejoined main thread</span>
        </div>
      )}
    </div>
  );
};

export default function EmailChainView({ 
  emails, 
  selectedEmailId, 
  onEmailSelect, 
  className 
}: EmailChainViewProps) {
  const [showInternalOnly, setShowInternalOnly] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  
  // Group emails by thread
  const emailsByThread = emails.reduce((acc, email) => {
    const threadId = email.threadId || email.id;
    if (!acc[threadId]) {
      acc[threadId] = [];
    }
    acc[threadId].push(email);
    return acc;
  }, {} as Record<string, Email[]>);
  
  // Sort emails within each thread by position
  Object.keys(emailsByThread).forEach(threadId => {
    emailsByThread[threadId].sort((a, b) => (a.threadPosition || 0) - (b.threadPosition || 0));
  });
  
  const toggleThread = (threadId: string) => {
    const newExpanded = new Set(expandedThreads);
    if (expandedThreads.has(threadId)) {
      newExpanded.delete(threadId);
    } else {
      newExpanded.add(threadId);
    }
    setExpandedThreads(newExpanded);
  };
  
  const filteredEmails = (threadEmails: Email[]) => {
    if (showInternalOnly) {
      return threadEmails.filter(email => email.conversationType === "internal");
    }
    return threadEmails;
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Email Chains</h3>
          <Badge variant="secondary" className="text-xs">
            {Object.keys(emailsByThread).length} thread{Object.keys(emailsByThread).length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={showInternalOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowInternalOnly(!showInternalOnly)}
            className="text-xs"
          >
            <Lock className="w-3 h-3 mr-1" />
            Internal Only
          </Button>
        </div>
      </div>
      
      <Separator />
      
      {/* Thread List */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4">
          {Object.entries(emailsByThread).map(([threadId, threadEmails]) => {
            const threadHead = threadEmails.find(email => email.isThreadHead) || threadEmails[0];
            const isExpanded = expandedThreads.has(threadId);
            const visibleEmails = filteredEmails(threadEmails);
            const hasInternalFork = threadEmails.some(email => email.forkPoint);
            
            if (visibleEmails.length === 0) return null;
            
            return (
              <div key={threadId} className="space-y-2">
                <Collapsible open={isExpanded} onOpenChange={() => toggleThread(threadId)}>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {threadHead.subject}
                          </span>
                        </div>
                        
                        {hasInternalFork && (
                          <Badge variant="outline" className="text-xs">
                            <GitBranch className="w-3 h-3 mr-1" />
                            Fork
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {visibleEmails.length} message{visibleEmails.length !== 1 ? 's' : ''}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {threadHead.time}
                        </span>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-2 mt-2">
                    {visibleEmails.map((email, index) => (
                      <EmailThreadItem
                        key={email.id}
                        email={email}
                        isSelected={selectedEmailId === email.id}
                        onSelect={onEmailSelect}
                        isLast={index === visibleEmails.length - 1}
                        level={email.parentId ? 1 : 0}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
