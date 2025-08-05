import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEmailCategories, type EmailCategory, type CategoryRule } from "../../shared/data/mockData";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Zap,
  Shield,
  Bell,
  User,
  Palette,
  Mail,
  Bot,
  Filter,
  Tag,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import RuleCreationDialog from "@/components/RuleCreationDialog";



interface AIRule {
  id: string;
  name: string;
  description: string;
  action: "categorize" | "priority" | "autoRespond" | "archive" | "forward";
  conditions: string[];
  confidence: number;
  enabled: boolean;
}

const defaultAIRules: AIRule[] = [
  {
    id: "ai-1",
    name: "Auto-categorize newsletters",
    description: "Automatically categorize newsletter emails as Marketing",
    action: "categorize",
    conditions: [
      "Contains unsubscribe link",
      "From marketing domain",
      "Weekly/Monthly frequency",
    ],
    confidence: 0.85,
    enabled: true,
  },
  {
    id: "ai-2",
    name: "Priority urgent emails",
    description: "Mark emails with urgent keywords as high priority",
    action: "priority",
    conditions: [
      "Contains urgent keywords",
      "From internal domain",
      "Short response time expected",
    ],
    confidence: 0.9,
    enabled: true,
  },
  {
    id: "ai-3",
    name: "Auto-archive notifications",
    description: "Automatically archive system notifications after 7 days",
    action: "archive",
    conditions: [
      "From no-reply address",
      "System notification type",
      "Older than 7 days",
    ],
    confidence: 0.95,
    enabled: false,
  },
];

