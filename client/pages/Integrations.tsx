import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Send, Users, Settings, Check, ExternalLink, ChevronDown, ChevronRight, HardDrive, Cloud, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface IntegrationPlatform {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  connected: boolean;
  status: 'healthy' | 'warning' | 'error' | 'disconnected';
  category: 'communication' | 'file-storage';
  metrics?: {
    messages?: number;
    channels?: number;
    chats?: number;
    conversations?: number;
    folders?: number;
    labels?: number;
    files?: number;
    storage?: string;
  };
  features: string[];
  logo?: string;
}

interface IntegrationCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  platforms: IntegrationPlatform[];
  isOpen: boolean;
}

const communicationPlatforms: IntegrationPlatform[] = [
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    description: 'Connect your Outlook email account with full Microsoft Graph API integration',
    icon: MessageSquare,
    color: 'bg-blue-700',
    connected: false,
    status: 'disconnected',
    category: 'communication',
    metrics: { messages: 0, folders: 0 },
    features: ['Email Management', 'Calendar Integration', 'Contacts Sync', 'Rules & Filters'],
    logo: '📧'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Integrate your Gmail account with advanced Google API features',
    icon: MessageSquare,
    color: 'bg-red-500',
    connected: false,
    status: 'disconnected',
    category: 'communication',
    metrics: { messages: 0, labels: 0 },
    features: ['Email Processing', 'Label Management', 'Smart Filters', 'Thread Tracking'],
    logo: '✉️'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Manage WhatsApp Business conversations and customer communications',
    icon: MessageSquare,
    color: 'bg-green-500',
    connected: false,
    status: 'disconnected',
    category: 'communication',
    metrics: { messages: 0, conversations: 0 },
    features: ['Business Messages', 'Customer Support', 'Automated Responses', 'Media Sharing'],
    logo: '💬'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Connect your Slack workspace to manage messages alongside emails',
    icon: MessageSquare,
    color: 'bg-purple-500',
    connected: false,
    status: 'disconnected',
    category: 'communication',
    metrics: { messages: 0, channels: 0 },
    features: ['Direct Messages', 'Channel Messages', 'Thread Management', 'Status Updates'],
    logo: '💼'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Integrate Telegram chats and channels into your workflow',
    icon: Send,
    color: 'bg-blue-500',
    connected: false,
    status: 'disconnected',
    category: 'communication',
    metrics: { messages: 0, chats: 0 },
    features: ['Personal Chats', 'Group Messages', 'Channel Management', 'Bot Integration'],
    logo: '📨'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Manage Instagram direct messages and business conversations',
    icon: Users,
    color: 'bg-pink-500',
    connected: false,
    status: 'disconnected',
    category: 'communication',
    metrics: { messages: 0, conversations: 0 },
    features: ['Direct Messages', 'Business Conversations', 'Story Replies', 'Comment Management'],
    logo: '📷'
  },
  {
    id: 'facebook',
    name: 'Facebook Messenger',
    description: 'Handle Facebook page messages and Messenger conversations',
    icon: MessageSquare,
    color: 'bg-blue-600',
    connected: false,
    status: 'disconnected',
    category: 'communication',
    metrics: { messages: 0, conversations: 0 },
    features: ['Page Messages', 'Messenger Chats', 'Automated Responses', 'Customer Support'],
    logo: '👥'
  }
];

const fileStoragePlatforms: IntegrationPlatform[] = [
  {
    id: 'onedrive',
    name: 'Microsoft OneDrive',
    description: 'Access and manage files from your OneDrive account',
    icon: Cloud,
    color: 'bg-blue-600',
    connected: false,
    status: 'disconnected',
    category: 'file-storage',
    metrics: { files: 0, storage: '0 GB' },
    features: ['File Access', 'Document Search', 'Share Management', 'Version History'],
    logo: '☁️'
  },
  {
    id: 'googledrive',
    name: 'Google Drive',
    description: 'Connect to Google Drive for file storage and collaboration',
    icon: HardDrive,
    color: 'bg-green-600',
    connected: false,
    status: 'disconnected',
    category: 'file-storage',
    metrics: { files: 0, storage: '0 GB' },
    features: ['File Management', 'Shared Drives', 'Document Collaboration', 'Real-time Sync'],
    logo: '📁'
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    description: 'Access SharePoint document libraries and team sites',
    icon: Database,
    color: 'bg-indigo-600',
    connected: false,
    status: 'disconnected',
    category: 'file-storage',
    metrics: { files: 0, storage: '0 GB' },
    features: ['Document Libraries', 'Team Sites', 'Content Management', 'Workflow Integration'],
    logo: '🗃️'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Integrate with Dropbox for cloud file storage and sharing',
    icon: Cloud,
    color: 'bg-blue-500',
    connected: false,
    status: 'disconnected',
    category: 'file-storage',
    metrics: { files: 0, storage: '0 GB' },
    features: ['File Sync', 'Smart Sync', 'File Requests', 'Advanced Sharing'],
    logo: '📦'
  }
];

const integrationCategories: IntegrationCategory[] = [
  {
    id: 'communication',
    name: 'Communication',
    description: 'Email, messaging, and chat platforms',
    icon: MessageSquare,
    platforms: communicationPlatforms,
    isOpen: true
  },
  {
    id: 'file-storage',
    name: 'File Storage',
    description: 'Cloud storage and file management platforms',
    icon: HardDrive,
    platforms: fileStoragePlatforms,
    isOpen: false
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'bg-green-500';
    case 'warning': return 'bg-yellow-500';
    case 'error': return 'bg-red-500';
    case 'disconnected': return 'bg-gray-300';
    default: return 'bg-gray-300';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'healthy': return 'Healthy';
    case 'warning': return 'Warning';
    case 'error': return 'Error';
    case 'disconnected': return 'Disconnected';
    default: return 'Unknown';
  }
};

