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
import { cn } from "@/lib/utils";
import { getEmails, type Email } from "../../shared/data/mockData";

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
};

export default function Index() {
  const [selectedSidebarItem, setSelectedSidebarItem] = useState("Inbox");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [replyTo, setReplyTo] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [selectedIntegration, setSelectedIntegration] = useState<string>("All");
  const [showDexterAI, setShowDexterAI] = useState(false);
  const [integrationCategories, setIntegrationCategories] = useState(integrations);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Filter emails based on selected category
  const getFilteredEmails = () => {
    if (loading) return [];
    
    switch (selectedSidebarItem) {
      case "Inbox":
        return emails;
      case "Sent":
        return []; // Would fetch sent emails from API
      case "Starred":
        return emails.filter((email) => email.important);
      case "Archive":
        return []; // Would fetch archived emails from API
      case "Trash":
        return []; // Would fetch deleted emails from API
      case "To Respond":
        return emails.filter((email) => email.category === "To Respond");
      case "Awaiting Reply":
        return emails.filter((email) => email.category === "Awaiting Reply");
      case "Important":
        return emails.filter((email) => email.category === "Important");
      case "FYI":
        return emails.filter((email) => email.category === "FYI");
      case "Marketing":
        return emails.filter((email) => email.category === "Marketing");
      case "Promotions":
        return emails.filter((email) => email.category === "Promotions");
      case "Updates":
        return emails.filter((email) => email.category === "Updates");
      default:
        return emails;
    }
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
          count = 0; // Would be actual sent emails count
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
          count = 0; // Would be actual archived emails count
          break;
        case "Trash":
          count = 0; // Would be actual deleted emails count
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

  const handleArchive = () => {
    if (selectedEmail) {
      console.log('Archiving email:', selectedEmail.id);
      // In production, would call API to archive email
      // For now, just remove from current view
      setEmails(prev => prev.filter(email => email.id !== selectedEmail.id));
      // Select next email
      const currentIndex = filteredEmails.findIndex(email => email.id === selectedEmail.id);
      const nextEmail = filteredEmails[currentIndex + 1] || filteredEmails[currentIndex - 1];
      if (nextEmail) {
        setSelectedEmailId(nextEmail.id);
      }
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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search emails, contacts, or commands..."
              className="pl-10 w-96"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
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
                                 setSelectedIntegration(item.name);
                                 // Open integration management page for this platform
                                 window.open(`/integrations/${item.name.toLowerCase()}`, '_blank');
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
                                <div className="flex items-center">
                                  <span className="text-xs">{email.platformLogo}</span>
                                </div>
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

      <DexterAI open={showDexterAI} onClose={() => setShowDexterAI(false)} />

      {/* Dexter AI Floating Button */}
      <Button
        onClick={() => setShowDexterAI(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg z-50"
        size="icon"
      >
        <div className="text-xl">🤖</div>
      </Button>
    </div>
  );
}