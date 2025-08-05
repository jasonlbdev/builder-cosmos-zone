import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  Building2,
  Mail,
  Phone,
  Calendar,
  Star,
  Plus,
  Edit3,
  Save,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  Target,
  Database,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CRMContact, CRMNote } from "../../shared/api";

interface CRMIntegrationProps {
  emailSender?: string;
  emailSubject?: string;
  emailContent?: string;
  emailId?: string;
  onContactUpdated?: (contact: CRMContact) => void;
  trigger?: "manual" | "auto";
}

const mockCRMContacts: CRMContact[] = [
  {
    id: "crm_1",
    email: "john.smith@techcorp.com",
    name: "John Smith",
    company: "TechCorp Solutions",
    title: "VP of Engineering",
    phone: "+1-555-0123",
    lastInteraction: "2024-01-20",
    leadScore: 85,
    status: "customer",
    notes: [
      {
        id: "note_1",
        contactId: "crm_1",
        content: "Discussed Q4 budget planning. Very interested in enterprise features.",
        type: "email",
        relatedEmailId: "email_123",
        createdBy: "system",
        createdAt: "2024-01-20T10:30:00Z",
        metadata: {
          emailSubject: "Q4 Budget Planning Discussion",
          emailDirection: "inbound",
          sentiment: "positive",
          actionItems: ["Follow up with pricing", "Schedule demo"]
        }
      }
    ],
    tags: ["enterprise", "high-value", "technical"],
    customFields: {
      industryVertical: "Technology",
      companySize: "500+",
      decisionMaker: true
    },
    source: "email",
    createdAt: "2023-08-15T14:22:00Z",
    updatedAt: "2024-01-20T10:30:00Z"
  },
  {
    id: "crm_2",
    email: "sarah.johnson@startup.io",
    name: "Sarah Johnson",
    company: "StartupIO",
    title: "CEO",
    phone: "+1-555-0456",
    lastInteraction: "2024-01-18",
    leadScore: 72,
    status: "prospect",
    notes: [
      {
        id: "note_2",
        contactId: "crm_2",
        content: "Initial outreach. Interested in learning more about our product.",
        type: "email",
        relatedEmailId: "email_124",
        createdBy: "sarah.clark@company.com",
        createdAt: "2024-01-18T09:15:00Z",
        metadata: {
          emailSubject: "Introduction to Our Platform",
          emailDirection: "outbound",
          sentiment: "neutral"
        }
      }
    ],
    tags: ["startup", "ceo", "early-stage"],
    customFields: {
      industryVertical: "Fintech",
      companySize: "10-50",
      fundingStage: "Series A"
    },
    source: "email",
    createdAt: "2024-01-18T09:15:00Z",
    updatedAt: "2024-01-18T09:15:00Z"
  }
];

