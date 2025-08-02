import { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, Settings, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface IntegrationPlatform {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  connected: boolean;
  metrics?: {
    messages: number;
    channels?: number;
    chats?: number;
    conversations?: number;
  };
  features: string[];
}

const platforms: IntegrationPlatform[] = [
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    description: 'Connect your Outlook email account with full Microsoft Graph API integration',
    icon: MessageSquare,
    color: 'bg-blue-700',
    connected: false,
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
    metrics: { messages: 0, conversations: 0 },
    features: ['Page Messages', 'Messenger Chats', 'Automated Responses', 'Customer Support'],
    logo: '👥'
  }
];

export default function Integrations() {
  const [integrations, setIntegrations] = useState<IntegrationPlatform[]>(platforms);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  const fetchIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/integrations');
      const data = await response.json();
      
      setIntegrations(prev => prev.map(platform => ({
        ...platform,
        connected: data[platform.id]?.connected || false,
        metrics: data[platform.id]?.metrics || platform.metrics
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
        setIntegrations(prev => prev.map(platform => 
          platform.id === platformId 
            ? { ...platform, connected: true }
            : platform
        ));
      }
    } catch (error) {
      console.error('Failed to connect integration:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    setIntegrations(prev => prev.map(platform => 
      platform.id === platformId 
        ? { ...platform, connected: false, metrics: { messages: 0 } }
        : platform
    ));
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
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Connected Integrations Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {integrations.filter(p => p.connected).map((platform) => (
              <Card key={platform.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", platform.color)}>
                      <platform.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{platform.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {integrations.filter(p => p.connected).length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No integrations connected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Connect your first platform below to start managing all your communications in one place
                </p>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Available Integrations */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Available Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrations.map((platform) => (
                <Card key={platform.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", platform.color)}>
                          <platform.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span>{platform.name}</span>
                            {platform.connected && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <Check className="w-3 h-3 mr-1" />
                                Connected
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{platform.description}</CardDescription>
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
          </div>
        </div>
      </div>
    </div>
  );
}