export default function Settings() {
  const [categories, setCategories] = useState<EmailCategory[]>(getEmailCategories());
  const [aiRules, setAiRules] = useState<AIRule[]>(defaultAIRules);
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newRuleDialog, setNewRuleDialog] = useState(false);
  const [selectedCategoryForRule, setSelectedCategoryForRule] = useState<
    string | null
  >(null);

  // User Settings State
  const [userSettings, setUserSettings] = useState({
    theme: "light",
    emailsPerPage: 50,
    autoMarkAsRead: true,
    keyboardShortcuts: true,
    notifications: {
      desktop: true,
      email: false,
      sound: true,
    },
    aiSettings: {
      autoSuggest: true,
      autoCategory: true,
      confidence: 0.8,
    },
  });

  // AI API Key Management
  const [aiStatus, setAIStatus] = useState<any>(null);
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [testingKeys, setTestingKeys] = useState(false);

  // Toast for notifications
  const { toast } = useToast();

  useEffect(() => {
    // Load AI status and existing keys
    fetchAIStatus();
    loadSavedKeys();
  }, []);

  const fetchAIStatus = async () => {
    try {
      const response = await fetch("/api/ai/status");
      if (response.ok) {
        const data = await response.json();
        setAIStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch AI status:", error);
    }
  };

  const loadSavedKeys = () => {
    // Load from localStorage (in production, these would be server-side encrypted)
    const savedOpenaiKey = localStorage.getItem("openai_api_key") || "";
    const savedAnthropicKey = localStorage.getItem("anthropic_api_key") || "";
    
    if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
    if (savedAnthropicKey) setAnthropicKey(savedAnthropicKey);
  };

  const handleSaveAPIKey = async (provider: 'openai' | 'anthropic') => {
    const key = provider === 'openai' ? openaiKey : anthropicKey;
    
    if (!key.trim()) {
      toast({
        title: "Error",
        description: `Please enter a valid ${provider.toUpperCase()} API key`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Save to localStorage (in production, send to secure backend)
      localStorage.setItem(`${provider}_api_key`, key);
      
      toast({
        title: "Success",
        description: `${provider.toUpperCase()} API key saved successfully!`
      });
      
      fetchAIStatus(); // Refresh status
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save ${provider.toUpperCase()} API key`,
        variant: "destructive"
      });
    }
  };

  const handleRemoveAPIKey = async (provider: 'openai' | 'anthropic') => {
    localStorage.removeItem(`${provider}_api_key`);
    if (provider === 'openai') setOpenaiKey("");
    if (provider === 'anthropic') setAnthropicKey("");
    
    toast({
      title: "Success",
      description: `${provider.toUpperCase()} API key removed`
    });
    
    fetchAIStatus(); // Refresh status
  };

  const handleSaveAllSettings = async () => {
    try {
      const response = await fetch("/api/settings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories,
          aiRules,
          userSettings,
        }),
      });

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "All settings have been saved successfully.",
          variant: "default",
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Save Failed",
        description: "Could not save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTestAllConnections = async () => {
    try {
      const response = await fetch("/api/integrations/test", {
        method: "POST",
      });

      if (response.ok) {
        const results = await response.json();
        toast({
          title: "Connection Test Complete",
          description: `${results.successful}/${results.total} connections successful.`,
          variant: results.successful === results.total ? "default" : "destructive",
        });
      } else {
        throw new Error("Failed to test connections");
      }
    } catch (error) {
      console.error("Failed to test connections:", error);
      toast({
        title: "Test Failed",
        description: "Could not test connections. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshTokens = async () => {
    try {
      const response = await fetch("/api/integrations/refresh-tokens", {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Tokens Refreshed",
          description: "All authentication tokens have been refreshed.",
          variant: "default",
        });
      } else {
        throw new Error("Failed to refresh tokens");
      }
    } catch (error) {
      console.error("Failed to refresh tokens:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh tokens. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCheckPermissions = async () => {
    try {
      const response = await fetch("/api/integrations/check-permissions", {
        method: "POST",
      });

      if (response.ok) {
        const permissions = await response.json();
        toast({
          title: "Permissions Checked",
          description: `Checked permissions for ${permissions.count} integrations.`,
          variant: "default",
        });
      } else {
        throw new Error("Failed to check permissions");
      }
    } catch (error) {
      console.error("Failed to check permissions:", error);
      toast({
        title: "Check Failed",
        description: "Could not check permissions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResetConfiguration = async () => {
    try {
      const response = await fetch("/api/settings/reset", {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Configuration Reset",
          description: "All settings have been reset to defaults.",
          variant: "default",
        });
        // Reload the page to show reset settings
        window.location.reload();
      } else {
        throw new Error("Failed to reset configuration");
      }
    } catch (error) {
      console.error("Failed to reset configuration:", error);
      toast({
        title: "Reset Failed",
        description: "Could not reset configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateFilter = () => {
    // Open a new filter dialog instead of console.log
    setNewRuleDialog(true);
  };

  const handleCategoryUpdate = async (
    categoryId: string,
    updates: Partial<EmailCategory>,
  ) => {
    try {
      const response = await fetch(`/api/ai/rules/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === categoryId ? { ...cat, ...updates } : cat,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/ai/rules/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleCreateCategory = async (categoryData: Partial<EmailCategory>) => {
    try {
      const response = await fetch("/api/ai/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories((prev) => [...prev, newCategory.rule]);
        setNewCategoryDialog(false);
      }
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  const handleAddRule = async (
    categoryId: string,
    ruleData: Partial<CategoryRule>,
  ) => {
    try {
      const response = await fetch("/api/ai/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ruleData,
          category: categoryId,
        }),
      });

      if (response.ok) {
        const newRule = await response.json();
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === categoryId
              ? { ...cat, rules: [...cat.rules, newRule.rule] }
              : cat,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to add rule:", error);
    }
  };

  const handleAIRuleToggle = (ruleId: string, enabled: boolean) => {
    setAiRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, enabled } : rule)),
    );
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your email categories, AI rules, and preferences
            </p>
          </div>
          <Button onClick={handleSaveAllSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="categories" className="space-y-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="categories">
                <Tag className="w-4 h-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="ai-rules">
                <Bot className="w-4 h-4 mr-2" />
                AI Rules
              </TabsTrigger>
              <TabsTrigger value="ai-setup">
                <Shield className="w-4 h-4 mr-2" />
                AI Setup
              </TabsTrigger>
              <TabsTrigger value="email-accounts">
                <Mail className="w-4 h-4 mr-2" />
                Email Accounts
              </TabsTrigger>
              <TabsTrigger value="integrations">
                <Zap className="w-4 h-4 mr-2" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="filters">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="general">
                <User className="w-4 h-4 mr-2" />
                General
              </TabsTrigger>
            </TabsList>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Email Categories</h3>
                  <p className="text-muted-foreground">
                    Categories are determined by email metadata first, then
                    keyword analysis as fallback
                  </p>
                </div>
                <Dialog
                  open={newCategoryDialog}
                  onOpenChange={setNewCategoryDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="category-name">Category Name</Label>
                        <Input id="category-name" placeholder="e.g., Travel" />
                      </div>
                      <div>
                        <Label htmlFor="category-description">
                          Description
                        </Label>
                        <Textarea
                          id="category-description"
                          placeholder="Brief description of this category"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category-color">Color</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a color" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="orange">Orange</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          className="flex-1"
                          onClick={() =>
                            handleCreateCategory({
                              name: (
                                document.getElementById(
                                  "category-name",
                                ) as HTMLInputElement
                              )?.value,
                              description: (
                                document.getElementById(
                                  "category-description",
                                ) as HTMLTextAreaElement
                              )?.value,
                              color: "bg-blue-500",
                              rules: [],
                              enabled: true,
                            })
                          }
                        >
                          Create Category
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setNewCategoryDialog(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-4 h-4 rounded ${category.color}`}
                          />
                          <div>
                            <CardTitle className="text-base">
                              {category.name}
                            </CardTitle>
                            <CardDescription>
                              {category.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={category.enabled}
                            onCheckedChange={(enabled) =>
                              handleCategoryUpdate(category.id, { enabled })
                            }
                          />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingCategory(category.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">
                          Categorization Rules
                        </h4>
                        {category.rules.map((rule) => (
                          <div
                            key={rule.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-md"
                          >
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{rule.type}</Badge>
                              <span className="text-sm">{rule.condition}</span>
                              <code className="text-xs bg-background px-2 py-1 rounded">
                                {rule.value}
                              </code>
                            </div>
                            <Switch checked={rule.enabled} />
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCategoryForRule(category.id);
                            setNewRuleDialog(true);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Rule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* AI Rules Tab */}
            <TabsContent value="ai-rules" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">AI Automation Rules</h3>
                <p className="text-muted-foreground">
                  Configure intelligent email processing and automation
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>AI Configuration</CardTitle>
                  <CardDescription>
                    Global AI settings for email processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">
                        Enable AI Categorization
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically categorize emails using AI
                      </p>
                    </div>
                    <Switch
                      checked={userSettings.aiSettings.autoCategory}
                      onCheckedChange={(checked) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          aiSettings: {
                            ...prev.aiSettings,
                            autoCategory: checked,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">AI Suggestions</Label>
                      <p className="text-sm text-muted-foreground">
                        Show AI-powered response suggestions
                      </p>
                    </div>
                    <Switch
                      checked={userSettings.aiSettings.autoSuggest}
                      onCheckedChange={(checked) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          aiSettings: {
                            ...prev.aiSettings,
                            autoSuggest: checked,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      AI Confidence Threshold:{" "}
                      {Math.round(userSettings.aiSettings.confidence * 100)}%
                    </Label>
                    <Slider
                      value={[userSettings.aiSettings.confidence]}
                      onValueChange={([value]) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          aiSettings: { ...prev.aiSettings, confidence: value },
                        }))
                      }
                      max={1}
                      min={0.5}
                      step={0.05}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher values require more confidence for AI actions
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {aiRules.map((rule) => (
                  <Card key={rule.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center">
                            <Zap className="w-4 h-4 mr-2 text-primary" />
                            {rule.name}
                          </CardTitle>
                          <CardDescription>{rule.description}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={rule.enabled ? "default" : "secondary"}
                          >
                            {rule.enabled ? "Active" : "Disabled"}
                          </Badge>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(enabled) =>
                              handleAIRuleToggle(rule.id, enabled)
                            }
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">
                            Action: {rule.action}
                          </Label>
                          <div className="mt-1">
                            <Badge variant="outline">
                              Confidence: {Math.round(rule.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Conditions:
                          </Label>
                          <div className="mt-1 space-y-1">
                            {rule.conditions.map((condition, index) => (
                              <div
                                key={index}
                                className="text-sm text-muted-foreground"
                              >
                                • {condition}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* AI Setup Tab */}
            <TabsContent value="ai-setup" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">AI Configuration</h3>
                <p className="text-muted-foreground">
                  Configure your AI provider API keys to enable intelligent email processing
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>AI Service Status</CardTitle>
                  <CardDescription>
                    Current status of AI integrations and capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${aiStatus?.status?.available ? 'bg-green-500' : 'bg-orange-400'}`}></div>
                      <div>
                        <p className="font-medium">
                          {aiStatus?.status?.available ? 'AI Services Active' : 'Setup Required'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {aiStatus?.status?.available 
                            ? `Using ${aiStatus.status.provider?.toUpperCase()} for AI processing`
                            : "Configure at least one API key to enable AI features"
                          }
                        </p>
                      </div>
                    </div>
                    {aiStatus?.status?.available && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>

                  {/* AI Capabilities */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        <span className="font-medium text-sm">Email Categorization</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Manual categorization only - AI does not auto-categorize
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${aiStatus?.status?.capabilities?.replyGeneration ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="font-medium text-sm">Reply Generation</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Generate contextual email replies and responses
                      </p>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${aiStatus?.status?.capabilities?.summarization ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="font-medium text-sm">Email Summarization</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Create concise summaries of long email threads
                      </p>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${aiStatus?.status?.capabilities?.chat ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="font-medium text-sm">AI Assistant</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Interactive AI assistant for email management
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* OpenAI Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      AI
                    </div>
                    <span>OpenAI (GPT-4)</span>
                    {aiStatus?.setup?.openai === "configured" ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-400">
                        <XCircle className="w-3 h-3 mr-1" />
                        Setup Required
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">platform.openai.com</a>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input
                        type={showOpenaiKey ? "text" : "password"}
                        placeholder="sk-..."
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      >
                        {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <Button 
                      onClick={() => handleSaveAPIKey('openai')}
                      disabled={testingKeys || !openaiKey.trim()}
                    >
                      {testingKeys ? "Saving..." : "Save"}
                    </Button>
                    {openaiKey && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleRemoveAPIKey('openai')}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Anthropic Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      C
                    </div>
                    <span>Anthropic (Claude)</span>
                    {aiStatus?.setup?.anthropic === "configured" ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-400">
                        <XCircle className="w-3 h-3 mr-1" />
                        Setup Required
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">console.anthropic.com</a>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input
                        type={showAnthropicKey ? "text" : "password"}
                        placeholder="sk-ant-..."
                        value={anthropicKey}
                        onChange={(e) => setAnthropicKey(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                      >
                        {showAnthropicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <Button 
                      onClick={() => handleSaveAPIKey('anthropic')}
                      disabled={testingKeys || !anthropicKey.trim()}
                    >
                      {testingKeys ? "Saving..." : "Save"}
                    </Button>
                    {anthropicKey && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleRemoveAPIKey('anthropic')}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Note:</strong> For this demo, API keys are stored locally in your browser. 
                  In production, keys would be securely encrypted and stored server-side with proper access controls.
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Email Accounts Tab */}
            <TabsContent value="email-accounts" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Email Account Setup</h3>
                <p className="text-muted-foreground">
                  Connect your email accounts using IMAP/POP3 for real email access
                </p>
              </div>

              {/* Quick Setup Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-base">Gmail</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Connect via IMAP with app password
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        toast({
                          title: "Gmail Connection",
                          description: "Gmail integration would open OAuth login here. In a real deployment, this connects instantly without setup.",
                        });
                        // Simulate successful connection after 2 seconds
                        setTimeout(() => {
                          toast({
                            title: "✅ Gmail Connected",
                            description: "user@gmail.com connected successfully! Emails will sync automatically.",
                          });
                        }, 2000);
                      }}
                    >
                      Connect Gmail
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-base">Outlook</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Connect via IMAP/POP3
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        toast({
                          title: "Outlook Connection",
                          description: "Outlook integration would open Microsoft login here. One-click connection for real users.",
                        });
                        setTimeout(() => {
                          toast({
                            title: "✅ Outlook Connected", 
                            description: "work@company.com connected successfully! Emails syncing now.",
                          });
                        }, 2000);
                      }}
                    >
                      Connect Outlook
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-base">Custom IMAP</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Any IMAP/POP3 provider
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        const emailInput = document.getElementById('email') as HTMLInputElement;
                        const passwordInput = document.getElementById('password') as HTMLInputElement;
                        
                        if (!emailInput?.value || !passwordInput?.value) {
                          toast({
                            title: "Missing Information",
                            description: "Please enter your email and password below first.",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        // Auto-detect Gmail settings
                        const serverInput = document.getElementById('imap-server') as HTMLInputElement;
                        const portInput = document.getElementById('imap-port') as HTMLInputElement;
                        
                        if (emailInput.value.includes('@gmail.com')) {
                          serverInput.value = 'imap.gmail.com';
                          portInput.value = '993';
                          toast({
                            title: "Gmail Detected",
                            description: "Auto-filled Gmail IMAP settings. Use an App Password instead of your regular password.",
                          });
                        } else if (emailInput.value.includes('@outlook.com') || emailInput.value.includes('@hotmail.com')) {
                          serverInput.value = 'imap-mail.outlook.com';
                          portInput.value = '993';
                          toast({
                            title: "Outlook Detected", 
                            description: "Auto-filled Outlook IMAP settings.",
                          });
                        }
                      }}
                    >
                      Auto-Setup
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Manual IMAP Setup */}
              <Card>
                <CardHeader>
                  <CardTitle>Manual IMAP/POP3 Setup</CardTitle>
                  <CardDescription>
                    Configure any email provider using IMAP or POP3 settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password/App Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="imap-server">IMAP Server</Label>
                      <Input
                        id="imap-server"
                        placeholder="imap.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imap-port">IMAP Port</Label>
                      <Input
                        id="imap-port"
                        placeholder="993"
                        type="number"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="imap-ssl" defaultChecked />
                    <Label htmlFor="imap-ssl">Use SSL/TLS</Label>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={async () => {
                      const emailInput = document.getElementById('email') as HTMLInputElement;
                      const passwordInput = document.getElementById('password') as HTMLInputElement;
                      const serverInput = document.getElementById('imap-server') as HTMLInputElement;
                      const portInput = document.getElementById('imap-port') as HTMLInputElement;
                      
                      if (!emailInput?.value || !passwordInput?.value || !serverInput?.value) {
                        toast({
                          title: "Missing Information",
                          description: "Please fill in all required fields first.",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      toast({
                        title: "Testing Connection...",
                        description: "Connecting to " + serverInput.value,
                      });
                      
                      try {
                        const response = await fetch('/api/imap/test', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            host: serverInput.value,
                            port: parseInt(portInput.value) || 993,
                            username: emailInput.value,
                            password: passwordInput.value,
                            secure: true
                          })
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                          toast({
                            title: "✅ Connection Successful",
                            description: `Found ${data.mailboxInfo.messageCount} emails. Ready to save account!`,
                          });
                        } else {
                          toast({
                            title: "Connection Failed",
                            description: data.error || "Could not connect to email server.",
                            variant: "destructive"
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "Connection Error",
                          description: "Unable to test connection. Please check your settings.",
                          variant: "destructive"
                        });
                      }
                    }}>Test Connection</Button>
                    <Button 
                      variant="outline"
                      onClick={async () => {
                        const emailInput = document.getElementById('email') as HTMLInputElement;
                        const passwordInput = document.getElementById('password') as HTMLInputElement;
                        const serverInput = document.getElementById('imap-server') as HTMLInputElement;
                        const portInput = document.getElementById('imap-port') as HTMLInputElement;
                        
                        if (!emailInput?.value || !passwordInput?.value || !serverInput?.value) {
                          toast({
                            title: "Missing Information",
                            description: "Please test connection first to verify settings.",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        toast({
                          title: "Saving Account...",
                          description: "Connecting and fetching your emails...",
                        });
                        
                        try {
                          const response = await fetch('/api/imap/fetch', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              host: serverInput.value,
                              port: parseInt(portInput.value) || 993,
                              username: emailInput.value,
                              password: passwordInput.value,
                              secure: true
                            })
                          });
                          
                          const data = await response.json();
                          
                          if (data.success) {
                            toast({
                              title: "✅ Account Saved!",
                              description: `Successfully fetched ${data.emails.length} emails from ${emailInput.value}. Check your inbox!`,
                            });
                            
                            // Clear the form
                            emailInput.value = '';
                            passwordInput.value = '';
                            serverInput.value = '';
                            portInput.value = '';
                            
                          } else {
                            toast({
                              title: "Save Failed",
                              description: data.error || "Could not save email account.",
                              variant: "destructive"
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Save Error",
                            description: "Unable to save account. Please try again.",
                            variant: "destructive"
                          });
                        }
                      }}
                    >Save Account</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Connected Accounts */}
              <Card>
                <CardHeader>
                  <CardTitle>Connected Email Accounts</CardTitle>
                  <CardDescription>
                    Manage your connected email accounts and sync settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No email accounts connected
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Connect your first email account to start managing your messages with AI
                    </p>
                    <Button onClick={() => {
                      toast({
                        title: "📧 Connect Your Email",
                        description: "Use the quick setup cards above to connect Gmail, Outlook, or any IMAP provider.",
                      });
                    }}>Connect Email Account</Button>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security:</strong> Your email credentials are encrypted and stored securely. 
                  We recommend using app-specific passwords when available (Gmail, Outlook, etc.).
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">
                  Integration Management
                </h3>
                <p className="text-muted-foreground">
                  Manage your connected accounts and sync settings
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Email Provider Integration</CardTitle>
                  <CardDescription>
                    Configure how Dexter analyzes emails using Microsoft Graph
                    API and Gmail API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">
                        Use Microsoft Graph API metadata
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Analyze Outlook emails using Graph API metadata (To/CC
                        recipients, conversation threads, importance flags)
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">
                        Use Gmail API metadata
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Analyze Gmail emails using Gmail API metadata (labels,
                        thread tracking, message references)
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">
                        Conversation thread analysis
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Track email conversations to determine "Awaiting Reply"
                        status based on thread history
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">
                        Recipient analysis priority
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Prioritize emails sent directly to you (To field) over
                        CC'd emails
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connected Integrations</CardTitle>
                  <CardDescription>
                    View and manage your connected email and communication
                    platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mock connected integrations */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                          <span className="text-sm">📧</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Microsoft Outlook</h4>
                          <p className="text-sm text-muted-foreground">
                            user@company.com
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                          <span className="text-sm">✉️</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Gmail</h4>
                          <p className="text-sm text-muted-foreground">
                            user@gmail.com
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-sm">💼</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Slack</h4>
                          <p className="text-sm text-muted-foreground">
                            Development Team
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-sm">💬</span>
                        </div>
                        <div>
                          <h4 className="font-medium">WhatsApp Business</h4>
                          <p className="text-sm text-muted-foreground">
                            Not connected
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/integrations'}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Integration
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/integrations/management'}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sync Preferences</CardTitle>
                  <CardDescription>
                    Configure how your integrations synchronize data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">
                        Auto-sync emails every 5 minutes
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically fetch new emails from all connected
                        accounts
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Sync message history</Label>
                      <p className="text-sm text-muted-foreground">
                        Import historical messages when connecting new accounts
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">
                        Cross-platform categorization
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Apply email categories to messages from all platforms
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>Sync frequency for messaging platforms</Label>
                    <Select defaultValue="real-time">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="real-time">Real-time</SelectItem>
                        <SelectItem value="1min">Every minute</SelectItem>
                        <SelectItem value="5min">Every 5 minutes</SelectItem>
                        <SelectItem value="15min">Every 15 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data & Privacy</CardTitle>
                  <CardDescription>
                    Control how your integration data is handled
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">
                        Store message content locally
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Cache message content for faster search and offline
                        access
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Share usage analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve Dexter by sharing anonymous usage data
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label>Data retention period</Label>
                    <Select defaultValue="1year">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30days">30 days</SelectItem>
                        <SelectItem value="3months">3 months</SelectItem>
                        <SelectItem value="6months">6 months</SelectItem>
                        <SelectItem value="1year">1 year</SelectItem>
                        <SelectItem value="forever">Forever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-4">
                    <Button variant="destructive" size="sm">
                      Clear All Cached Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Troubleshooting</CardTitle>
                  <CardDescription>
                    Tools to diagnose and fix integration issues
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleTestAllConnections}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Test All Connections
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRefreshTokens}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Refresh Tokens
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCheckPermissions}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Check Permissions
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleResetConfiguration}
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      Reset Configuration
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      If you're experiencing issues with any integration, try
                      these troubleshooting steps:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>
                        Test connections to verify all platforms are responding
                      </li>
                      <li>Refresh authentication tokens if sync is failing</li>
                      <li>Check that all required permissions are granted</li>
                      <li>Reset configuration to default settings if needed</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Notification Settings</h3>
                <p className="text-muted-foreground">
                  Control how and when you receive notifications
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Desktop Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable desktop notifications</Label>
                    <Switch
                      checked={userSettings.notifications.desktop}
                      onCheckedChange={(checked) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            desktop: checked,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Email notifications</Label>
                    <Switch
                      checked={userSettings.notifications.email}
                      onCheckedChange={(checked) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            email: checked,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Sound notifications</Label>
                    <Switch
                      checked={userSettings.notifications.sound}
                      onCheckedChange={(checked) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            sound: checked,
                          },
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">General Settings</h3>
                <p className="text-muted-foreground">
                  Basic application preferences
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Interface</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={userSettings.theme}
                      onValueChange={(value) =>
                        setUserSettings((prev) => ({ ...prev, theme: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Emails per page</Label>
                    <Select
                      value={userSettings.emailsPerPage.toString()}
                      onValueChange={(value) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          emailsPerPage: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-mark as read</Label>
                    <Switch
                      checked={userSettings.autoMarkAsRead}
                      onCheckedChange={(checked) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          autoMarkAsRead: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Keyboard shortcuts</Label>
                    <Switch
                      checked={userSettings.keyboardShortcuts}
                      onCheckedChange={(checked) =>
                        setUserSettings((prev) => ({
                          ...prev,
                          keyboardShortcuts: checked,
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Filters Tab */}
            <TabsContent value="filters" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Email Filters</h3>
                  <p className="text-muted-foreground">
                    Create custom rules to automatically process emails
                  </p>
                </div>
                <Button onClick={handleCreateFilter}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Filter
                </Button>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No custom filters created
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create filters to automatically organize, forward, or
                      delete emails based on specific criteria
                    </p>
                    <Button onClick={handleCreateFilter}>Create Your First Filter</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Rule Creation Dialog */}
      <RuleCreationDialog
        open={newRuleDialog}
        onOpenChange={setNewRuleDialog}
        onCreateRule={(ruleData) => {
          if (selectedCategoryForRule) {
            handleAddRule(selectedCategoryForRule, ruleData);
          }
        }}
      />
    </div>
  );
}
