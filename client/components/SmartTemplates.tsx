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
import {
  Search,
  PenTool,
  Sparkles,
  BookOpen,
  Users,
  Clock,
  Star,
  Plus,
  Edit3,
  Copy,
  Eye,
  Save,
  Zap,
  Brain,
  MessageSquare,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: "reply" | "followup" | "introduction" | "closing" | "request" | "apology";
  template: string;
  variables: string[];
  useCount: number;
  lastUsed: Date;
  tags: string[];
  aiGenerated: boolean;
  teamShared: boolean;
  context?: {
    tone: "formal" | "casual" | "friendly" | "urgent";
    recipientType: "client" | "colleague" | "manager" | "vendor";
    purpose: string;
  };
}

interface ContextualSuggestion {
  template: EmailTemplate;
  relevanceScore: number;
  reason: string;
  adaptations: string[];
}

const predefinedTemplates: EmailTemplate[] = [
  {
    id: "polite_reply",
    name: "Polite Acknowledgment",
    description: "Professional acknowledgment of received email",
    category: "reply",
    template: "Thank you for your email regarding {subject}. I have received your message and will {action} by {timeframe}. Please don't hesitate to reach out if you have any questions.",
    variables: ["subject", "action", "timeframe"],
    useCount: 45,
    lastUsed: new Date("2024-01-15"),
    tags: ["professional", "acknowledgment"],
    aiGenerated: false,
    teamShared: true,
    context: {
      tone: "formal",
      recipientType: "client",
      purpose: "acknowledge receipt",
    },
  },
  {
    id: "meeting_request",
    name: "Meeting Request",
    description: "Request a meeting with availability options",
    category: "request",
    template: "Hi {name}, I hope this email finds you well. I would like to schedule a meeting to discuss {topic}. I have availability on {dates}. Would any of these times work for you? The meeting should take approximately {duration}. Looking forward to hearing from you.",
    variables: ["name", "topic", "dates", "duration"],
    useCount: 32,
    lastUsed: new Date("2024-01-20"),
    tags: ["meeting", "scheduling"],
    aiGenerated: false,
    teamShared: true,
    context: {
      tone: "friendly",
      recipientType: "colleague",
      purpose: "schedule meeting",
    },
  },
  {
    id: "deadline_reminder",
    name: "Gentle Deadline Reminder",
    description: "Friendly reminder about upcoming deadline",
    category: "followup",
    template: "Hi {name}, I wanted to reach out regarding {project}. The deadline is approaching on {date}, and I wanted to check if you need any support or have any questions. Please let me know if there's anything I can help with.",
    variables: ["name", "project", "date"],
    useCount: 28,
    lastUsed: new Date("2024-01-18"),
    tags: ["deadline", "reminder", "supportive"],
    aiGenerated: true,
    teamShared: false,
    context: {
      tone: "friendly",
      recipientType: "colleague",
      purpose: "deadline reminder",
    },
  },
  {
    id: "introduction_email",
    name: "Professional Introduction",
    description: "Introduce yourself or someone else professionally",
    category: "introduction",
    template: "Dear {recipient}, I hope this email finds you well. I wanted to introduce {person} who {role_description}. {person} has experience in {expertise} and I believe {he_she} would be a valuable connection for {reason}. Please feel free to reach out to {person} at {contact}.",
    variables: ["recipient", "person", "role_description", "expertise", "he_she", "reason", "contact"],
    useCount: 15,
    lastUsed: new Date("2024-01-10"),
    tags: ["introduction", "networking"],
    aiGenerated: false,
    teamShared: true,
    context: {
      tone: "formal",
      recipientType: "client",
      purpose: "introduction",
    },
  },
  {
    id: "project_update",
    name: "Project Status Update",
    description: "Regular project progress update",
    category: "reply",
    template: "Hi {team}, Here's the weekly update for {project_name}: Completed this week: {completed_items} In progress: {in_progress_items} Upcoming next week: {upcoming_items} Blockers/Concerns: {blockers} Please let me know if you have any questions or concerns.",
    variables: ["team", "project_name", "completed_items", "in_progress_items", "upcoming_items", "blockers"],
    useCount: 67,
    lastUsed: new Date("2024-01-22"),
    tags: ["project", "update", "status"],
    aiGenerated: false,
    teamShared: true,
    context: {
      tone: "casual",
      recipientType: "colleague",
      purpose: "status update",
    },
  },
];

