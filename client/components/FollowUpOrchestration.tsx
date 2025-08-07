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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Mail,
  MessageSquare,
  Zap,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Settings,
  Brain,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowUpConfig {
  id: string;
  emailId: string;
  enabled: boolean;
  strategy: "immediate" | "delayed" | "intelligent" | "escalation";
  timeframe: number; // hours
  maxAttempts: number;
  platforms: ("email" | "slack" | "whatsapp" | "teams")[];
  recipients: string[];
  message: string;
  conditions: {
    noResponse: boolean;
    taskNotCompleted: boolean;
    urgencyLevel: "low" | "medium" | "high" | "urgent";
  };
  aiSuggestions: {
    optimalTiming: string;
    messagePersonalization: string;
    escalationPath: string[];
  };
}

interface FollowUpTemplate {
  id: string;
  name: string;
  description: string;
  category: "sales" | "support" | "internal" | "urgent";
  template: string;
  defaultTimeframe: number;
  platforms: string[];
}

const followUpTemplates: FollowUpTemplate[] = [
  {
    id: "gentle_reminder",
    name: "Gentle Reminder",
    description: "Polite follow-up for non-urgent matters",
    category: "internal",
    template: "Hi {recipient}, I wanted to follow up on {subject}. When you have a moment, could you please provide an update? Thanks!",
    defaultTimeframe: 24,
    platforms: ["email", "slack"],
  },
  {
    id: "urgent_deadline",
    name: "Urgent Deadline",
    description: "For time-sensitive requests",
    category: "urgent",
    template: "Hi {recipient}, This is urgent - we need a response regarding {subject} by {deadline}. Please prioritize this.",
    defaultTimeframe: 4,
    platforms: ["email", "slack", "whatsapp"],
  },
  {
    id: "client_check_in",
    name: "Client Check-in",
    description: "Professional client follow-up",
    category: "sales",
    template: "Hello {recipient}, I hope this email finds you well. I wanted to check in regarding {subject}. Please let me know if you need any additional information.",
    defaultTimeframe: 48,
    platforms: ["email"],
  },
  {
    id: "support_ticket",
    name: "Support Follow-up",
    description: "Customer support follow-up",
    category: "support",
    template: "Hi {recipient}, We wanted to follow up on your recent inquiry about {subject}. Have you had a chance to review our response? We're here to help!",
    defaultTimeframe: 12,
    platforms: ["email", "slack"],
  },
];

