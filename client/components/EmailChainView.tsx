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
  Mail,
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

const getThreadLineColor = (type?: string) => {
  switch (type) {
    case "internal":
      return "border-orange-400";
    case "external":
      return "border-blue-400";
    case "mixed":
      return "border-purple-400";
    default:
      return "border-gray-400";
  }
};

const getThreadBgColor = (type?: string) => {
  switch (type) {
    case "internal":
      return "bg-orange-50 border-orange-200";
    case "external":
      return "bg-blue-50 border-blue-200";
    case "mixed":
      return "bg-purple-50 border-purple-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

const EmailThreadItem = ({ 
  email, 
  isSelected, 
  onSelect, 
  isLast,
  level = 0,
  threadEmails = [],
  index = 0
}: { 
  email: Email; 
  isSelected: boolean; 
  onSelect: (id: string) => void;
  isLast: boolean;
  level?: number;
  threadEmails?: Email[];
  index?: number;
}) => {
  const [showFullContent, setShowFullContent] = useState(false);
  
  // Calculate indentation based on conversation type changes
  const getIndentLevel = () => {
    if (level === 0 || email.isThreadHead) return 0;
    
    // Check if this is a fork from the main thread
    if (email.forkPoint) return 1;
    
    // If this continues an internal conversation, maintain the same level
    if (email.conversationType === "internal" && email.parentId) {
      const parentEmail = threadEmails.find(e => e.id === email.parentId);
      if (parentEmail?.conversationType === "internal") return 1;
    }
    
    // If this rejoins the main thread, return to base level
    if (email.conversationType === "mixed") return 0;
    
    return level;
  };

  const indentLevel = getIndentLevel();
  const indentPixels = indentLevel * 32; // 32px per level
  
  const isMainThread = indentLevel === 0;
  const isForkedThread = indentLevel > 0;
  
  return (
    <div className={cn("relative", !isMainThread && "ml-8")} style={{ paddingLeft: `${indentPixels}px` }}>
      {/* Thread Connection Lines */}
      {!email.isThreadHead && (
        <div className="absolute top-0 bottom-0" style={{ left: `${Math.max(0, indentPixels - 16)}px` }}>
          {/* Vertical line for thread continuity */}
          {!isLast && (
            <div 
              className={cn(
                "absolute top-0 bottom-0 w-0.5 -translate-x-0.5",
                isForkedThread ? getThreadLineColor(email.conversationType) : getThreadLineColor("external")
              )}
              style={{ left: isForkedThread ? "16px" : "0px" }}
            />
          )}
          
          {/* Horizontal connector line */}
          <div 
            className={cn(
              "absolute top-4 w-4 h-0.5 -translate-y-0.5",
              isForkedThread ? getThreadLineColor(email.conversationType) : getThreadLineColor("external")
            )}
            style={{ left: isForkedThread ? "0px" : "0px" }}
          />
          
          {/* Corner connector for forks */}
          {email.forkPoint && (
            <div 
              className={cn(
                "absolute top-0 w-0.5 h-4",
                getThreadLineColor(email.conversationType)
              )}
              style={{ left: "0px" }}
            />
          )}
        </div>
      )}
      
      {/* Fork Indicator */}
      {email.forkPoint && (
        <div className="flex items-center space-x-2 mb-2 text-xs text-muted-foreground">
          <GitBranch className={cn("w-3 h-3", email.conversationType === "internal" ? "text-orange-600" : "text-blue-600")} />
          <span>
            {email.conversationType === "internal" 
              ? "Conversation forked to internal discussion" 
              : "Conversation forked to external thread"}
          </span>
        </div>
      )}
      
      <div
        className={cn(
          "p-3 rounded-lg border cursor-pointer transition-all duration-200",
          isSelected
            ? "bg-accent border-accent-foreground/20 shadow-sm"
            : "border-border hover:bg-accent/50 hover:border-accent-foreground/10",
          email.unread && "border-l-4 border-l-primary",
          isForkedThread && getThreadBgColor(email.conversationType)
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
                
                {/* Thread Position Indicator */}
                <Badge variant="outline" className="text-xs">
                  #{email.threadPosition || 1}
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
      {email.conversationType === "mixed" && email.parentId && !isMainThread && (
        <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
          <GitMerge className="w-3 h-3 text-purple-600" />
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
    <div className={cn("h-full flex flex-col", className)}>
      {/* Controls */}
      <div className="space-y-3 p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <h3 className="text-sm font-medium">Email Threads</h3>
            <Badge variant="secondary" className="text-xs">
              {Object.keys(emailsByThread).length} thread{Object.keys(emailsByThread).length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <Button
            variant={showInternalOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowInternalOnly(!showInternalOnly)}
            className="text-xs h-7"
          >
            <Lock className="w-3 h-3 mr-1" />
            Internal Only
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-blue-400"></div>
            <span>External</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-orange-400"></div>
            <span>Internal</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-purple-400"></div>
            <span>Mixed</span>
          </div>
        </div>
      </div>

      {/* Thread List */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          {Object.entries(emailsByThread).map(([threadId, threadEmails]) => {
            const threadHead = threadEmails.find(email => email.isThreadHead) || threadEmails[0];
            const isExpanded = expandedThreads.has(threadId);
            const visibleEmails = filteredEmails(threadEmails);
            const hasInternalFork = threadEmails.some(email => email.forkPoint);
            const hasMixedConversation = threadEmails.some(email => email.conversationType === "mixed");
            
            if (visibleEmails.length === 0) return null;
            
            return (
              <div key={threadId} className="space-y-2">
                <Collapsible open={isExpanded} onOpenChange={() => toggleThread(threadId)}>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {threadHead.subject.replace(/^(Re:|Fwd:|RE:|FWD:)\s*/i, '')}
                          </span>
                        </div>
                        
                        {/* Thread Indicators */}
                        <div className="flex items-center space-x-1">
                          {hasInternalFork && (
                            <Badge variant="outline" className="text-xs">
                              <GitBranch className="w-3 h-3 mr-1" />
                              Fork
                            </Badge>
                          )}
                          
                          {hasMixedConversation && (
                            <Badge variant="outline" className="text-xs">
                              <GitMerge className="w-3 h-3 mr-1" />
                              Merge
                            </Badge>
                          )}
                          
                          {threadHead.platform && (
                            <Badge variant="outline" className="text-xs">
                              <span className="mr-1">{threadHead.platformLogo}</span>
                              {threadHead.platform}
                            </Badge>
                          )}
                        </div>
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
                  
                  <CollapsibleContent className="space-y-1 mt-2">
                    <div className="relative">
                      {/* Main thread line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-400/30"></div>
                      
                      {visibleEmails.map((email, index) => (
                        <EmailThreadItem
                          key={email.id}
                          email={email}
                          isSelected={selectedEmailId === email.id}
                          onSelect={onEmailSelect}
                          isLast={index === visibleEmails.length - 1}
                          level={email.parentId ? 1 : 0}
                          threadEmails={threadEmails}
                          index={index}
                        />
                      ))}
                    </div>
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
