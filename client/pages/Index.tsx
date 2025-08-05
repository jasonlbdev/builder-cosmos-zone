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
import { cn } from "@/lib/utils";
import { getEmails, getSentEmails, getArchivedEmails, getDeletedEmails, type Email } from "../../shared/data/mockData";
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
        unreadCount: 15,
      },
    ],
  },
  communication: {
    name: "Communication",
    isOpen: true,
    items: [
      {
        name: "Slack",
        status: "healthy",
        lastSync: "2 mins ago",
        workspaces: ["Development", "Marketing"],
        unreadCount: 12,
      },
      {
        name: "WhatsApp",
        status: "healthy",
        lastSync: "5 mins ago",
        workspaces: ["Business"],
        unreadCount: 3,
      },
      {
        name: "Telegram",
        status: "warning",
        lastSync: "1 hour ago",
        workspaces: ["Support"],
        unreadCount: 0,
      },
    ],
  },
  social: {
    name: "Social Media",
    isOpen: false,
    items: [
      {
        name: "Instagram",
        status: "healthy",
        lastSync: "10 mins ago",
        workspaces: ["Business Account"],
        unreadCount: 5,
      },
      {
        name: "Facebook",
        status: "error",
        lastSync: "3 hours ago",
        workspaces: ["Page Messages"],
        unreadCount: 8,
      },
    ],
  },
  fileStorage: {
    name: "File Storage",
    isOpen: false,
    items: [
      {
        name: "OneDrive",
        status: "healthy",
        lastSync: "15 mins ago",
        workspaces: ["Personal", "Business"],
        unreadCount: 0,
      },
      {
        name: "Google Drive",
        status: "healthy",
        lastSync: "8 mins ago",
        workspaces: ["Shared Drives", "My Drive"],
        unreadCount: 0,
      },
      {
        name: "SharePoint",
        status: "warning",
        lastSync: "2 hours ago",
        workspaces: ["Team Sites", "Document Libraries"],
        unreadCount: 0,
      },
      {
        name: "Dropbox",
        status: "disconnected",
        lastSync: "Never",
        workspaces: [],
        unreadCount: 0,
      },
    ],
  },
};

