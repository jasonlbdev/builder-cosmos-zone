import { useState } from 'react';
import { Plus, Trash2, Edit, Save, X, Zap, Shield, Bell, User, Palette, Mail, Bot, Filter, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface EmailCategory {
  id: string;
  name: string;
  color: string;
  description: string;
  rules: CategoryRule[];
  enabled: boolean;
}

interface CategoryRule {
  id: string;
  type: 'sender' | 'subject' | 'content' | 'domain' | 'keywords' | 'toRecipients' | 'ccRecipients' | 'importance' | 'hasAttachments' | 'conversationId' | 'categories' | 'flag' | 'messageClass';
  condition: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex' | 'is_null' | 'is_not_null' | 'greater_than' | 'less_than';
  value: string;
  enabled: boolean;
  apiField?: string; // Microsoft Graph API field reference
  description?: string;
}

interface AIRule {
  id: string;
  name: string;
  description: string;
  action: 'categorize' | 'priority' | 'autoRespond' | 'archive' | 'forward';
  conditions: string[];
  confidence: number;
  enabled: boolean;
}

const defaultCategories: EmailCategory[] = [
  {
    id: 'to-respond',
    name: 'To Respond',
    color: 'bg-red-500',
    description: 'Emails requiring immediate response',
    rules: [
      { id: '1', type: 'keywords', condition: 'contains', value: 'urgent, ASAP, deadline', enabled: true },
      { id: '2', type: 'subject', condition: 'contains', value: 'meeting', enabled: true }
    ],
    enabled: true
  },
  {
    id: 'awaiting-reply',
    name: 'Awaiting Reply',
    color: 'bg-orange-500',
    description: 'Emails waiting for responses from others',
    rules: [
      { id: '3', type: 'subject', condition: 'starts_with', value: 'Re:', enabled: true }
    ],
    enabled: true
  },
  {
    id: 'important',
    name: 'Important',
    color: 'bg-yellow-500',
    description: 'High priority emails',
    rules: [
      { id: '4', type: 'sender', condition: 'contains', value: 'ceo@, manager@', enabled: true }
    ],
    enabled: true
  },
  {
    id: 'fyi',
    name: 'FYI',
    color: 'bg-blue-500',
    description: 'Informational emails for awareness',
    rules: [
      { id: '5', type: 'subject', condition: 'starts_with', value: 'FYI:', enabled: true }
    ],
    enabled: true
  },
  {
    id: 'marketing',
    name: 'Marketing',
    color: 'bg-purple-500',
    description: 'Promotional and marketing emails',
    rules: [
      { id: '6', type: 'keywords', condition: 'contains', value: 'unsubscribe, newsletter, promotion', enabled: true }
    ],
    enabled: true
  },
  {
    id: 'updates',
    name: 'Updates',
    color: 'bg-indigo-500',
    description: 'Product updates and notifications',
    rules: [
      { id: '7', type: 'domain', condition: 'contains', value: 'notifications@, noreply@', enabled: true }
    ],
    enabled: true
  }
];

const defaultAIRules: AIRule[] = [
  {
    id: 'ai-1',
    name: 'Auto-categorize newsletters',
    description: 'Automatically categorize newsletter emails as Marketing',
    action: 'categorize',
    conditions: ['Contains unsubscribe link', 'From marketing domain', 'Weekly/Monthly frequency'],
    confidence: 0.85,
    enabled: true
  },
  {
    id: 'ai-2',
    name: 'Priority urgent emails',
    description: 'Mark emails with urgent keywords as high priority',
    action: 'priority',
    conditions: ['Contains urgent keywords', 'From internal domain', 'Short response time expected'],
    confidence: 0.90,
    enabled: true
  },
  {
    id: 'ai-3',
    name: 'Auto-archive notifications',
    description: 'Automatically archive system notifications after 7 days',
    action: 'archive',
    conditions: ['From no-reply address', 'System notification type', 'Older than 7 days'],
    confidence: 0.95,
    enabled: false
  }
];

export default function Settings() {
  const [categories, setCategories] = useState<EmailCategory[]>(defaultCategories);
  const [aiRules, setAiRules] = useState<AIRule[]>(defaultAIRules);
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // User Settings State
  const [userSettings, setUserSettings] = useState({
    theme: 'light',
    emailsPerPage: 50,
    autoMarkAsRead: true,
    keyboardShortcuts: true,
    notifications: {
      desktop: true,
      email: false,
      sound: true
    },
    aiSettings: {
      autoSuggest: true,
      autoCategory: true,
      confidence: 0.8
    }
  });

  const handleCategoryUpdate = async (categoryId: string, updates: Partial<EmailCategory>) => {
    try {
      const response = await fetch(`/api/ai/rules/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setCategories(prev => prev.map(cat =>
          cat.id === categoryId ? { ...cat, ...updates } : cat
        ));
      }
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/ai/rules/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleCreateCategory = async (categoryData: Partial<EmailCategory>) => {
    try {
      const response = await fetch('/api/ai/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories(prev => [...prev, newCategory.rule]);
        setNewCategoryDialog(false);
      }
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleAddRule = async (categoryId: string, ruleData: Partial<CategoryRule>) => {
    try {
      const response = await fetch('/api/ai/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ruleData,
          category: categoryId
        })
      });

      if (response.ok) {
        const newRule = await response.json();
        setCategories(prev => prev.map(cat =>
          cat.id === categoryId
            ? { ...cat, rules: [...cat.rules, newRule.rule] }
            : cat
        ));
      }
    } catch (error) {
      console.error('Failed to add rule:', error);
    }
  };

  const handleAIRuleToggle = (ruleId: string, enabled: boolean) => {
    setAiRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled } : rule
    ));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your email categories, AI rules, and preferences
            </p>
          </div>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="categories" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="categories">
                <Tag className="w-4 h-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="ai-rules">
                <Bot className="w-4 h-4 mr-2" />
                AI Rules
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
              <Card>
                <CardHeader>
                  <CardTitle>Email Provider Integration</CardTitle>
                  <CardDescription>
                    Configure how Dexter analyzes emails using Microsoft Graph API and Gmail API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Use Microsoft Graph API metadata</Label>
                      <p className="text-sm text-muted-foreground">
                        Analyze Outlook emails using Graph API metadata (To/CC recipients, conversation threads, importance flags)
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Use Gmail API metadata</Label>
                      <p className="text-sm text-muted-foreground">
                        Analyze Gmail emails using Gmail API metadata (labels, thread tracking, message references)
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Conversation thread analysis</Label>
                      <p className="text-sm text-muted-foreground">
                        Track email conversations to determine "Awaiting Reply" status based on thread history
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Recipient analysis priority</Label>
                      <p className="text-sm text-muted-foreground">
                        Prioritize emails sent directly to you (To field) over CC'd emails
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Email Categories</h3>
                  <p className="text-muted-foreground">Categories are determined by email metadata first, then keyword analysis as fallback</p>
                </div>
                <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
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
                        <Label htmlFor="category-description">Description</Label>
                        <Textarea id="category-description" placeholder="Brief description of this category" />
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
                          onClick={() => handleCreateCategory({
                            name: (document.getElementById('category-name') as HTMLInputElement)?.value,
                            description: (document.getElementById('category-description') as HTMLTextAreaElement)?.value,
                            color: 'bg-blue-500',
                            rules: [],
                            enabled: true
                          })}
                        >
                          Create Category
                        </Button>
                        <Button variant="outline" onClick={() => setNewCategoryDialog(false)}>
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
                          <div className={`w-4 h-4 rounded ${category.color}`} />
                          <div>
                            <CardTitle className="text-base">{category.name}</CardTitle>
                            <CardDescription>{category.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={category.enabled}
                            onCheckedChange={(enabled) => handleCategoryUpdate(category.id, { enabled })}
                          />
                          <Button variant="ghost" size="sm">
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
                        <h4 className="text-sm font-medium">Categorization Rules</h4>
                        {category.rules.map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
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
                          onClick={() => handleAddRule(category.id, {
                            type: 'keywords',
                            condition: 'contains',
                            value: 'new rule',
                            enabled: true
                          })}
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
                <p className="text-muted-foreground">Configure intelligent email processing and automation</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>AI Configuration</CardTitle>
                  <CardDescription>Global AI settings for email processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Enable AI Categorization</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically categorize emails using AI
                      </p>
                    </div>
                    <Switch 
                      checked={userSettings.aiSettings.autoCategory}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({
                          ...prev,
                          aiSettings: { ...prev.aiSettings, autoCategory: checked }
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
                        setUserSettings(prev => ({
                          ...prev,
                          aiSettings: { ...prev.aiSettings, autoSuggest: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>AI Confidence Threshold: {Math.round(userSettings.aiSettings.confidence * 100)}%</Label>
                    <Slider
                      value={[userSettings.aiSettings.confidence]}
                      onValueChange={([value]) => 
                        setUserSettings(prev => ({
                          ...prev,
                          aiSettings: { ...prev.aiSettings, confidence: value }
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
                          <Badge variant={rule.enabled ? "default" : "secondary"}>
                            {rule.enabled ? "Active" : "Disabled"}
                          </Badge>
                          <Switch 
                            checked={rule.enabled}
                            onCheckedChange={(enabled) => handleAIRuleToggle(rule.id, enabled)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Action: {rule.action}</Label>
                          <div className="mt-1">
                            <Badge variant="outline">
                              Confidence: {Math.round(rule.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Conditions:</Label>
                          <div className="mt-1 space-y-1">
                            {rule.conditions.map((condition, index) => (
                              <div key={index} className="text-sm text-muted-foreground">
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

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Notification Settings</h3>
                <p className="text-muted-foreground">Control how and when you receive notifications</p>
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
                        setUserSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, desktop: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Email notifications</Label>
                    <Switch 
                      checked={userSettings.notifications.email}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Sound notifications</Label>
                    <Switch 
                      checked={userSettings.notifications.sound}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, sound: checked }
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
                <p className="text-muted-foreground">Basic application preferences</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Interface</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={userSettings.theme} onValueChange={(value) => 
                      setUserSettings(prev => ({ ...prev, theme: value }))
                    }>
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
                    <Select value={userSettings.emailsPerPage.toString()} onValueChange={(value) => 
                      setUserSettings(prev => ({ ...prev, emailsPerPage: parseInt(value) }))
                    }>
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
                        setUserSettings(prev => ({ ...prev, autoMarkAsRead: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Keyboard shortcuts</Label>
                    <Switch 
                      checked={userSettings.keyboardShortcuts}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({ ...prev, keyboardShortcuts: checked }))
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
                  <p className="text-muted-foreground">Create custom rules to automatically process emails</p>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Filter
                </Button>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No custom filters created</h3>
                    <p className="text-muted-foreground mb-4">
                      Create filters to automatically organize, forward, or delete emails based on specific criteria
                    </p>
                    <Button>Create Your First Filter</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