export default function CRMIntegration({
  emailSender,
  emailSubject,
  emailContent,
  emailId,
  onContactUpdated,
  trigger = "manual"
}: CRMIntegrationProps) {
  const [open, setOpen] = useState(trigger === "auto");
  const [contacts, setContacts] = useState<CRMContact[]>(mockCRMContacts);
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  // New contact form state
  const [newContact, setNewContact] = useState({
    name: "",
    email: emailSender || "",
    company: "",
    title: "",
    phone: "",
    status: "lead" as const,
    tags: [] as string[],
    notes: "",
  });

  useEffect(() => {
    if (emailSender && open) {
      // Try to find existing contact
      const existingContact = contacts.find(c => 
        c.email.toLowerCase() === emailSender.toLowerCase()
      );
      
      if (existingContact) {
        setSelectedContact(existingContact);
        generateAiInsights(existingContact);
      } else {
        setIsCreatingContact(true);
        setNewContact(prev => ({ ...prev, email: emailSender }));
      }
    }
  }, [emailSender, open, contacts]);

  const generateAiInsights = async (contact: CRMContact) => {
    // Simulate AI analysis of email content and contact history
    setTimeout(() => {
      setAiAnalysis({
        sentiment: emailContent?.toLowerCase().includes("thanks") || emailContent?.toLowerCase().includes("great") 
          ? "positive" : emailContent?.toLowerCase().includes("urgent") || emailContent?.toLowerCase().includes("issue")
          ? "negative" : "neutral",
        leadScoreChange: Math.floor(Math.random() * 10) - 5,
        suggestedActions: [
          "Schedule follow-up meeting",
          "Send pricing information",
          "Add to weekly newsletter"
        ],
        extractedEntities: [
          { type: "date", value: "next week", context: "Meeting mention" },
          { type: "product", value: "enterprise package", context: "Interest indicator" }
        ],
        recommendedTags: ["follow-up-needed", "pricing-discussion"],
        nextBestAction: "Schedule a demo call within 3 days",
        customerJourneyStage: contact.status === "customer" ? "retention" : "consideration"
      });
    }, 1000);
  };

  const createContact = () => {
    if (!newContact.name || !newContact.email) return;

    const contact: CRMContact = {
      id: `crm_${Date.now()}`,
      email: newContact.email,
      name: newContact.name,
      company: newContact.company,
      title: newContact.title,
      phone: newContact.phone,
      leadScore: 50, // Default score
      status: newContact.status,
      notes: newContact.notes ? [{
        id: `note_${Date.now()}`,
        contactId: `crm_${Date.now()}`,
        content: newContact.notes,
        type: "note",
        relatedEmailId: emailId,
        createdBy: "user",
        createdAt: new Date().toISOString(),
        metadata: {
          emailSubject,
          sentiment: "neutral"
        }
      }] : [],
      tags: newContact.tags,
      customFields: {},
      source: "email",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setContacts(prev => [contact, ...prev]);
    setSelectedContact(contact);
    setIsCreatingContact(false);
    onContactUpdated?.(contact);
  };

  const addNote = () => {
    if (!newNote.trim() || !selectedContact) return;

    const note: CRMNote = {
      id: `note_${Date.now()}`,
      contactId: selectedContact.id,
      content: newNote,
      type: "email",
      relatedEmailId: emailId,
      createdBy: "user",
      createdAt: new Date().toISOString(),
      metadata: {
        emailSubject,
        emailDirection: "inbound",
        sentiment: aiAnalysis?.sentiment || "neutral",
        actionItems: aiAnalysis?.suggestedActions?.slice(0, 2) || []
      }
    };

    const updatedContact = {
      ...selectedContact,
      notes: [note, ...selectedContact.notes],
      lastInteraction: new Date().toISOString().split('T')[0],
      leadScore: Math.min(100, selectedContact.leadScore + (aiAnalysis?.leadScoreChange || 0)),
      updatedAt: new Date().toISOString()
    };

    setContacts(prev => prev.map(c => c.id === selectedContact.id ? updatedContact : c));
    setSelectedContact(updatedContact);
    setNewNote("");
    onContactUpdated?.(updatedContact);
  };

  const updateContactStatus = (status: CRMContact["status"]) => {
    if (!selectedContact) return;

    const updatedContact = {
      ...selectedContact,
      status,
      updatedAt: new Date().toISOString()
    };

    setContacts(prev => prev.map(c => c.id === selectedContact.id ? updatedContact : c));
    setSelectedContact(updatedContact);
    onContactUpdated?.(updatedContact);
  };

  const addTag = (tag: string) => {
    if (!selectedContact || selectedContact.tags.includes(tag)) return;

    const updatedContact = {
      ...selectedContact,
      tags: [...selectedContact.tags, tag],
      updatedAt: new Date().toISOString()
    };

    setContacts(prev => prev.map(c => c.id === selectedContact.id ? updatedContact : c));
    setSelectedContact(updatedContact);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "lead": return "bg-blue-100 text-blue-800";
      case "prospect": return "bg-yellow-100 text-yellow-800";
      case "customer": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          CRM
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-500" />
            <span>CRM Integration</span>
            {emailSender && (
              <Badge variant="outline" className="ml-2">
                {emailSender}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isCreatingContact ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Create New Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={newContact.company}
                    onChange={(e) => setNewContact(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newContact.title}
                    onChange={(e) => setNewContact(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Job title"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1-555-0123"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newContact.status}
                    onValueChange={(value: any) => setNewContact(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Initial Notes</Label>
                <Textarea
                  id="notes"
                  value={newContact.notes}
                  onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about this contact..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={createContact} disabled={!newContact.name || !newContact.email}>
                  <Save className="w-4 h-4 mr-2" />
                  Create Contact
                </Button>
                <Button variant="outline" onClick={() => setIsCreatingContact(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : selectedContact ? (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="notes">Notes & History</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              <TabsTrigger value="actions">Quick Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-3 gap-6">
                <Card className="col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {selectedContact.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{selectedContact.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {selectedContact.title} at {selectedContact.company}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn("capitalize", getStatusColor(selectedContact.status))}>
                        {selectedContact.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedContact.email}</span>
                        </div>
                        {selectedContact.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{selectedContact.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Last: {formatDate(selectedContact.lastInteraction || selectedContact.updatedAt)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Lead Score:</span>
                          <span className={cn("font-medium", getLeadScoreColor(selectedContact.leadScore || 0))}>
                            {selectedContact.leadScore}/100
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedContact.company}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedContact.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {aiAnalysis?.recommendedTags?.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-accent"
                            onClick={() => addTag(tag)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Status Management</Label>
                      <div className="flex space-x-2 mt-2">
                        {["lead", "prospect", "customer", "inactive"].map(status => (
                          <Button
                            key={status}
                            variant={selectedContact.status === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateContactStatus(status as any)}
                            className="capitalize"
                          >
                            {status}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center p-3 bg-accent rounded">
                      <div className="text-2xl font-bold text-blue-600">{selectedContact.notes.length}</div>
                      <div className="text-xs text-muted-foreground">Total Interactions</div>
                    </div>
                    
                    <div className="text-center p-3 bg-accent rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.floor(Math.random() * 30) + 1}
                      </div>
                      <div className="text-xs text-muted-foreground">Days Since Last Contact</div>
                    </div>

                    <div className="text-center p-3 bg-accent rounded">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedContact.status === "customer" ? "$12.5K" : "$0"}
                      </div>
                      <div className="text-xs text-muted-foreground">Lifetime Value</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Add New Note</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add notes about this interaction..."
                        rows={3}
                      />
                      {emailSubject && (
                        <div className="p-2 bg-accent rounded text-xs">
                          <span className="font-medium">Context:</span> {emailSubject}
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <Button onClick={addNote} disabled={!newNote.trim()}>
                          <Save className="w-4 h-4 mr-2" />
                          Add Note
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={autoUpdateEnabled}
                            onCheckedChange={setAutoUpdateEnabled}
                          />
                          <Label className="text-xs">Auto-update from emails</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-3">
                    <h3 className="font-medium">Interaction History</h3>
                    {selectedContact.notes.map(note => (
                      <Card key={note.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {note.type === "email" && <Mail className="w-4 h-4" />}
                              {note.type === "call" && <Phone className="w-4 h-4" />}
                              {note.type === "meeting" && <Calendar className="w-4 h-4" />}
                              {note.type === "note" && <FileText className="w-4 h-4" />}
                              <span className="text-sm font-medium capitalize">{note.type}</span>
                              {note.metadata?.sentiment && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    note.metadata.sentiment === "positive" && "text-green-600",
                                    note.metadata.sentiment === "negative" && "text-red-600",
                                    note.metadata.sentiment === "neutral" && "text-gray-600"
                                  )}
                                >
                                  {note.metadata.sentiment}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(note.createdAt)}
                            </span>
                          </div>
                          
                          <p className="text-sm mb-2">{note.content}</p>
                          
                          {note.metadata?.emailSubject && (
                            <div className="text-xs text-muted-foreground mb-2">
                              <span className="font-medium">Subject:</span> {note.metadata.emailSubject}
                            </div>
                          )}
                          
                          {note.metadata?.actionItems && note.metadata.actionItems.length > 0 && (
                            <div>
                              <span className="text-xs font-medium">Action Items:</span>
                              <ul className="text-xs text-muted-foreground ml-4 list-disc">
                                {note.metadata.actionItems.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Communication Pattern</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Email Frequency</span>
                        <span className="text-xs font-medium">2-3x/week</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Response Rate</span>
                        <span className="text-xs font-medium">85%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Avg Response Time</span>
                        <span className="text-xs font-medium">4 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Preferred Channel</span>
                        <span className="text-xs font-medium">Email</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-4">
              {aiAnalysis ? (
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span>Email Analysis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sentiment</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            aiAnalysis.sentiment === "positive" && "text-green-600",
                            aiAnalysis.sentiment === "negative" && "text-red-600",
                            aiAnalysis.sentiment === "neutral" && "text-gray-600"
                          )}
                        >
                          {aiAnalysis.sentiment}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Lead Score Impact</span>
                        <div className="flex items-center space-x-1">
                          {aiAnalysis.leadScoreChange > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : aiAnalysis.leadScoreChange < 0 ? (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          ) : (
                            <Minus className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="text-sm font-medium">
                            {aiAnalysis.leadScoreChange > 0 ? "+" : ""}{aiAnalysis.leadScoreChange}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Journey Stage</span>
                        <Badge variant="secondary" className="capitalize">
                          {aiAnalysis.customerJourneyStage}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span>Recommendations</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium">Next Best Action</Label>
                        <p className="text-sm mt-1">{aiAnalysis.nextBestAction}</p>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium">Suggested Actions</Label>
                        <ul className="text-sm mt-1 space-y-1">
                          {aiAnalysis.suggestedActions.map((action: string, index: number) => (
                            <li key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm">Extracted Entities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {aiAnalysis.extractedEntities.map((entity: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-accent rounded">
                            <div>
                              <span className="text-sm font-medium">{entity.value}</span>
                              <p className="text-xs text-muted-foreground">{entity.context}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {entity.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">AI analysis will appear here</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Meeting
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Follow-up Email
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="w-4 h-4 mr-2" />
                      Log Phone Call
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Create Proposal
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Automation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-update from emails</span>
                      <Switch checked={autoUpdateEnabled} onCheckedChange={setAutoUpdateEnabled} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lead scoring</span>
                      <Switch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Follow-up reminders</span>
                      <Switch checked={false} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Contact Found</h3>
              <p className="text-muted-foreground mb-4">
                No existing contact found for {emailSender}
              </p>
              <Button onClick={() => setIsCreatingContact(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Contact
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