export default function Integrations() {
  const [categories, setCategories] = useState<IntegrationCategory[]>(integrationCategories);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  const fetchIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/integrations');
      const data = await response.json();

      setCategories(prev => prev.map(category => ({
        ...category,
        platforms: category.platforms.map(platform => ({
          ...platform,
          connected: data[platform.id]?.connected || false,
          status: data[platform.id]?.status || (data[platform.id]?.connected ? 'healthy' : 'disconnected'),
          metrics: data[platform.id]?.metrics || platform.metrics
        }))
      })));
    } catch (error) {
      console.error('Failed to fetch integration status:', error);
    }
  };

  const handleConnect = async (platformId: string) => {
    setLoading(platformId);
    
    try {
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: platformId,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCategories(prev => prev.map(category => ({
          ...category,
          platforms: category.platforms.map(platform =>
            platform.id === platformId
              ? { ...platform, connected: true, status: 'healthy' }
              : platform
          )
        })));
      }
    } catch (error) {
      console.error('Failed to connect integration:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    setCategories(prev => prev.map(category => ({
      ...category,
      platforms: category.platforms.map(platform =>
        platform.id === platformId
          ? { ...platform, connected: false, status: 'disconnected', metrics: platform.category === 'communication' ? { messages: 0 } : { files: 0, storage: '0 GB' } }
          : platform
      )
    })));
  };

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => prev.map(category =>
      category.id === categoryId
        ? { ...category, isOpen: !category.isOpen }
        : category
    ));
  };

  const getAllConnectedPlatforms = () => {
    return categories.flatMap(category =>
      category.platforms.filter(platform => platform.connected)
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Integrations</h1>
            <p className="text-muted-foreground">
              Connect your communication platforms to manage everything in one place
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/integrations/management">
              <Settings className="w-4 h-4 mr-2" />
              Manage Accounts
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Connected Integrations Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {getAllConnectedPlatforms().map((platform) => (
              <Card key={platform.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", platform.color)}>
                      {platform.logo ? (
                        <span className="text-sm">{platform.logo}</span>
                      ) : (
                        <platform.icon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm">{platform.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <div className={cn("w-2 h-2 rounded-full", getStatusColor(platform.status))} />
                          <span className="text-xs text-muted-foreground">{getStatusLabel(platform.status)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {platform.category === 'communication' ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Messages</span>
                          <span className="font-medium">{platform.metrics?.messages || 0}</span>
                        </div>
                        {platform.metrics?.channels && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Channels</span>
                            <span className="font-medium">{platform.metrics.channels}</span>
                          </div>
                        )}
                        {platform.metrics?.chats && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Chats</span>
                            <span className="font-medium">{platform.metrics.chats}</span>
                          </div>
                        )}
                        {platform.metrics?.conversations && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Conversations</span>
                            <span className="font-medium">{platform.metrics.conversations}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Files</span>
                          <span className="font-medium">{platform.metrics?.files || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Storage</span>
                          <span className="font-medium">{platform.metrics?.storage || '0 GB'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {getAllConnectedPlatforms().length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No integrations connected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Connect your first platform below to start managing all your communications and files in one place
                </p>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Available Integrations by Category */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Available Integrations</h2>

            {categories.map((category) => (
              <Collapsible
                key={category.id}
                open={category.isOpen}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <category.icon className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-base">{category.name}</CardTitle>
                            <CardDescription>{category.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-muted-foreground">
                              {category.platforms.filter(p => p.connected).length}/{category.platforms.length} connected
                            </span>
                          </div>
                          {category.isOpen ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.platforms.map((platform) => (
                          <Card key={platform.id} className="relative">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", platform.color)}>
                                    {platform.logo ? (
                                      <span className="text-xl">{platform.logo}</span>
                                    ) : (
                                      <platform.icon className="w-5 h-5 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-sm flex items-center space-x-2">
                                      <span>{platform.name}</span>
                                      <div className="flex items-center space-x-1">
                                        <div className={cn("w-2 h-2 rounded-full", getStatusColor(platform.status))} />
                                      </div>
                                    </CardTitle>
                                    <CardDescription className="text-xs">{platform.description}</CardDescription>
                                    {platform.connected && (
                                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 mt-1">
                                        <Check className="w-3 h-3 mr-1" />
                                        Connected
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Switch
                                  checked={platform.connected}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      handleConnect(platform.id);
                                    } else {
                                      handleDisconnect(platform.id);
                                    }
                                  }}
                                  disabled={loading === platform.id}
                                />
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Features</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {platform.features.map((feature) => (
                                      <Badge key={feature} variant="outline" className="text-xs">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                {platform.connected ? (
                                  <div className="flex space-x-2 pt-2">
                                    <Button size="sm" variant="outline" className="flex-1">
                                      <Settings className="w-4 h-4 mr-2" />
                                      Configure
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDisconnect(platform.id)}
                                    >
                                      Disconnect
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleConnect(platform.id)}
                                    disabled={loading === platform.id}
                                  >
                                    {loading === platform.id ? 'Connecting...' : (
                                      <>
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Connect {platform.name}
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
