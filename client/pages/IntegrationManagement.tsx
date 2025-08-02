import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Settings, CheckCircle, XCircle, RefreshCw, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface ConnectedAccount {
  id: string;
  platform: string;
  email?: string;
  username?: string;
  status: 'connected' | 'error' | 'syncing';
  lastSync: string;
  messageCount: number;
  platformLogo: string;
  platformColor: string;
}

export default function IntegrationManagement() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
    {
      id: '1',
      platform: 'Outlook',
      email: 'user@company.com',
      status: 'connected',
      lastSync: '2 minutes ago',
      messageCount: 1247,
      platformLogo: '📧',
      platformColor: 'bg-blue-700'
    },
    {
      id: '2',
      platform: 'Gmail',
      email: 'user@gmail.com',
      status: 'connected',
      lastSync: '5 minutes ago',
      messageCount: 892,
      platformLogo: '✉️',
      platformColor: 'bg-red-500'
    },
    {
      id: '3',
      platform: 'Slack',
      username: 'Development Team',
      status: 'syncing',
      lastSync: 'Now',
      messageCount: 156,
      platformLogo: '💼',
      platformColor: 'bg-purple-500'
    }
  ]);

  const [availableIntegrations] = useState([
    { name: 'WhatsApp', logo: '💬', color: 'bg-green-500', description: 'Business messaging' },
    { name: 'Telegram', logo: '📨', color: 'bg-blue-500', description: 'Chat integration' },
    { name: 'Instagram', logo: '📷', color: 'bg-pink-500', description: 'Direct messages' },
    { name: 'Facebook', logo: '👥', color: 'bg-blue-600', description: 'Page messaging' }
  ]);

  const handleConnect = async (platform: string) => {
    try {
      let authUrl: string;

      switch (platform.toLowerCase()) {
        case 'outlook':
          const outlookResponse = await fetch('/api/email-providers/outlook/auth');
          const outlookData = await outlookResponse.json();
          authUrl = outlookData.authUrl;
          break;
        case 'gmail':
          const gmailResponse = await fetch('/api/email-providers/gmail/auth');
          const gmailData = await gmailResponse.json();
          authUrl = gmailData.authUrl;
          break;
        case 'slack':
          const slackResponse = await fetch('/api/integrations/slack/auth');
          const slackData = await slackResponse.json();
          authUrl = slackData.authUrl;
          break;
        case 'whatsapp':
          const whatsappResponse = await fetch('/api/integrations/whatsapp/auth');
          if (whatsappResponse.ok) {
            const whatsappData = await whatsappResponse.json();
            authUrl = whatsappData.authUrl;
          } else {
            // Fallback for WhatsApp - show instructions
            alert('WhatsApp Business integration requires manual setup. Please contact support for WhatsApp Business API access.');
            return;
          }
          break;
        case 'telegram':
          const telegramResponse = await fetch('/api/integrations/telegram/auth');
          if (telegramResponse.ok) {
            const telegramData = await telegramResponse.json();
            authUrl = telegramData.authUrl;
          } else {
            // Fallback for Telegram - show bot token input
            const botToken = prompt('Enter your Telegram Bot Token:');
            if (botToken) {
              const connectResponse = await fetch('/api/integrations/telegram/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botToken })
              });
              if (connectResponse.ok) {
                alert('Telegram bot connected successfully!');
                // Refresh the page or update state
                window.location.reload();
              } else {
                alert('Failed to connect Telegram bot. Please check your token.');
              }
            }
            return;
          }
          break;
        case 'instagram':
          const instagramResponse = await fetch('/api/integrations/instagram/auth');
          if (instagramResponse.ok) {
            const instagramData = await instagramResponse.json();
            authUrl = instagramData.authUrl;
          } else {
            alert('Instagram integration is coming soon. Please check back later.');
            return;
          }
          break;
        case 'facebook':
          const facebookResponse = await fetch('/api/integrations/facebook/auth');
          if (facebookResponse.ok) {
            const facebookData = await facebookResponse.json();
            authUrl = facebookData.authUrl;
          } else {
            alert('Facebook integration is coming soon. Please check back later.');
            return;
          }
          break;
        default:
          alert(`${platform} integration is not yet available. Please check back later or contact support.`);
          return;
      }

      window.open(authUrl, '_blank', 'width=600,height=700');
    } catch (error) {
      console.error('Connection error:', error);
      alert(`Failed to connect ${platform}. Please try again or contact support if the problem persists.`);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    setConnectedAccounts(prev => prev.filter(account => account.id !== accountId));
  };

  const handleSync = async (accountId: string) => {
    setConnectedAccounts(prev => prev.map(account => 
      account.id === accountId 
        ? { ...account, status: 'syncing' as const }
        : account
    ));

    // Simulate sync
    setTimeout(() => {
      setConnectedAccounts(prev => prev.map(account => 
        account.id === accountId 
          ? { ...account, status: 'connected' as const, lastSync: 'Just now' }
          : account
      ));
    }, 3000);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Integration Management</h1>
              <p className="text-muted-foreground">
                Manage your connected accounts and sync settings
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Global Settings
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Connected Accounts */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
            {connectedAccounts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No accounts connected</h3>
                    <p className="text-muted-foreground">
                      Connect your first account to start managing emails and messages
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {connectedAccounts.map((account) => (
                  <Card key={account.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${account.platformColor}`}>
                            <span className="text-xl">{account.platformLogo}</span>
                          </div>
                          <div>
                            <CardTitle className="text-base">{account.platform}</CardTitle>
                            <CardDescription>
                              {account.email || account.username}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {account.status === 'connected' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                          {account.status === 'syncing' && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Syncing
                            </Badge>
                          )}
                          {account.status === 'error' && (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Error
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Messages:</span>
                            <span className="ml-2 font-medium">{account.messageCount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last sync:</span>
                            <span className="ml-2 font-medium">{account.lastSync}</span>
                          </div>
                        </div>
                        
                        {account.status === 'syncing' && (
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span>Syncing messages...</span>
                              <span>78%</span>
                            </div>
                            <Progress value={78} />
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(account.id)}
                            disabled={account.status === 'syncing'}
                          >
                            <RefreshCw className={`w-4 h-4 mr-2 ${account.status === 'syncing' ? 'animate-spin' : ''}`} />
                            Sync Now
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDisconnect(account.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Available Integrations */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Add New Integration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableIntegrations.map((integration) => (
                <Card key={integration.name} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.color}`}>
                          <span className="text-xl">{integration.logo}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <Button onClick={() => handleConnect(integration.name)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sync Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>
                Configure how and when your accounts are synchronized
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-sync every 5 minutes</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync new messages and emails
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Real-time notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Get instant notifications for new messages
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Background sync</h4>
                  <p className="text-sm text-muted-foreground">
                    Continue syncing when the app is in background
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
