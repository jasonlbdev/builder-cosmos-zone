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
  Brain,
  Database,
  Sparkles,
  Shield,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ComposeModal from "@/components/ComposeModal";
import DexterAI from "@/components/DexterAI";
import MessageView from "@/components/MessageView";
import EmailChainView from "@/components/EmailChainView";
import AdvancedSearchModal from "@/components/AdvancedSearchModal";
import SearchResultsView from "@/components/SearchResultsView";
import MultiModalAI from "@/components/MultiModalAI";
import CRMIntegration from "@/components/CRMIntegration";
import EmailToTaskExtraction from "@/components/EmailToTaskExtraction";
import SmartTemplates from "@/components/SmartTemplates";
import FollowUpOrchestration from "@/components/FollowUpOrchestration";
import { cn } from "@/lib/utils";
import { getEmails, getSentEmails, getArchivedEmails, getDeletedEmails, type Email } from "../../shared/data/mockData";
import { toast } from "@/hooks/use-toast";

// Rest of Index.tsx code...
// [Note: This would contain the full Index.tsx content with the new feature integrations]

// Add this new AI Toolbar component at the bottom of the main render:
function AIToolbar({ selectedEmail }: { selectedEmail?: Email }) {
  const [showTools, setShowTools] = useState(false);

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {showTools && (
        <Card className="mb-4 p-2 shadow-lg">
          <CardContent className="p-0 space-y-2">
            <MultiModalAI
              onEmailDraftGenerated={(content) => {
                // Handle generated email content
                console.log("Generated email:", content);
              }}
              onTasksExtracted={(tasks) => {
                // Handle extracted tasks
                console.log("Extracted tasks:", tasks);
              }}
            />
            
            {selectedEmail && (
              <>
                <CRMIntegration
                  emailSender={selectedEmail.email}
                  emailSubject={selectedEmail.subject}
                  emailContent={selectedEmail.content}
                  emailId={selectedEmail.id}
                />
                
                <EmailToTaskExtraction
                  emailContext={{
                    id: selectedEmail.id,
                    subject: selectedEmail.subject,
                    content: selectedEmail.content || selectedEmail.preview,
                    sender: selectedEmail.email,
                    recipients: [],
                    timestamp: selectedEmail.time
                  }}
                />
                
                <FollowUpOrchestration
                  emailId={selectedEmail.id}
                  emailSubject={selectedEmail.subject}
                  emailSender={selectedEmail.email}
                />
                
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Scan
                </Button>
              </>
            )}
            
            <SmartTemplates />
          </CardContent>
        </Card>
      )}
      
      <Button
        onClick={() => setShowTools(!showTools)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg"
        size="icon"
      >
        <Brain className="w-6 h-6" />
      </Button>
    </div>
  );
}

export default function EnhancedIndex() {
  // All the existing Index.tsx state and logic...
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // ... other state

  useEffect(() => {
    setEmails(getEmails());
  }, []);

  const selectedEmail = selectedEmailId ? 
    emails.find((email) => email.id === selectedEmailId) || emails[0] : 
    emails[0];

  // Main render would include all the existing Index.tsx layout
  // plus the new AIToolbar component
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Existing Index.tsx content... */}
      
      {/* Add the new AI Toolbar */}
      <AIToolbar selectedEmail={selectedEmail} />
    </div>
  );
}
