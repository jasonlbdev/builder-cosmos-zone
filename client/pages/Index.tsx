import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Settings,
  Plus,
  Archive,
  Trash2,
  Star,
  Reply,
  Forward,
  MoreHorizontal,
  Inbox,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  MessageSquare,
  Zap,
  PenTool,
  Mail,
  Bot,
  ChevronDown,
  ChevronRight,
  Calendar,
  CheckSquare,
  Filter,
  GitBranch,
  PanelLeftClose,
  PanelRightClose,
  PanelLeft,
  PanelRight,
  Shield,
  ShieldAlert,
  Database,
  Brain,
  Building2,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ComposeModal from "@/components/ComposeModal";
import DexterAI from "@/components/DexterAI";
import MessageView from "@/components/MessageView";
import EmailChainView from "@/components/EmailChainView";
import AdvancedSearchModal from "@/components/AdvancedSearchModal";
import SearchResultsView from "@/components/SearchResultsView";
import CRMIntegration from "@/components/CRMIntegration";
import EmailToTaskExtraction from "@/components/EmailToTaskExtraction";
import SecurityThreatDetection from "@/components/SecurityThreatDetection";
import { cn } from "@/lib/utils";
import { getEmails, getSentEmails, getArchivedEmails, getDeletedEmails, type Email } from "../../shared/data/mockData";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sidebarItemsTemplate = [
  { icon: Inbox, label: "Inbox", active: true },
  { icon: Send, label: "Sent" },
  { icon: CheckCircle, label: "To Respond" },
  { icon: Clock, label: "Awaiting Reply" },
  { icon: AlertCircle, label: "Important" },
  { icon: Star, label: "Starred" },
  { icon: Users, label: "FYI" },
  { icon: MessageSquare, label: "Marketing" },
  { icon: Zap, label: "Promotions" },
  { icon: Settings, label: "Updates" },
  { icon: Archive, label: "Archive" },
  { icon: Trash2, label: "Trash" },
];

const integrations = {
  emailProviders: {
    name: "Email Providers",
    isOpen: true,
    items: [
      {
        name: "Gmail",
        status: "healthy",
        lastSync: "1 min ago",
        workspaces: ["Personal", "Work"],
        unreadCount: 24,
      },
      {
        name: "Outlook",
        status: "healthy",
        lastSync: "3 mins ago",
        workspaces: ["Business", "Corporate"],
        unreadCount: 8,
      },
    ],
  },
  messagingPlatforms: {
    name: "Messaging Platforms",
    isOpen: true,
    items: [
      {
        name: "Slack",
        status: "healthy",
        lastSync: "2 mins ago",
        workspaces: ["Development Team", "Marketing Team"],
        unreadCount: 12,
      },
      {
        name: "WhatsApp",
        status: "warning",
        lastSync: "15 mins ago",
        workspaces: ["Business", "Personal"],
        unreadCount: 3,
      },
      {
        name: "Telegram",
        status: "healthy",
        lastSync: "1 min ago",
        workspaces: ["Personal"],
        unreadCount: 0,
      },
    ],
  },
  socialPlatforms: {
    name: "Social Platforms",
    isOpen: false,
    items: [
      {
        name: "Instagram",
        status: "disconnected",
        lastSync: "Never",
        workspaces: [],
        unreadCount: 0,
      },
      {
        name: "Facebook",
        status: "error",
        lastSync: "2 hours ago",
        workspaces: ["Business Page"],
        unreadCount: 0,
      },
    ],
  },
};

// Helper function to check if email looks suspicious
const getEmailSecurityStatus = (email: Email) => {
  const suspiciousPatterns = [
    "urgent action required",
    "verify your account", 
    "click here immediately",
    "suspended",
    "confirm identity"
  ];
  
  const contentLower = (email.content || email.preview || email.subject).toLowerCase();
  const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
    contentLower.includes(pattern)
  );
  
  const isExternalSender = !email.email.includes("@company.com");
  
  if (hasSuspiciousContent && isExternalSender) {
    return { status: "threat", level: "high", type: "phishing" };
  } else if (hasSuspiciousContent || isExternalSender) {
    return { status: "suspicious", level: "medium", type: "unknown" };
  }
  
  return { status: "safe", level: "low", type: "safe" };
};