export default function Index() {
  const [selectedSidebarItem, setSelectedSidebarItem] = useState("Inbox");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [replyTo, setReplyTo] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [selectedIntegration, setSelectedIntegration] = useState<string>("All");
  const [showDexterAI, setShowDexterAI] = useState(false);
  const [aiContext, setAiContext] = useState<any>(null);
  const [integrationCategories, setIntegrationCategories] = useState(integrations);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [selectedIntegrationData, setSelectedIntegrationData] = useState<any>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchFilters, setSearchFilters] = useState<any[]>([]);
  const [showEmailChains, setShowEmailChains] = useState(false);

  // Load emails from centralized API on component mount
  useEffect(() => {
    const loadEmails = async () => {
      try {
        setLoading(true);
        const emailData = getEmails();
        setEmails(emailData);
        if (emailData.length > 0 && !selectedEmailId) {
          setSelectedEmailId(emailData[0].id);
        }
      } catch (error) {
        console.error('Failed to load emails:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEmails();
  }, [selectedEmailId]);

  // Listen for AI modal open events from MessageView buttons
  useEffect(() => {
    const handleAIEvent = (event: any) => {
      const { action, ...context } = event.detail;
      setAiContext({ action, ...context });
      setShowDexterAI(true);
    };

    window.addEventListener('openAI', handleAIEvent);

    return () => {
      window.removeEventListener('openAI', handleAIEvent);
    };
  }, []);

  // Filter emails based on selected category and search query
  const getFilteredEmails = () => {
    if (loading) return [];
    
    let categoryEmails: Email[] = [];
    
    switch (selectedSidebarItem) {
      case "Inbox":
        categoryEmails = emails;
        break;
      case "Sent":
        categoryEmails = getSentEmails();
        break;
      case "Starred":
        categoryEmails = emails.filter((email) => email.important);
        break;
      case "Archive":
        categoryEmails = getArchivedEmails();
        break;
      case "Trash":
        categoryEmails = getDeletedEmails();
        break;
      case "To Respond":
        categoryEmails = emails.filter((email) => email.category === "To Respond");
        break;
      case "Awaiting Reply":
        categoryEmails = emails.filter((email) => email.category === "Awaiting Reply");
        break;
      case "Important":
        categoryEmails = emails.filter((email) => email.category === "Important");
        break;
      case "FYI":
        categoryEmails = emails.filter((email) => email.category === "FYI");
        break;
      case "Marketing":
        categoryEmails = emails.filter((email) => email.category === "Marketing");
        break;
      case "Promotions":
        categoryEmails = emails.filter((email) => email.category === "Promotions");
        break;
      case "Updates":
        categoryEmails = emails.filter((email) => email.category === "Updates");
        break;
      default:
        categoryEmails = emails;
    }
    
    // Apply platform filter if specific platform selected
    if (selectedIntegration !== "All") {
      categoryEmails = categoryEmails.filter((email) => email.platform === selectedIntegration);
    }

    // Apply search filter if search query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return categoryEmails.filter((email) =>
        email.sender.toLowerCase().includes(query) ||
        email.subject.toLowerCase().includes(query) ||
        email.preview.toLowerCase().includes(query) ||
        email.content?.toLowerCase().includes(query) ||
        email.email.toLowerCase().includes(query) ||
        email.labels.some(label => label.toLowerCase().includes(query))
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

  // Email action handlers
  const handleReply = () => {
    if (selectedEmail) {
      setReplyTo(selectedEmail.email);
      setReplySubject(`Re: ${selectedEmail.subject}`);
      setShowCompose(true);
    }
  };

  const handleForward = () => {
    if (selectedEmail) {
      setReplyTo("");
      setReplySubject(`Fwd: ${selectedEmail.subject}`);
      setShowCompose(true);
    }
  };

  const handleArchive = async () => {
    if (selectedEmail) {
      try {
        const response = await fetch(`/api/emails/${selectedEmail.id}/archive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          toast({
            title: "Email Archived",
            description: "Email has been moved to archive."
          });
          // Remove from current view
          setEmails(prev => prev.filter(email => email.id !== selectedEmail.id));
          setSelectedEmail(null);
        } else {
          throw new Error('Failed to archive email');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to archive email. Please try again.",
          variant: "destructive"
        });
      }
      setEmails(prev => prev.filter(email => email.id !== selectedEmail.id));
      // Select next email
      const currentIndex = filteredEmails.findIndex(email => email.id === selectedEmail.id);
      const nextEmail = filteredEmails[currentIndex + 1] || filteredEmails[currentIndex - 1];
      if (nextEmail) {
        setSelectedEmailId(nextEmail.id);
      }
    }
  };

  const handleStar = async () => {
    if (selectedEmail) {
      try {
        const response = await fetch(`/api/emails/${selectedEmail.id}/star`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ starred: !selectedEmail.important })
        });
        
        if (response.ok) {
          toast({
            title: selectedEmail.important ? "Star Removed" : "Email Starred",
            description: selectedEmail.important ? "Email unmarked as important." : "Email marked as important."
          });
        } else {
          throw new Error('Failed to toggle star');
        }
      } catch (error) {
        toast({
          title: "Error", 
          description: "Failed to update email. Please try again.",
          variant: "destructive"
        });
      }
      
      // Update local state (always do this regardless of API result)
      setEmails(prev => prev.map(email => 
        email.id === selectedEmail.id 
          ? { ...email, important: !email.important }
          : email
      ));
    }
  };

  const handleDelete = async () => {
    if (selectedEmail) {
      try {
        const response = await fetch(`/api/emails/${selectedEmail.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          toast({
            title: "Email Deleted",
            description: "Email has been permanently deleted."
          });
        } else {
          throw new Error('Failed to delete email');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete email. Please try again.",
          variant: "destructive"
        });
      }
      
      // Remove from current view (always do this)
      setEmails(prev => prev.filter(email => email.id !== selectedEmail.id));
      // Select next email
      const currentIndex = filteredEmails.findIndex(email => email.id === selectedEmail.id);
      const nextEmail = filteredEmails[currentIndex + 1] || filteredEmails[currentIndex - 1];
      if (nextEmail) {
        setSelectedEmailId(nextEmail.id);
      }
    }
  };

  const handleMarkAsRead = async () => {
    if (selectedEmail) {
      try {
        const response = await fetch(`/api/emails/${selectedEmail.id}/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: !selectedEmail.read })
        });
        
        if (response.ok) {
          toast({
            title: selectedEmail.read ? "Marked as Unread" : "Marked as Read",
            description: `Email ${selectedEmail.read ? 'unmarked' : 'marked'} as read.`
          });
        } else {
          throw new Error('Failed to update read status');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update email. Please try again.",
          variant: "destructive"
        });
      }
      
      // Update local state (always do this)
      setEmails(prev => prev.map(email => 
        email.id === selectedEmail.id 
          ? { ...email, unread: !email.unread }
          : email
      ));
    }
  };

  const handleAddLabel = () => {
    if (selectedEmail) {
      toast({
        title: "Labels Feature",
        description: "Label management will be available once you connect your email accounts in Settings → Email Accounts."
      });
    }
  };

  const handleSnooze = () => {
    if (selectedEmail) {
      toast({
        title: "Snooze Feature",
        description: "Email snoozing will be available once you connect your email accounts in Settings → Email Accounts."
      });
    }
  };

  const toggleIntegrationCategory = (categoryKey: keyof typeof integrations) => {
    setIntegrationCategories((prev) => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        isOpen: !prev[categoryKey].isOpen,
      },
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
        return "bg-gray-300";
      default:
        return "bg-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-48px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Dexter</h1>
          </div>

          <div className="relative flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search emails, contacts, or commands..."
                className="pl-10 w-96"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleBasicSearch();
                  }
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedSearch(true)}
              className="flex items-center space-x-1"
            >
              <Filter className="w-4 h-4" />
              <span>Advanced</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant={showEmailChains ? "default" : "outline"}
            size="sm"
            onClick={() => setShowEmailChains(!showEmailChains)}
            className="flex items-center space-x-1"
          >
            <GitBranch className="w-4 h-4" />
            <span>Chains</span>
          </Button>
          <Button
            onClick={() => setShowCompose(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <PenTool className="w-4 h-4 mr-2" />
            Compose
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings">
              <Settings className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
            <div className="h-full border-r border-border">
              <div className="p-4">
                <div className="space-y-1">
                  {sidebarItems.map((item) => (
                    <Button
                      key={item.label}
                      variant={
                        selectedSidebarItem === item.label
                          ? "secondary"
                          : "ghost"
                      }
                      className="w-full justify-start"
                      onClick={() => setSelectedSidebarItem(item.label)}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.count > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.count}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

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
                                // If not connected, redirect to integration setup
                                if (item.status === 'disconnected' || item.status === 'error') {
                                  window.location.href = `/integrations?setup=${item.name.toLowerCase()}`;
                                  return;
                                }
                                // Otherwise show integration details modal
                                setSelectedIntegration(item.name);
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
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Email List */}
          <ResizablePanel defaultSize={35}>
            <div className="h-full border-r border-border">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">{selectedSidebarItem}</h2>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Platform Filter */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Filter by:</span>
                  <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">
                        <div className="flex items-center space-x-2">
                          <span>🌐</span>
                          <span>All Platforms</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Gmail">
                        <div className="flex items-center space-x-2">
                          <span>📧</span>
                          <span>Gmail</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Outlook">
                        <div className="flex items-center space-x-2">
                          <span>📨</span>
                          <span>Outlook</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="WhatsApp">
                        <div className="flex items-center space-x-2">
                          <span>💬</span>
                          <span>WhatsApp</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Slack">
                        <div className="flex items-center space-x-2">
                          <span>💼</span>
                          <span>Slack</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Telegram">
                        <div className="flex items-center space-x-2">
                          <span>📨</span>
                          <span>Telegram</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {selectedIntegration !== "All" && (
                    <Badge variant="secondary" className="text-xs">
                      {filteredEmails.length} message{filteredEmails.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-80px)]">
                <div className="p-2">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer border transition-colors",
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Message Content */}
          <ResizablePanel defaultSize={45}>
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
          </ResizablePanel>
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
                  <Button variant="outline" size="sm">
                    {selectedIntegrationData.status === 'error' ? 'Reconnect' : 'Test Connection'}
                  </Button>
                </div>
              </div>

              {/* Workspaces Section */}
              {selectedIntegrationData.workspaces && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Connected {selectedIntegrationData.name === 'Slack' ? 'Workspaces' : 'Accounts'}</h3>
                  <div className="space-y-2">
                    {selectedIntegrationData.workspaces.map((workspace: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{workspace}</span>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sync messages</span>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email notifications</span>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-categorize</span>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" className="text-red-600">
                  Disconnect {selectedIntegrationData.name}
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setShowIntegrationModal(false)}>
                    Close
                  </Button>
                  <Button>
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