export default function SmartTemplates({
  emailContext,
  onTemplateSelected,
  trigger = "manual",
}: {
  emailContext?: {
    subject?: string;
    sender?: string;
    content?: string;
    recipient?: string;
    previousEmails?: any[];
  };
  onTemplateSelected?: (template: string) => void;
  trigger?: "manual" | "auto";
}) {
  const [open, setOpen] = useState(trigger === "auto");
  const [templates, setTemplates] = useState<EmailTemplate[]>(predefinedTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [contextualSuggestions, setContextualSuggestions] = useState<ContextualSuggestion[]>([]);
  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({
    name: "",
    description: "",
    category: "reply",
    template: "",
    tags: [],
    teamShared: false,
  });
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    if (emailContext && open) {
      generateContextualSuggestions();
    }
  }, [emailContext, open]);

  const generateContextualSuggestions = async () => {
    setAiGenerating(true);
    // Simulate AI analysis of email context
    setTimeout(() => {
      const suggestions: ContextualSuggestion[] = templates
        .map((template) => {
          let relevanceScore = 0;
          let reason = "";
          let adaptations: string[] = [];

          // Analyze subject line
          if (emailContext?.subject?.toLowerCase().includes("meeting")) {
            if (template.id === "meeting_request") {
              relevanceScore += 0.8;
              reason = "Subject mentions meeting";
              adaptations.push("Adapt to respond to meeting request");
            }
          }

          // Analyze content for keywords
          if (emailContext?.content?.toLowerCase().includes("deadline")) {
            if (template.id === "deadline_reminder") {
              relevanceScore += 0.7;
              reason = "Content mentions deadline";
              adaptations.push("Reference specific deadline from email");
            }
          }

          // Check for introduction patterns
          if (emailContext?.content?.toLowerCase().includes("introduce") || 
              emailContext?.subject?.toLowerCase().includes("introduction")) {
            if (template.id === "introduction_email") {
              relevanceScore += 0.9;
              reason = "Email is about introductions";
              adaptations.push("Customize introduction context");
            }
          }

          // Default relevance for commonly used templates
          if (template.useCount > 30) {
            relevanceScore += 0.3;
            if (!reason) reason = "Frequently used template";
          }

          return {
            template,
            relevanceScore,
            reason,
            adaptations,
          };
        })
        .filter((s) => s.relevanceScore > 0.2)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3);

      setContextualSuggestions(suggestions);
      setAiGenerating(false);
    }, 1500);
  };

  const generateAiTemplate = async () => {
    setAiGenerating(true);
    // Simulate AI template generation
    setTimeout(() => {
      const aiTemplate: EmailTemplate = {
        id: `ai_${Date.now()}`,
        name: "AI-Generated Response",
        description: "Context-aware response generated by AI",
        category: "reply",
        template: `Hi ${emailContext?.sender?.split("@")[0] || "{name}"}, Thank you for your email about ${emailContext?.subject || "{subject}"}. I appreciate you reaching out. {customized_response} Please let me know if you need any additional information. Best regards, {your_name}`,
        variables: ["name", "subject", "customized_response", "your_name"],
        useCount: 0,
        lastUsed: new Date(),
        tags: ["ai-generated", "contextual"],
        aiGenerated: true,
        teamShared: false,
        context: {
          tone: "friendly",
          recipientType: "colleague",
          purpose: "contextual response",
        },
      };

      setTemplates((prev) => [aiTemplate, ...prev]);
      setAiGenerating(false);
    }, 2000);
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const useTemplate = (template: EmailTemplate) => {
    // Update usage statistics
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === template.id
          ? { ...t, useCount: t.useCount + 1, lastUsed: new Date() }
          : t
      )
    );

    if (onTemplateSelected) {
      onTemplateSelected(template.template);
    }
    setOpen(false);
  };

  const saveNewTemplate = () => {
    if (newTemplate.name && newTemplate.template) {
      const template: EmailTemplate = {
        ...newTemplate,
        id: `custom_${Date.now()}`,
        variables: extractVariables(newTemplate.template || ""),
        useCount: 0,
        lastUsed: new Date(),
        aiGenerated: false,
      } as EmailTemplate;

      setTemplates((prev) => [template, ...prev]);
      setNewTemplate({
        name: "",
        description: "",
        category: "reply",
        template: "",
        tags: [],
        teamShared: false,
      });
      setShowNewTemplate(false);
    }
  };

  const extractVariables = (template: string): string[] => {
    const regex = /{([^}]+)}/g;
    const variables: string[] = [];
    let match;
    while ((match = regex.exec(template)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    return variables;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PenTool className="w-4 h-4 mr-2" />
          Smart Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span>Smart Email Templates</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="suggestions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="browse">Browse Templates</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="team">Team Library</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            {emailContext && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span>Email Context</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Subject:</span> {emailContext.subject || "No subject"}
                    </div>
                    <div>
                      <span className="font-medium">From:</span> {emailContext.sender || "Unknown sender"}
                    </div>
                    {emailContext.content && (
                      <div>
                        <span className="font-medium">Preview:</span>
                        <div className="bg-accent p-2 rounded text-xs mt-1">
                          {emailContext.content.substring(0, 200)}...
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">AI-Powered Suggestions</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={generateAiTemplate}
                disabled={aiGenerating}
              >
                <Zap className="w-4 h-4 mr-2" />
                {aiGenerating ? "Generating..." : "Generate AI Template"}
              </Button>
            </div>

            {aiGenerating ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-muted-foreground">Analyzing email context...</p>
                </div>
              </div>
            ) : contextualSuggestions.length > 0 ? (
              <div className="grid gap-4">
                {contextualSuggestions.map((suggestion) => (
                  <Card
                    key={suggestion.template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-purple-500"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm flex items-center space-x-2">
                            <span>{suggestion.template.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(suggestion.relevanceScore * 100)}% match
                            </Badge>
                            {suggestion.template.aiGenerated && (
                              <Badge variant="secondary" className="text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.reason}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => useTemplate(suggestion.template)}
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-accent p-3 rounded border text-sm">
                        {suggestion.template.template}
                      </div>
                      {suggestion.adaptations.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium mb-1">AI Adaptations:</p>
                          <div className="space-y-1">
                            {suggestion.adaptations.map((adaptation, index) => (
                              <div key={index} className="text-xs text-muted-foreground flex items-center space-x-1">
                                <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                                <span>{adaptation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No contextual suggestions</h3>
                  <p className="text-muted-foreground">Browse all templates or create a custom one</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="browse" className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="reply">Replies</SelectItem>
                  <SelectItem value="followup">Follow-ups</SelectItem>
                  <SelectItem value="introduction">Introductions</SelectItem>
                  <SelectItem value="request">Requests</SelectItem>
                  <SelectItem value="closing">Closings</SelectItem>
                  <SelectItem value="apology">Apologies</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="grid gap-3">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-sm">{template.name}</CardTitle>
                            <Badge variant="outline" className="text-xs capitalize">
                              {template.category}
                            </Badge>
                            {template.aiGenerated && (
                              <Badge variant="secondary" className="text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI
                              </Badge>
                            )}
                            {template.teamShared && (
                              <Badge variant="secondary" className="text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                Team
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => useTemplate(template)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Use
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-accent p-3 rounded border text-sm mb-3">
                        {template.template}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>Used {template.useCount} times</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Last used {template.lastUsed.toLocaleDateString()}</span>
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Create Custom Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter template name..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-category">Category</Label>
                    <Select
                      value={newTemplate.category}
                      onValueChange={(category: any) =>
                        setNewTemplate((prev) => ({ ...prev, category }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reply">Reply</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                        <SelectItem value="introduction">Introduction</SelectItem>
                        <SelectItem value="request">Request</SelectItem>
                        <SelectItem value="closing">Closing</SelectItem>
                        <SelectItem value="apology">Apology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Input
                    id="template-description"
                    value={newTemplate.description}
                    onChange={(e) =>
                      setNewTemplate((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Brief description of the template..."
                  />
                </div>

                <div>
                  <Label htmlFor="template-content">Template Content</Label>
                  <Textarea
                    id="template-content"
                    value={newTemplate.template}
                    onChange={(e) =>
                      setNewTemplate((prev) => ({ ...prev, template: e.target.value }))
                    }
                    placeholder="Enter your template with variables in {curly_brackets}..."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {"{variable_name}"} for dynamic content that can be customized when using the template.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="team-shared"
                    checked={newTemplate.teamShared}
                    onChange={(e) =>
                      setNewTemplate((prev) => ({ ...prev, teamShared: e.target.checked }))
                    }
                  />
                  <Label htmlFor="team-shared" className="text-sm">
                    Share with team
                  </Label>
                </div>

                <Button onClick={saveNewTemplate} disabled={!newTemplate.name || !newTemplate.template}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Team Shared Templates</h3>
              <Badge variant="outline">{templates.filter(t => t.teamShared).length} templates</Badge>
            </div>
            
            <ScrollArea className="h-[400px]">
              <div className="grid gap-3">
                {templates
                  .filter((template) => template.teamShared)
                  .map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-sm">{template.name}</CardTitle>
                              <Badge variant="outline" className="text-xs capitalize">
                                {template.category}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                Team
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => useTemplate(template)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Use
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-accent p-3 rounded border text-sm mb-3">
                          {template.template}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>Used {template.useCount} times by team</span>
                          </span>
                          <div className="flex space-x-1">
                            {template.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