// Mock CRM contact data
const getCRMContactForEmail = (email: string) => {
  const mockContacts: any = {
    "john.smith@techcorp.com": {
      name: "John Smith",
      company: "TechCorp Solutions", 
      status: "customer",
      leadScore: 85,
      lastInteraction: "2024-01-20",
      tags: ["enterprise", "high-value"]
    },
    "sarah.johnson@startup.io": {
      name: "Sarah Johnson",
      company: "StartupIO",
      status: "prospect", 
      leadScore: 72,
      lastInteraction: "2024-01-18",
      tags: ["startup", "ceo"]
    }
  };
  
  return mockContacts[email] || null;
};

export default function Index() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntegration, setSelectedIntegration] = useState("All");
  const [showCompose, setShowCompose] = useState(false);
  const [replyTo, setReplyTo] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [showEmailChain, setShowEmailChain] = useState(false);
  const [integrationCategories, setIntegrationCategories] = useState(integrations);
  const [showDexterAI, setShowDexterAI] = useState(false);
  const [aiContext, setAiContext] = useState<any>(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [selectedIntegration2, setSelectedIntegration2] = useState<string | null>(null);
  const [selectedIntegrationData, setSelectedIntegrationData] = useState<any>(null);
  
  // New feature states
  const [showCRM, setShowCRM] = useState(false);
  const [showTaskExtraction, setShowTaskExtraction] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);

  useEffect(() => {
    setEmails(getEmails());
  }, []);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return [{ text, highlighted: false }];
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => ({
      text: part,
      highlighted: part.toLowerCase() === query.toLowerCase()
    }));
  };

  const toggleIntegrationCategory = (key: keyof typeof integrations) => {
    setIntegrationCategories(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isOpen: !prev[key].isOpen
      }
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "disconnected":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const handleReply = (email: Email) => {
    setReplyTo(email.email);
    setReplySubject(`Re: ${email.subject}`);
    setShowCompose(true);
  };

  const handleForward = (email: Email) => {
    setReplySubject(`Fwd: ${email.subject}`);
    setShowCompose(true);
  };

  const handleArchive = (email: Email) => {
    toast({
      title: "Email archived",
      description: `"${email.subject}" has been archived.`,
    });
  };

  const handleStar = (email: Email) => {
    setEmails(prev => prev.map(e => 
      e.id === email.id ? { ...e, important: !e.important } : e
    ));
  };

  const handleDelete = (email: Email) => {
    toast({
      title: "Email deleted",
      description: `"${email.subject}" has been moved to trash.`,
    });
  };

  const handleMarkAsRead = (email: Email) => {
    setEmails(prev => prev.map(e => 
      e.id === email.id ? { ...e, unread: false } : e
    ));
  };

  const handleAddLabel = (email: Email, label: string) => {
    setEmails(prev => prev.map(e => 
      e.id === email.id ? { ...e, labels: [...(e.labels || []), label] } : e
    ));
  };

  const handleSnooze = (email: Email, until: Date) => {
    toast({
      title: "Email snoozed",
      description: `"${email.subject}" snoozed until ${until.toLocaleDateString()}.`,
    });
  };

  const getFilteredEmails = () => {
    let categoryEmails = emails;
    
    if (selectedIntegration !== "All") {
      categoryEmails = emails.filter(email => email.platform === selectedIntegration);
    }
    
    if (searchQuery.trim()) {
      return categoryEmails.filter((email) =>
        email.sender.toLowerCase().includes(searchQuery) ||
        email.subject.toLowerCase().includes(searchQuery) ||
        email.preview.toLowerCase().includes(searchQuery) ||
        email.content?.toLowerCase().includes(searchQuery) ||
        email.email.toLowerCase().includes(searchQuery) ||
        email.labels?.some(label => label.toLowerCase().includes(searchQuery))
      );
    }
    
    return categoryEmails;
  };

  const filteredEmails = getFilteredEmails();
  const selectedEmail = selectedEmailId ? 
    emails.find((email) => email.id === selectedEmailId) || emails[0] : 
    emails[0];

  // Calculate dynamic counts for sidebar items
  const getSidebarItemsWithCounts = () => {
    return sidebarItemsTemplate.map(item => {
      let count = 0;
      
      switch (item.label) {
        case "Inbox":
          count = emails.length;
          break;
        case "Sent":
          count = getSentEmails().length;
          break;
        case "To Respond":
          count = emails.filter(email => email.category === "To Respond").length;
          break;
        case "Awaiting Reply":
          count = emails.filter(email => email.category === "Awaiting Reply").length;
          break;
        case "Important":
          count = emails.filter(email => email.category === "Important" || email.important).length;
          break;
        case "Starred":
          count = emails.filter(email => email.important).length;
          break;
        case "FYI":
          count = emails.filter(email => email.category === "FYI").length;
          break;
        case "Marketing":
          count = emails.filter(email => email.category === "Marketing").length;
          break;
        case "Promotions":
          count = emails.filter(email => email.category === "Promotions").length;
          break;
        case "Updates":
          count = emails.filter(email => email.category === "Updates").length;
          break;
        case "Archive":
          count = getArchivedEmails().length;
          break;
        case "Trash":
          count = getDeletedEmails().length;
          break;
        default:
          count = 0;
      }
      
      return { ...item, count };
    });
  };

  const sidebarItems = getSidebarItemsWithCounts();

  // Search handlers
  const handleBasicSearch = () => {
    if (searchQuery.trim()) {
      // Simulate search results with highlighting
      const results = filteredEmails.map(email => ({
        id: email.id,
        type: "email" as const,
        title: email.subject,
        content: email.content || email.preview,
        sender: email.sender,
        platform: email.platform,
        platformLogo: email.platformLogo,
        time: email.time,
        avatar: email.avatar,
        category: email.category,
        categoryColor: email.categoryColor,
        matchedFields: ["subject", "content"],
        relevanceScore: 0.8,
        highlights: [
          {
            field: "title",
            matches: highlightText(email.subject, searchQuery)
          },
          {
            field: "content",
            matches: highlightText(email.content || email.preview, searchQuery)
          }
        ]
      }));

      setSearchResults(results);
      setShowSearchResults(true);
    }
  };

  const handleAdvancedSearch = (filters: any) => {
    console.log("Advanced search filters:", filters);
    // Process advanced search
    setShowAdvancedSearch(false);
    setShowSearchResults(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBasicSearch();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Dexter</h1>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-64"
              />
              <AdvancedSearchModal 
                onSearch={handleAdvancedSearch}
                trigger={
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced
                  </Button>
                }
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {selectedEmail && (
              <div className="flex items-center space-x-2">
                <CRMIntegration
                  emailSender={selectedEmail.email}
                  emailSubject={selectedEmail.subject}
                  emailContent={selectedEmail.content}
                  emailId={selectedEmail.id}
                >
                  <Button variant="outline" size="sm">
                    <Database className="w-4 h-4 mr-2" />
                    CRM
                  </Button>
                </CRMIntegration>

                <EmailToTaskExtraction
                  emailContext={{
                    id: selectedEmail.id,
                    subject: selectedEmail.subject,
                    content: selectedEmail.content || selectedEmail.preview,
                    sender: selectedEmail.email,
                    recipients: [],
                    timestamp: selectedEmail.time
                  }}
                >
                  <Button variant="outline" size="sm">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                </EmailToTaskExtraction>

                <SecurityThreatDetection
                  emailId={selectedEmail.id}
                  emailContent={selectedEmail.content}
                  emailSender={selectedEmail.email}
                  emailSubject={selectedEmail.subject}
                >
                  <Button variant="outline" size="sm">
                    <Shield className="w-4 h-4 mr-2" />
                    Security
                  </Button>
                </SecurityThreatDetection>
              </div>
            )}

            <Separator orientation="vertical" className="h-6" />
            
            <Button
              onClick={() => setShowEmailChain(!showEmailChain)}
              variant={showEmailChain ? "default" : "outline"}
              size="sm"
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Chain View
            </Button>

            <Button onClick={() => setShowCompose(true)}>
              <PenTool className="w-4 h-4 mr-2" />
              Compose
            </Button>

            <Link to="/settings">
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Search Results View */}
      {showSearchResults && (
        <SearchResultsView
          results={searchResults}
          query={searchQuery}
          onClose={() => setShowSearchResults(false)}
          onSelectResult={(result) => {
            setSelectedEmailId(result.id);
            setShowSearchResults(false);
          }}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Collapsible Left Panel */}
          {!leftPanelCollapsed && (
            <>
              <ResizablePanel defaultSize={20} minSize={15}>
                <div className="h-full border-r border-border">
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-sm font-semibold">Navigation</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLeftPanelCollapsed(true)}
                      >
                        <PanelLeftClose className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="h-[calc(100%-60px)]">
                    <div className="p-2">
                      {sidebarItems.map((item) => (
                        <Button
                          key={item.label}
                          variant={item.active ? "default" : "ghost"}
                          className="w-full justify-start mb-1"
                          size="sm"
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.count > 0 && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {item.count}
                            </Badge>
                          )}
                        </Button>
                      ))}

                      <Separator className="my-4" />

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground px-2">
                          Productivity
                        </h3>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          asChild
                        >
                          <Link to="/calendar">
                            <Calendar className="w-4 h-4 mr-3" />
                            Calendar
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          asChild
                        >
                          <Link to="/tasks">
                            <CheckSquare className="w-4 h-4 mr-3" />
                            Tasks
                          </Link>
                        </Button>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground px-2">
                          Integrations
                        </h3>
                        {Object.entries(integrationCategories).map(([key, category]) => (
                          <div key={key} className="space-y-1">
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-xs p-2"
                              onClick={() => toggleIntegrationCategory(key as keyof typeof integrations)}
                            >
                              {category.isOpen ? (
                                <ChevronDown className="w-3 h-3 mr-2" />
                              ) : (
                                <ChevronRight className="w-3 h-3 mr-2" />
                              )}
                              {category.name}
                            </Button>
                            {category.isOpen && (
                              <div className="ml-4 space-y-1">
                                {category.items.map((item) => (
                                  <Button
                                    key={item.name}
                                    variant="ghost"
                                    className="w-full justify-start text-xs p-1"
                                    onClick={() => {
                                      if (item.status === 'disconnected' || item.status === 'error') {
                                        window.location.href = `/integrations?setup=${item.name.toLowerCase()}`;
                                        return;
                                      }
                                      setSelectedIntegration2(item.name);
                                      setSelectedIntegrationData(item);
                                      setShowIntegrationModal(true);
                                    }}
                                  >
                                    <div
                                      className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(
                                        item.status,
                                      )}`}
                                    />
                                    <span className="flex-1 text-left">{item.name}</span>
                                    {item.unreadCount > 0 && (
                                      <Badge variant="secondary" className="ml-auto text-xs">
                                        {item.unreadCount}
                                      </Badge>
                                    )}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Collapsed Left Panel Trigger */}
          {leftPanelCollapsed && (
            <div className="w-12 border-r border-border flex flex-col items-center py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeftPanelCollapsed(false)}
                className="mb-2"
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Email List Panel */}
          <ResizablePanel defaultSize={rightPanelCollapsed ? 75 : 40}>
            <div className="h-full">
              {showEmailChain && selectedEmail ? (
                <EmailChainView 
                  email={selectedEmail} 
                  onClose={() => setShowEmailChain(false)}
                />
              ) : (
                <>
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Messages</SelectItem>
                            <SelectItem value="Gmail">Gmail</SelectItem>
                            <SelectItem value="Outlook">Outlook</SelectItem>
                            <SelectItem value="Slack">Slack</SelectItem>
                            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                            <SelectItem value="Telegram">Telegram</SelectItem>
                          </SelectContent>
                        </Select>
                        {selectedIntegration !== "All" && (
                          <Badge variant="secondary" className="text-xs">
                            {filteredEmails.length} message{filteredEmails.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="h-[calc(100%-80px)]">
                    <div className="p-2">
                      {filteredEmails.map((email) => {
                        const securityStatus = getEmailSecurityStatus(email);
                        const crmContact = getCRMContactForEmail(email.email);
                        
                        return (
                          <div
                            key={email.id}
                            className={cn(
                              "p-3 rounded-lg cursor-pointer border transition-colors mb-2",
                              selectedEmailId === email.id
                                ? "bg-accent border-accent-foreground/20"
                                : "border-transparent hover:bg-accent/50",
                            )}
                            onClick={() => setSelectedEmailId(email.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">
                                  {email.avatar}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={cn(
                                        "text-sm",
                                        email.unread ? "font-medium" : "font-normal",
                                      )}
                                    >
                                      {email.sender}
                                    </span>
                                    {email.platform && (
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-xs px-2 py-0.5",
                                          email.platformColor?.replace("bg-", "border-") || "border-gray-400"
                                        )}
                                      >
                                        <span className="mr-1">{email.platformLogo}</span>
                                        {email.platform}
                                      </Badge>
                                    )}
                                    
                                    {/* CRM Status Badge */}
                                    {crmContact && (
                                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                        <Building2 className="w-3 h-3 mr-1" />
                                        {crmContact.status}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-muted-foreground">
                                      {email.time}
                                    </span>
                                    {email.unread && (
                                      <div className="w-2 h-2 bg-primary rounded-full" />
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 mb-1">
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-xs",
                                      email.categoryColor.replace("bg-", "bg-"),
                                      "text-white",
                                    )}
                                  >
                                    {email.category}
                                  </Badge>
                                  
                                  {/* Security Status Badge */}
                                  {securityStatus.status !== "safe" && (
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-xs",
                                        securityStatus.level === "high" ? "text-red-700 bg-red-50 border-red-200" :
                                        securityStatus.level === "medium" ? "text-orange-700 bg-orange-50 border-orange-200" :
                                        "text-yellow-700 bg-yellow-50 border-yellow-200"
                                      )}
                                    >
                                      {securityStatus.status === "threat" ? (
                                        <ShieldAlert className="w-3 h-3 mr-1" />
                                      ) : (
                                        <Shield className="w-3 h-3 mr-1" />
                                      )}
                                      {securityStatus.status}
                                    </Badge>
                                  )}
                                  
                                  {email.important && <Star className="w-3 h-3 text-yellow-500" />}
                                </div>

                                <h3
                                  className={cn(
                                    "text-sm mb-1 truncate",
                                    email.unread ? "font-medium" : "font-normal",
                                  )}
                                >
                                  {email.subject}
                                </h3>

                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {email.preview}
                                </p>
                                
                                {/* CRM Contact Info */}
                                {crmContact && (
                                  <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                                    <Target className="w-3 h-3" />
                                    <span>{crmContact.company} • Lead Score: {crmContact.leadScore}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          </ResizablePanel>

          {/* Collapsible Right Panel */}
          {!rightPanelCollapsed && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={45}>
                <div className="h-full">
                  <div className="flex items-center justify-between p-2 border-b border-border">
                    <h2 className="text-sm font-semibold">Message Details</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRightPanelCollapsed(true)}
                    >
                      <PanelRightClose className="w-4 h-4" />
                    </Button>
                  </div>
                  <MessageView
                    message={selectedEmail}
                    onReply={handleReply}
                    onForward={handleForward}
                    onArchive={handleArchive}
                    onStar={handleStar}
                    onDelete={handleDelete}
                    onMarkAsRead={handleMarkAsRead}
                    onAddLabel={handleAddLabel}
                    onSnooze={handleSnooze}
                  />
                </div>
              </ResizablePanel>
            </>
          )}

          {/* Collapsed Right Panel Trigger */}
          {rightPanelCollapsed && (
            <div className="w-12 border-l border-border flex flex-col items-center py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightPanelCollapsed(false)}
              >
                <PanelRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </ResizablePanelGroup>
      </div>

      <ComposeModal
        open={showCompose}
        onClose={() => {
          setShowCompose(false);
          setReplyTo("");
          setReplySubject("");
        }}
        replyTo={replyTo}
        subject={replySubject}
        platform={selectedEmail?.platform}
        platformLogo={selectedEmail?.platformLogo}
      />

      <DexterAI 
        open={showDexterAI} 
        onClose={() => {
          setShowDexterAI(false);
          setAiContext(null);
        }}
        initialContext={aiContext}
      />

      {/* Dexter AI Floating Button */}
      <Button
        onClick={() => setShowDexterAI(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg z-50"
        size="icon"
      >
        <div className="text-xl">🤖</div>
      </Button>

      {/* Integration Management Modal */}
      <Dialog open={showIntegrationModal} onOpenChange={setShowIntegrationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>{selectedIntegrationData?.name} Integration</span>
              <div
                className={`w-3 h-3 rounded-full ${getStatusColor(selectedIntegrationData?.status)}`}
              />
            </DialogTitle>
          </DialogHeader>

          {selectedIntegrationData && (
            <div className="space-y-6">
              {/* Status Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Connection Status</h3>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedIntegrationData.status)}`} />
                    <div>
                      <p className="text-sm font-medium capitalize">{selectedIntegrationData.status}</p>
                      <p className="text-xs text-muted-foreground">Last sync: {selectedIntegrationData.lastSync}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Workspaces Section */}
              {selectedIntegrationData.workspaces && selectedIntegrationData.workspaces.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Connected Workspaces</h3>
                  <div className="space-y-2">
                    {selectedIntegrationData.workspaces.map((workspace: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{workspace}</span>
                        <Badge variant="secondary" className="text-xs">Connected</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  Configure
                </Button>
                <Button variant="outline" className="flex-1">
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
