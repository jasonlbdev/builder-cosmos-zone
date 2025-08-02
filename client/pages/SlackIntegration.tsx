import { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  Hash,
  Settings,
  Check,
  ExternalLink,
  AlertCircle,
  Zap,
  RefreshCw,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SlackWorkspace {
  id: string;
  name: string;
  domain: string;
  connected: boolean;
  channels: SlackChannel[];
  members: number;
}

interface SlackChannel {
  id: string;
  name: string;
  type: "channel" | "dm" | "group";
  members: number;
  enabled: boolean;
  lastMessage?: string;
  unreadCount: number;
}

const mockWorkspaces: SlackWorkspace[] = [
  {
    id: "ws-1",
    name: "Development Team",
    domain: "dev-team.slack.com",
    connected: true,
    members: 24,
    channels: [
      {
        id: "ch-1",
        name: "general",
        type: "channel",
        members: 24,
        enabled: true,
        lastMessage: "2h ago",
        unreadCount: 3,
      },
      {
        id: "ch-2",
        name: "random",
        type: "channel",
        members: 18,
        enabled: false,
        lastMessage: "1d ago",
        unreadCount: 0,
      },
      {
        id: "ch-3",
        name: "engineering",
        type: "channel",
        members: 12,
        enabled: true,
        lastMessage: "30m ago",
        unreadCount: 7,
      },
      {
        id: "ch-4",
        name: "design",
        type: "channel",
        members: 8,
        enabled: true,
        lastMessage: "4h ago",
        unreadCount: 2,
      },
    ],
  },
  {
    id: "ws-2",
    name: "Client Projects",
    domain: "clients.slack.com",
    connected: false,
    members: 15,
    channels: [],
  },
];

export default function SlackIntegration() {
  const [workspaces, setWorkspaces] =
    useState<SlackWorkspace[]>(mockWorkspaces);
  const [loading, setLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const handleConnectWorkspace = async () => {
    setLoading(true);
    // Simulate OAuth flow
    setTimeout(() => {
      setLoading(false);
      // In real implementation, this would redirect to Slack OAuth
      window.open(
        "https://slack.com/oauth/v2/authorize?client_id=YOUR_CLIENT_ID&scope=channels:read,chat:write,users:read",
        "_blank",
      );
    }, 1000);
  };

  const handleChannelToggle = (
    workspaceId: string,
    channelId: string,
    enabled: boolean,
  ) => {
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === workspaceId
          ? {
              ...ws,
              channels: ws.channels.map((ch) =>
                ch.id === channelId ? { ...ch, enabled } : ch,
              ),
            }
          : ws,
      ),
    );
  };

  const handleSyncMessages = async (workspaceId: string) => {
    setSyncProgress(0);
    setLoading(true);

    // Simulate progressive sync
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const connectedWorkspaces = workspaces.filter((ws) => ws.connected);
  const totalChannels = connectedWorkspaces.reduce(
    (acc, ws) => acc + ws.channels.length,
    0,
  );
  const enabledChannels = connectedWorkspaces.reduce(
    (acc, ws) => acc + ws.channels.filter((ch) => ch.enabled).length,
    0,
  );
  const totalUnread = connectedWorkspaces.reduce(
    (acc, ws) =>
      acc + ws.channels.reduce((chAcc, ch) => chAcc + ch.unreadCount, 0),
    0,
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Slack Integration</h1>
              <p className="text-muted-foreground">
                Manage your Slack workspaces and channels
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {connectedWorkspaces.length > 0 && (
              <Button
                variant="outline"
                onClick={() => handleSyncMessages("all")}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Sync Messages
              </Button>
            )}
            <Button onClick={handleConnectWorkspace} disabled={loading}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect Workspace
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats Overview */}
          {connectedWorkspaces.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold">
                        {connectedWorkspaces.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Workspaces
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold">
                        {enabledChannels}/{totalChannels}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Active Channels
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold">{totalUnread}</div>
                      <p className="text-xs text-muted-foreground">
                        Unread Messages
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold">95%</div>
                      <p className="text-xs text-muted-foreground">
                        Sync Status
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sync Progress */}
          {loading && syncProgress > 0 && (
            <Alert>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <AlertDescription>
                Syncing messages... {syncProgress}%
                <Progress value={syncProgress} className="mt-2" />
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="workspaces" className="space-y-6">
            <TabsList>
              <TabsTrigger value="workspaces">
                <Users className="w-4 h-4 mr-2" />
                Workspaces
              </TabsTrigger>
              <TabsTrigger value="channels">
                <Hash className="w-4 h-4 mr-2" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Workspaces Tab */}
            <TabsContent value="workspaces" className="space-y-4">
              {workspaces.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Slack workspaces connected
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Connect your first Slack workspace to start managing
                        messages in FlowMail
                      </p>
                      <Button onClick={handleConnectWorkspace}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Connect Slack Workspace
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {workspaces.map((workspace) => (
                    <Card key={workspace.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                              <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <span>{workspace.name}</span>
                                {workspace.connected && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-800"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Connected
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription>
                                {workspace.domain} • {workspace.members} members
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {workspace.connected ? (
                              <>
                                <Button variant="outline" size="sm">
                                  <Settings className="w-4 h-4 mr-2" />
                                  Configure
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleSyncMessages(workspace.id)
                                  }
                                >
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Sync
                                </Button>
                              </>
                            ) : (
                              <Button onClick={handleConnectWorkspace}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Connect
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      {workspace.connected && workspace.channels.length > 0 && (
                        <CardContent>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Channels (
                              {
                                workspace.channels.filter((ch) => ch.enabled)
                                  .length
                              }
                              /{workspace.channels.length} active)
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              {workspace.channels.slice(0, 4).map((channel) => (
                                <div
                                  key={channel.id}
                                  className="flex items-center justify-between p-2 bg-muted rounded"
                                >
                                  <div className="flex items-center space-x-2">
                                    <Hash className="w-3 h-3" />
                                    <span className="text-sm">
                                      {channel.name}
                                    </span>
                                    {channel.unreadCount > 0 && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {channel.unreadCount}
                                      </Badge>
                                    )}
                                  </div>
                                  <Switch
                                    checked={channel.enabled}
                                    onCheckedChange={(enabled) =>
                                      handleChannelToggle(
                                        workspace.id,
                                        channel.id,
                                        enabled,
                                      )
                                    }
                                    size="sm"
                                  />
                                </div>
                              ))}
                            </div>
                            {workspace.channels.length > 4 && (
                              <p className="text-xs text-muted-foreground">
                                +{workspace.channels.length - 4} more channels
                              </p>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Channels Tab */}
            <TabsContent value="channels" className="space-y-4">
              {connectedWorkspaces.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Hash className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No channels available
                      </h3>
                      <p className="text-muted-foreground">
                        Connect a Slack workspace to manage channels
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {connectedWorkspaces.map((workspace) => (
                    <Card key={workspace.id}>
                      <CardHeader>
                        <CardTitle>{workspace.name} Channels</CardTitle>
                        <CardDescription>
                          Manage which channels sync with FlowMail
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-64">
                          <div className="space-y-2">
                            {workspace.channels.map((channel) => (
                              <div
                                key={channel.id}
                                className="flex items-center justify-between p-3 border rounded"
                              >
                                <div className="flex items-center space-x-3">
                                  <Hash className="w-4 h-4" />
                                  <div>
                                    <div className="font-medium">
                                      #{channel.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {channel.members} members • Last:{" "}
                                      {channel.lastMessage}
                                    </div>
                                  </div>
                                  {channel.unreadCount > 0 && (
                                    <Badge>{channel.unreadCount} unread</Badge>
                                  )}
                                </div>
                                <Switch
                                  checked={channel.enabled}
                                  onCheckedChange={(enabled) =>
                                    handleChannelToggle(
                                      workspace.id,
                                      channel.id,
                                      enabled,
                                    )
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Slack Integration Settings</CardTitle>
                  <CardDescription>
                    Configure how Slack messages are handled in FlowMail
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Auto-sync messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync new Slack messages to FlowMail
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">
                        Real-time notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Show desktop notifications for new Slack messages
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Sync frequency</Label>
                    <select className="w-full p-2 border rounded">
                      <option>Every 5 minutes</option>
                      <option>Every 15 minutes</option>
                      <option>Every 30 minutes</option>
                      <option>Every hour</option>
                    </select>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Thread handling</Label>
                    <select className="w-full p-2 border rounded">
                      <option>Show as separate messages</option>
                      <option>Group in email threads</option>
                      <option>Summarize thread daily</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions for this integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive">
                    Disconnect All Workspaces
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