export default function FollowUpOrchestration({
  emailId,
  emailSubject,
  emailSender,
  trigger,
  children,
}: {
  emailId: string;
  emailSubject: string;
  emailSender: string;
  trigger?: "manual" | "auto";
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<FollowUpConfig>({
    id: "",
    emailId,
    enabled: true,
    strategy: "intelligent",
    timeframe: 24,
    maxAttempts: 3,
    platforms: ["email"],
    recipients: [emailSender],
    message: "",
    conditions: {
      noResponse: true,
      taskNotCompleted: false,
      urgencyLevel: "medium",
    },
    aiSuggestions: {
      optimalTiming: "24 hours based on recipient's response patterns",
      messagePersonalization: "Use friendly, professional tone based on previous interactions",
      escalationPath: ["Direct email", "Slack mention", "Manager notification"],
    },
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  useEffect(() => {
    if (open) {
      // Simulate AI analysis of email context
      generateAiSuggestions();
    }
  }, [open, emailId]);

  const generateAiSuggestions = async () => {
    // Simulate AI analysis
    setTimeout(() => {
      setAiAnalysis({
        urgencyScore: 0.7,
        responseProbability: 0.85,
        optimalTiming: {
          hours: 24,
          reason: "Recipient typically responds to emails on weekday mornings",
        },
        suggestedMessage: `Hi ${emailSender.split("@")[0]}, I wanted to follow up on "${emailSubject}". Please let me know if you need any clarification.`,
        escalationSuggestions: [
          { platform: "email", delay: 24, probability: 0.85 },
          { platform: "slack", delay: 48, probability: 0.95 },
          { platform: "whatsapp", delay: 72, probability: 0.98 },
        ],
      });
    }, 1000);
  };

  const applyTemplate = (templateId: string) => {
    const template = followUpTemplates.find((t) => t.id === templateId);
    if (template) {
      const personalizedMessage = template.template
        .replace("{recipient}", emailSender.split("@")[0])
        .replace("{subject}", emailSubject)
        .replace("{deadline}", "end of day");

      setConfig((prev) => ({
        ...prev,
        message: personalizedMessage,
        timeframe: template.defaultTimeframe,
        platforms: template.platforms as any[],
      }));
    }
    setSelectedTemplate(templateId);
  };

  const handleSave = () => {
    // In production, this would save to the API
    console.log("Saving follow-up configuration:", config);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Clock className="w-4 h-4 mr-2" />
            Set Follow-up
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <span>Intelligent Follow-up Orchestration</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="config" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Basic Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enabled">Enable Follow-up</Label>
                    <Switch
                      id="enabled"
                      checked={config.enabled}
                      onCheckedChange={(enabled) =>
                        setConfig((prev) => ({ ...prev, enabled }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="strategy">Strategy</Label>
                    <Select
                      value={config.strategy}
                      onValueChange={(strategy: any) =>
                        setConfig((prev) => ({ ...prev, strategy }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                        <SelectItem value="intelligent">AI-Optimized</SelectItem>
                        <SelectItem value="escalation">Auto-Escalation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timeframe">Initial Delay (hours)</Label>
                    <Input
                      id="timeframe"
                      type="number"
                      value={config.timeframe}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          timeframe: parseInt(e.target.value),
                        }))
                      }
                      min="1"
                      max="168"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxAttempts">Max Attempts</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      value={config.maxAttempts}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          maxAttempts: parseInt(e.target.value),
                        }))
                      }
                      min="1"
                      max="10"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Conditions & Recipients</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Trigger Conditions</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={config.conditions.noResponse}
                          onCheckedChange={(checked) =>
                            setConfig((prev) => ({
                              ...prev,
                              conditions: { ...prev.conditions, noResponse: checked },
                            }))
                          }
                        />
                        <Label className="text-sm">No response received</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={config.conditions.taskNotCompleted}
                          onCheckedChange={(checked) =>
                            setConfig((prev) => ({
                              ...prev,
                              conditions: { ...prev.conditions, taskNotCompleted: checked },
                            }))
                          }
                        />
                        <Label className="text-sm">Associated task not completed</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select
                      value={config.conditions.urgencyLevel}
                      onValueChange={(level: any) =>
                        setConfig((prev) => ({
                          ...prev,
                          conditions: { ...prev.conditions, urgencyLevel: level },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="recipients">Recipients</Label>
                    <Input
                      id="recipients"
                      value={config.recipients.join(", ")}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          recipients: e.target.value.split(",").map((r) => r.trim()),
                        }))
                      }
                      placeholder="email1@example.com, email2@example.com"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Platforms & Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Communication Platforms</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["email", "slack", "whatsapp", "teams"].map((platform) => (
                      <Badge
                        key={platform}
                        variant={config.platforms.includes(platform as any) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setConfig((prev) => ({
                            ...prev,
                            platforms: prev.platforms.includes(platform as any)
                              ? prev.platforms.filter((p) => p !== platform)
                              : [...prev.platforms, platform as any],
                          }));
                        }}
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Follow-up Message</Label>
                  <Textarea
                    id="message"
                    value={config.message}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Enter your follow-up message..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {followUpTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedTemplate === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:bg-accent"
                  )}
                  onClick={() => applyTemplate(template.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {template.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs bg-background p-2 rounded border">
                      {template.template}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex space-x-1">
                        {template.platforms.map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {template.defaultTimeframe}h delay
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-4">
            {aiAnalysis ? (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <span>AI Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Urgency Score</span>
                      <Badge variant="outline">
                        {Math.round(aiAnalysis.urgencyScore * 100)}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Response Probability</span>
                      <Badge variant="outline" className="text-green-600">
                        {Math.round(aiAnalysis.responseProbability * 100)}%
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Optimal Timing</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {aiAnalysis.optimalTiming.reason}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span>Escalation Path</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {aiAnalysis.escalationSuggestions.map((suggestion: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 bg-accent rounded-full flex items-center justify-center text-xs">
                              {index + 1}
                            </span>
                            <span className="capitalize">{suggestion.platform}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              {suggestion.delay}h
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(suggestion.probability * 100)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="text-sm">AI-Generated Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-accent p-3 rounded border">
                      <p className="text-sm">{aiAnalysis.suggestedMessage}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, message: aiAnalysis.suggestedMessage }))
                      }
                    >
                      Use This Message
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Analyzing email context...</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Follow-up Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent p-4 rounded border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email Follow-up</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{config.recipients.join(", ")}</span>
                  </div>
                  <div className="text-sm">
                    <div className="mb-2">
                      <span className="text-muted-foreground">Subject:</span> Re: {emailSubject}
                    </div>
                    <div className="bg-background p-3 rounded border">
                      {config.message || "No message configured"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-accent rounded">
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-xs font-medium">{config.timeframe}h delay</div>
                  </div>
                  <div className="text-center p-2 bg-accent rounded">
                    <Target className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-xs font-medium">{config.maxAttempts} attempts</div>
                  </div>
                  <div className="text-center p-2 bg-accent rounded">
                    <Users className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-xs font-medium">{config.platforms.length} platforms</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!config.enabled || !config.message}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Follow-up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
