import { useState, useEffect } from "react";
import {
  X,
  Send,
  Paperclip,
  Smile,
  Bold,
  Italic,
  Underline,
  Link,
  Zap,
  ChevronDown,
  Mail,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { getUserAccounts, getContacts, getFrequentContacts, type UserAccount, type Contact } from "../../shared/data/mockData";

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  replyTo?: string;
  subject?: string;
  platform?: string;
  platformLogo?: string;
}

// Available platforms for composing
const availablePlatforms = [
  { id: "Gmail", name: "Gmail", icon: "📧", type: "email" },
  { id: "Outlook", name: "Outlook", icon: "📨", type: "email" },
  { id: "WhatsApp", name: "WhatsApp", icon: "💬", type: "messaging" },
  { id: "Telegram", name: "Telegram", icon: "📱", type: "messaging" },
  { id: "Slack", name: "Slack", icon: "💼", type: "messaging" },
];

export function ComposeModal({
  open,
  onClose,
  replyTo,
  subject,
  platform: initialPlatform = "Gmail",
  platformLogo = "📧",
}: ComposeModalProps) {
  // Platform and account selection
  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatform);
  const [selectedFromAccount, setSelectedFromAccount] = useState<UserAccount | null>(null);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  
  // Recipients and contacts
  const [to, setTo] = useState(replyTo || "");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  
  // Content
  const [emailSubject, setEmailSubject] = useState(subject || "");
  const [content, setContent] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  
  // Toast for notifications
  const { toast } = useToast();

  // Load user accounts and contacts when platform changes
  useEffect(() => {
    const accounts = getUserAccounts(selectedPlatform);
    setUserAccounts(accounts);
    
    // Set default account
    const defaultAccount = accounts.find(acc => acc.isDefault) || accounts[0];
    setSelectedFromAccount(defaultAccount);
    
    // Load contacts for this platform
    const contacts = getContacts(selectedPlatform);
    setAvailableContacts(contacts);
  }, [selectedPlatform]);

  const currentPlatform = availablePlatforms.find(p => p.id === selectedPlatform);
  const isEmailPlatform = currentPlatform?.type === "email";
  const isMessagingPlatform = currentPlatform?.type === "messaging";

  const getPlaceholderText = () => {
    switch (selectedPlatform) {
      case "WhatsApp":
        return "Type a message...";
      case "Slack":
        return "Message #channel or @person...";
      case "Telegram":
        return "Write a message...";
      default:
        return "Compose your email...";
    }
  };

  const getModalTitle = () => {
    if (subject) return `Reply - ${currentPlatform?.name}`;
    return `New ${isEmailPlatform ? "Email" : "Message"} - ${currentPlatform?.name}`;
  };

  // Contact selection handlers
  const handleContactSelect = (contact: Contact) => {
    const platformData = contact.platforms.find(p => p.platform === selectedPlatform);
    if (platformData) {
      const currentTo = to.split(',').map(t => t.trim()).filter(t => t);
      if (!currentTo.includes(platformData.address)) {
        setTo([...currentTo, platformData.address].join(', '));
      }
      setSelectedContacts([...selectedContacts, contact]);
      setShowContactPicker(false);
    }
  };

  const removeContact = (contactId: string) => {
    const contact = selectedContacts.find(c => c.id === contactId);
    if (contact) {
      const platformData = contact.platforms.find(p => p.platform === selectedPlatform);
      if (platformData) {
        const currentTo = to.split(',').map(t => t.trim()).filter(t => t !== platformData.address);
        setTo(currentTo.join(', '));
      }
      setSelectedContacts(selectedContacts.filter(c => c.id !== contactId));
    }
  };

  const handleSend = async () => {
    try {
      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: to.split(",").map((email) => email.trim()),
          cc: cc ? cc.split(",").map((email) => email.trim()) : undefined,
          bcc: bcc ? bcc.split(",").map((email) => email.trim()) : undefined,
          subject: emailSubject,
          content: content,
        }),
      });

      if (response.ok) {
        onClose();
        // Reset form
        setTo("");
        setCc("");
        setBcc("");
        setEmailSubject("");
        setContent("");
      }
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  const generateAIContent = async () => {
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "reply",
          context: { to, subject: emailSubject },
        }),
      });

      const data = await response.json();
      if (data.suggestion) {
        setContent(data.suggestion);
      }
    } catch (error) {
      console.error("Failed to generate AI content:", error);
    }
  };

  const saveDraft = async () => {
    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: to.split(",").map((email) => email.trim()),
          cc: cc ? cc.split(",").map((email) => email.trim()) : undefined,
          bcc: bcc ? bcc.split(",").map((email) => email.trim()) : undefined,
          subject: emailSubject,
          content: content,
          platform: selectedPlatform,
          fromAccount: selectedFromAccount?.id,
        }),
      });

      if (response.ok) {
        toast({
          title: "Draft Saved",
          description: "Your draft has been saved successfully.",
          variant: "default",
        });
      } else {
        throw new Error("Failed to save draft");
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast({
        title: "Save Failed",
        description: "Could not save draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleScheduleSend = async () => {
    if (!scheduleDate || !scheduleTime) {
      toast({
        title: "Schedule Required",
        description: "Please select both date and time for scheduling.",
        variant: "destructive",
      });
      return;
    }

    const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    if (scheduleDateTime <= new Date()) {
      toast({
        title: "Invalid Schedule",
        description: "Please select a future date and time.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/emails/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: to.split(",").map((email) => email.trim()),
          cc: cc ? cc.split(",").map((email) => email.trim()) : undefined,
          bcc: bcc ? bcc.split(",").map((email) => email.trim()) : undefined,
          subject: emailSubject,
          content: content,
          platform: selectedPlatform,
          fromAccount: selectedFromAccount?.id,
          scheduledFor: scheduleDateTime.toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Message Scheduled",
          description: `Your message will be sent on ${scheduleDateTime.toLocaleDateString()} at ${scheduleDateTime.toLocaleTimeString()}.`,
          variant: "default",
        });
        setShowScheduleModal(false);
        setScheduleDate("");
        setScheduleTime("");
        onClose();
      } else {
        throw new Error("Failed to schedule message");
      }
    } catch (error) {
      console.error("Failed to schedule message:", error);
      toast({
        title: "Schedule Failed",
        description: "Could not schedule message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-lg">{currentPlatform?.icon}</span>
              <span>{getModalTitle()}</span>
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-full max-h-[70vh]">
          <div className="p-6 space-y-4">
            {/* Platform Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Platform</Label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center space-x-2">
                        <span>{currentPlatform?.icon}</span>
                        <span>{currentPlatform?.name}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatforms.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        <div className="flex items-center space-x-2">
                          <span>{platform.icon}</span>
                          <span>{platform.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* From Account Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 block">From</Label>
                <Select 
                  value={selectedFromAccount?.id || ""} 
                  onValueChange={(accountId) => {
                    const account = userAccounts.find(acc => acc.id === accountId);
                    setSelectedFromAccount(account || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {selectedFromAccount && (
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-xs">
                              {selectedFromAccount.avatar || selectedFromAccount.displayName.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col items-start">
                            <span className="text-sm">{selectedFromAccount.displayName}</span>
                            <span className="text-xs text-muted-foreground">{selectedFromAccount.address}</span>
                          </div>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {userAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-xs">
                              {account.avatar || account.displayName.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col items-start">
                            <span className="text-sm">{account.displayName}</span>
                            <span className="text-xs text-muted-foreground">{account.address}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recipients */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="to" className="text-sm font-medium min-w-0 w-8">
                  To:
                </Label>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Input
                      id="to"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder={
                        isEmailPlatform
                          ? "Enter email addresses..."
                          : `Enter ${currentPlatform?.name} username or phone...`
                      }
                      className="flex-1"
                    />
                    <Popover open={showContactPicker} onOpenChange={setShowContactPicker}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Users className="w-4 h-4 mr-1" />
                          Contacts
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="end">
                        <div className="space-y-3">
                          <h4 className="font-medium">Select Contact</h4>
                          
                          {/* Frequent Contacts */}
                          <div>
                            <Label className="text-xs text-muted-foreground">FREQUENT</Label>
                            <ScrollArea className="h-32">
                              <div className="space-y-1">
                                {getFrequentContacts(selectedPlatform).map((contact) => {
                                  const platformData = contact.platforms.find(p => p.platform === selectedPlatform);
                                  return platformData ? (
                                    <Button
                                      key={contact.id}
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start h-auto p-2"
                                      onClick={() => handleContactSelect(contact)}
                                    >
                                      <Avatar className="w-8 h-8 mr-3">
                                        <AvatarFallback>{contact.avatar}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col items-start">
                                        <span className="text-sm font-medium">{contact.name}</span>
                                        <span className="text-xs text-muted-foreground">{platformData.address}</span>
                                        {contact.company && (
                                          <span className="text-xs text-muted-foreground">{contact.company}</span>
                                        )}
                                      </div>
                                    </Button>
                                  ) : null;
                                })}
                              </div>
                            </ScrollArea>
                          </div>

                          <Separator />

                          {/* All Contacts */}
                          <div>
                            <Label className="text-xs text-muted-foreground">ALL CONTACTS</Label>
                            <ScrollArea className="h-40">
                              <div className="space-y-1">
                                {availableContacts.map((contact) => {
                                  const platformData = contact.platforms.find(p => p.platform === selectedPlatform);
                                  return platformData ? (
                                    <Button
                                      key={contact.id}
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start h-auto p-2"
                                      onClick={() => handleContactSelect(contact)}
                                    >
                                      <Avatar className="w-8 h-8 mr-3">
                                        <AvatarFallback>{contact.avatar}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col items-start">
                                        <span className="text-sm font-medium">{contact.name}</span>
                                        <span className="text-xs text-muted-foreground">{platformData.address}</span>
                                        {platformData.lastContact && (
                                          <span className="text-xs text-muted-foreground">Last: {platformData.lastContact}</span>
                                        )}
                                      </div>
                                    </Button>
                                  ) : null;
                                })}
                              </div>
                            </ScrollArea>
                          </div>

                          <Separator />

                          <Button variant="outline" size="sm" className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Contact
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Selected Contacts */}
                  {selectedContacts.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedContacts.map((contact) => (
                        <Badge
                          key={contact.id}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeContact(contact.id)}
                        >
                          {contact.name} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {isEmailPlatform && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCc(!showCc)}
                      className="text-xs"
                    >
                      Cc
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBcc(!showBcc)}
                      className="text-xs"
                    >
                      Bcc
                    </Button>
                  </>
                )}
              </div>

              {showCc && (
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="cc"
                    className="text-sm font-medium min-w-0 w-8"
                  >
                    Cc:
                  </Label>
                  <Input
                    id="cc"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="Enter CC email addresses..."
                    className="flex-1"
                  />
                </div>
              )}

              {showBcc && (
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="bcc"
                    className="text-sm font-medium min-w-0 w-8"
                  >
                    Bcc:
                  </Label>
                  <Input
                    id="bcc"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    placeholder="Enter BCC email addresses..."
                    className="flex-1"
                  />
                </div>
              )}

              {isEmailPlatform && (
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="subject"
                    className="text-sm font-medium min-w-0 w-8"
                  >
                    Subject:
                  </Label>
                  <Input
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter subject..."
                    className="flex-1"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Formatting Toolbar */}
            <div className="flex items-center space-x-2 py-2">
              <Button variant="ghost" size="sm">
                <Bold className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Italic className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Underline className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Link className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="ghost" size="sm">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Smile className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="ghost"
                size="sm"
                onClick={generateAIContent}
                className="text-primary"
              >
                <Zap className="w-4 h-4 mr-1" />
                AI Draft
              </Button>
            </div>

            <Separator />
          </div>

          {/* Content */}
          <div className="flex-1 px-6">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={getPlaceholderText()}
              className="min-h-[300px] resize-none border-0 focus:ring-0 text-sm leading-relaxed"
            />
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="px-6 py-3 bg-muted/30 border-t">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => setContent(content + " " + suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={saveDraft}
                >
                  Save Draft
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowScheduleModal(true)}
                >
                  Schedule Send
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={
                    !to || !content || (isEmailPlatform && !emailSubject)
                  }
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Schedule Modal */}
    <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schedule-date">Date</Label>
            <Input
              id="schedule-date"
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule-time">Time</Label>
            <Input
              id="schedule-time"
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleSend}>
              Schedule Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ComposeModal;
