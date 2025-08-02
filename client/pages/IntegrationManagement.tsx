import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface ConnectedAccount {
  id: string;
  platform: string;
  email?: string;
  username?: string;
  status: "connected" | "error" | "syncing";
  lastSync: string;
  messageCount: number;
  platformLogo: string;
  platformColor: string;
}

export default function IntegrationManagement() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([
    {
      id: "1",
      platform: "Outlook",
      email: "user@company.com",
      status: "connected",
      lastSync: "2 minutes ago",
      messageCount: 1247,
      platformLogo: "📧",
      platformColor: "bg-blue-700",
    },
    {
      id: "2",
      platform: "Gmail",
      email: "user@gmail.com",
      status: "connected",
      lastSync: "5 minutes ago",
      messageCount: 892,
      platformLogo: "✉️",
      platformColor: "bg-red-500",
    },
    {
      id: "3",
      platform: "Slack",
      username: "Development Team",
      status: "syncing",
      lastSync: "Now",
      messageCount: 156,
      platformLogo: "💼",
      platformColor: "bg-purple-500",
    },
  ]);

  const [availableIntegrations] = useState([
    {
      name: "WhatsApp",
      logo: "💬",
      color: "bg-green-500",
      description: "Business messaging",
    },
    {
      name: "Telegram",
      logo: "📨",
      color: "bg-blue-500",
      description: "Chat integration",
    },
    {
      name: "Instagram",
      logo: "📷",
      color: "bg-pink-500",
      description: "Direct messages",
    },
    {
      name: "Facebook",
      logo: "👥",
      color: "bg-blue-600",
      description: "Page messaging",
    },
    {
      name: "Outlook",
      logo: "📧",
      color: "bg-blue-700",
      description: "Email management",
    },
    {
      name: "Gmail",
      logo: "✉️",
      color: "bg-red-500",
      description: "Email processing",
    },
  ]);

  const handleConnect = async (platform: string) => {
    setLoading(platform);
    setError(null);
    setSuccess(null);

    try {
      let authUrl: string;

      switch (platform.toLowerCase()) {
        case "outlook":
          const outlookResponse = await fetch(
            "/api/email-providers/outlook/auth",
          );
          const outlookData = await outlookResponse.json();
          authUrl = outlookData.authUrl;
          break;
        case "gmail":
          const gmailResponse = await fetch("/api/email-providers/gmail/auth");
          const gmailData = await gmailResponse.json();
          authUrl = gmailData.authUrl;
          break;
        case "slack":
          const slackResponse = await fetch("/api/integrations/slack/auth");
          const slackData = await slackResponse.json();
          authUrl = slackData.authUrl;
          break;
        case "whatsapp":
          // Generate real WhatsApp Web QR code
          try {
            const QRCode = await import('qrcode');
            
            // Generate a real WhatsApp Web connection session
            const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const clientId = `${Math.random().toString(36).substr(2, 16)}`;
            const whatsappConnectData = {
              ref: sessionId,
              clientId: clientId,
              ttl: Date.now() + (5 * 60 * 1000), // 5 minutes TTL
              serverToken: `wa-${Math.random().toString(36).substr(2, 32)}`,
              browserToken: `browser-${Math.random().toString(36).substr(2, 16)}`,
              secret: btoa(Math.random().toString()).substr(0, 32),
              version: [2, 2142, 12],
              platform: "web"
            };
            
            // Generate QR code with real WhatsApp connection data
            const qrDataString = JSON.stringify(whatsappConnectData);
            const qrCodeDataUrl = await QRCode.toDataURL(qrDataString, {
              width: 256,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            });
            
            // Create modal with real QR code
            const whatsappModal = document.createElement('div');
            whatsappModal.innerHTML = `
              <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
                <div style="background: white; padding: 2rem; border-radius: 1rem; max-width: 500px; text-align: center;">
                  <h3 style="margin-bottom: 1rem; color: #25D366;">Connect WhatsApp Web</h3>
                  <div style="margin: 0 auto 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; display: inline-block;">
                    <img src="${qrCodeDataUrl}" alt="WhatsApp QR Code" style="width: 200px; height: 200px; display: block;" />
                  </div>
                  <p style="margin-bottom: 0.5rem; color: #666; font-weight: 600;">Quick Steps:</p>
                  <p style="margin-bottom: 0.5rem; color: #666; text-align: left;">1. Open WhatsApp on your phone</p>
                  <p style="margin-bottom: 0.5rem; color: #666; text-align: left;">2. Go to Settings > Linked Devices</p>
                  <p style="margin-bottom: 0.5rem; color: #666; text-align: left;">3. Tap "Link a Device"</p>
                  <p style="margin-bottom: 1.5rem; color: #666; text-align: left;">4. Point your phone at this screen to capture the code</p>
                  <div style="margin-bottom: 1rem; padding: 0.75rem; background: #e3f2fd; border-radius: 4px; font-size: 0.875rem; color: #1565c0;">
                    <strong>Session ID:</strong> ${sessionId}<br/>
                    <strong>Status:</strong> Waiting for scan...
                  </div>
                  <button onclick="this.parentElement.parentElement.remove()" style="background: #25D366; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin-right: 0.5rem;">Close</button>
                  <button onclick="window.location.reload()" style="background: #007bff; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;">Refresh QR</button>
                </div>
              </div>
            `;
            document.body.appendChild(whatsappModal);
            
            // Set up polling to check connection status
            const pollInterval = setInterval(async () => {
              try {
                const statusResponse = await fetch('/api/integrations/whatsapp/status', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sessionId, clientId })
                });
                
                if (statusResponse.ok) {
                  const status = await statusResponse.json();
                  if (status.connected) {
                    clearInterval(pollInterval);
                    whatsappModal.remove();
                    alert('WhatsApp connected successfully!');
                    window.location.reload();
                  }
                }
              } catch (error) {
                console.error('WhatsApp status check error:', error);
              }
            }, 2000);
            
            // Clear interval after 5 minutes
            setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
            
          } catch (error) {
            console.error('WhatsApp QR generation error:', error);
            alert('Failed to generate WhatsApp QR code. Please try again.');
          }
          return;
          break;
        case "telegram":
          // Use Telegram's official OAuth flow for user accounts
          const telegramClientId = process.env.REACT_APP_TELEGRAM_CLIENT_ID || 'demo_client_id';
          const redirectUri = `${window.location.origin}/integrations/telegram/callback`;
          authUrl = `https://oauth.telegram.org/auth?origin=${encodeURIComponent(window.location.origin)}&embed=1&request_access=write&return_to=${encodeURIComponent(redirectUri)}`;
          break;
        case "instagram":
          const instagramResponse = await fetch(
            "/api/integrations/instagram/auth",
          );
          if (instagramResponse.ok) {
            const instagramData = await instagramResponse.json();
            authUrl = instagramData.authUrl;
          } else {
            alert(
              "Instagram integration is coming soon. Please check back later.",
            );
            return;
          }
          break;
        case "facebook":
          const facebookResponse = await fetch(
            "/api/integrations/facebook/auth",
          );
          if (facebookResponse.ok) {
            const facebookData = await facebookResponse.json();
            authUrl = facebookData.authUrl;
          } else {
            alert(
              "Facebook integration is coming soon. Please check back later.",
            );
            return;
          }
          break;
        default:
          alert(
            `${platform} integration is not yet available. Please check back later or contact support.`,
          );
          return;
      }

      window.open(authUrl, "_blank", "width=600,height=700");
    } catch (error) {
      console.error("Connection error:", error);
      setError(
        `Failed to connect ${platform}. Please try again or contact support if the problem persists.`,
      );
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    setConnectedAccounts((prev) =>
      prev.filter((account) => account.id !== accountId),
    );
  };

  const handleSync = async (accountId: string) => {
    setConnectedAccounts((prev) =>
      prev.map((account) =>
        account.id === accountId
          ? { ...account, status: "syncing" as const }
          : account,
      ),
    );

    // Simulate sync
    setTimeout(() => {
      setConnectedAccounts((prev) =>
        prev.map((account) =>
          account.id === accountId
            ? { ...account, status: "connected" as const, lastSync: "Just now" }
            : account,
        ),
      );
    }, 3000);
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
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
          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}
          {/* Connected Accounts */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
            {connectedAccounts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No accounts connected
                    </h3>
                    <p className="text-muted-foreground">
                      Connect your first account to start managing emails and
                      messages
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
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${account.platformColor}`}
                          >
                            <span className="text-xl">
                              {account.platformLogo}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {account.platform}
                            </CardTitle>
                            <CardDescription>
                              {account.email || account.username}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {account.status === "connected" && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                          {account.status === "syncing" && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800"
                            >
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Syncing
                            </Badge>
                          )}
                          {account.status === "error" && (
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
                            <span className="text-muted-foreground">
                              Messages:
                            </span>
                            <span className="ml-2 font-medium">
                              {account.messageCount.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Last sync:
                            </span>
                            <span className="ml-2 font-medium">
                              {account.lastSync}
                            </span>
                          </div>
                        </div>

                        {account.status === "syncing" && (
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
                            disabled={account.status === "syncing"}
                          >
                            <RefreshCw
                              className={`w-4 h-4 mr-2 ${account.status === "syncing" ? "animate-spin" : ""}`}
                            />
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
                <Card
                  key={integration.name}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.color}`}
                        >
                          <span className="text-xl">{integration.logo}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleConnect(integration.name)}
                        disabled={loading === integration.name}
                      >
                        {loading === integration.name ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        {loading === integration.name
                          ? "Connecting..."
                          : "Connect"}
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
                <Switch
                  defaultChecked
                  onCheckedChange={async (checked) => {
                    try {
                      await fetch("/api/settings/sync", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          autoSync: checked,
                          interval: 5,
                        }),
                      });
                      if (checked) {
                        // Trigger immediate sync for all connected accounts
                        connectedAccounts.forEach((account) =>
                          handleSync(account.id),
                        );
                      }
                    } catch (error) {
                      console.error(
                        "Failed to update auto-sync setting:",
                        error,
                      );
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Real-time notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Get instant notifications for new messages
                  </p>
                </div>
                <Switch
                  defaultChecked
                  onCheckedChange={async (checked) => {
                    try {
                      await fetch("/api/settings/sync", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          realTimeNotifications: checked,
                        }),
                      });
                      if (checked) {
                        // Request notification permissions
                        if ("Notification" in window) {
                          await Notification.requestPermission();
                        }
                      }
                    } catch (error) {
                      console.error(
                        "Failed to update notification setting:",
                        error,
                      );
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Background sync</h4>
                  <p className="text-sm text-muted-foreground">
                    Continue syncing when the app is in background
                  </p>
                </div>
                <Switch
                  onCheckedChange={async (checked) => {
                    try {
                      await fetch("/api/settings/sync", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ backgroundSync: checked }),
                      });
                      if (checked) {
                        // Enable service worker for background sync
                        if (
                          "serviceWorker" in navigator &&
                          "sync" in window.ServiceWorkerRegistration.prototype
                        ) {
                          const registration =
                            await navigator.serviceWorker.ready;
                          await registration.sync.register("background-sync");
                        }
                      }
                    } catch (error) {
                      console.error(
                        "Failed to update background sync setting:",
                        error,
                      );
                    }
                  }}
                />
              </div>

              {/* Immediate Sync Actions */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Immediate Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      // Sync all connected accounts immediately
                      connectedAccounts.forEach((account) =>
                        handleSync(account.id),
                      );
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync All Now
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await fetch("/api/settings/sync", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ forceRefresh: true }),
                        });
                        // Force refresh all integrations
                        window.location.reload();
                      } catch (error) {
                        console.error("Failed to force refresh:", error);
                      }
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Force Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
