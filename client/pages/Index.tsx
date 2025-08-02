import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Settings, Plus, Archive, Trash2, Star, Reply, Forward, MoreHorizontal, Inbox, Send, CheckCircle, Clock, AlertCircle, Users, MessageSquare, Zap, PenTool, Mail, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ComposeModal } from '@/components/ComposeModal';
import { DexterAI } from '@/components/DexterAI';
import MessageView from '@/components/MessageView';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { icon: Inbox, label: 'Inbox', count: 23, active: true },
  { icon: Send, label: 'Sent', count: 156 },
  { icon: CheckCircle, label: 'To Respond', count: 3 },
  { icon: Clock, label: 'Awaiting Reply', count: 5 },
  { icon: AlertCircle, label: 'Important', count: 8 },
  { icon: Star, label: 'Starred', count: 12 },
  { icon: Users, label: 'FYI', count: 4 },
  { icon: MessageSquare, label: 'Marketing', count: 7 },
  { icon: Zap, label: 'Promotions', count: 9 },
  { icon: Settings, label: 'Updates', count: 6 },
  { icon: Archive, label: 'Archive', count: 234 },
  { icon: Trash2, label: 'Trash', count: 12 },
];

const integrations = [
  { icon: MessageSquare, label: 'Slack', color: 'bg-purple-500', logo: '💬' },
  { icon: Send, label: 'Telegram', color: 'bg-blue-500', logo: '📨' },
  { icon: Users, label: 'Instagram', color: 'bg-pink-500', logo: '📷' },
  { icon: MessageSquare, label: 'Facebook', color: 'bg-blue-600', logo: '👥' },
  { icon: Mail, label: 'Outlook', color: 'bg-blue-700', logo: '📧' },
  { icon: Mail, label: 'Gmail', color: 'bg-red-500', logo: '✉️' },
  { icon: MessageSquare, label: 'WhatsApp', color: 'bg-green-500', logo: '💬' },
];

const emailsData = [
  {
    id: 1,
    sender: 'Sarah Johnson',
    email: 'sarah@company.com',
    subject: 'Q4 Budget Review Meeting',
    preview: 'Hi team, I wanted to schedule a review meeting for our Q4 budget planning. Can we...',
    time: '2m ago',
    unread: true,
    important: true,
    category: 'To Respond',
    categoryColor: 'bg-red-500',
    avatar: 'SJ',
    platform: 'Outlook',
    platformLogo: '📧',
    platformColor: 'bg-blue-700'
  },
  {
    id: 2,
    sender: 'Marcus Chen',
    email: 'marcus@designco.com',
    subject: 'New Design System Updates',
    preview: 'The latest updates to our design system are now available. Please review the new...',
    time: '15m ago',
    unread: true,
    important: false,
    category: 'FYI',
    categoryColor: 'bg-blue-500',
    avatar: 'MC',
    platform: 'Gmail',
    platformLogo: '✉️',
    platformColor: 'bg-red-500'
  },
  {
    id: 3,
    sender: 'LinkedIn',
    email: 'notifications@linkedin.com',
    subject: 'Your weekly summary is ready',
    preview: 'See who viewed your profile this week and discover new connections in your industry...',
    time: '1h ago',
    unread: false,
    important: false,
    category: 'Marketing',
    categoryColor: 'bg-purple-500',
    avatar: 'LI',
    platform: 'Gmail',
    platformLogo: '✉️',
    platformColor: 'bg-red-500'
  },
  {
    id: 4,
    sender: 'Alex Rivera',
    email: 'alex@startup.io',
    subject: 'Collaboration Opportunity',
    preview: 'I came across your work and would love to discuss a potential collaboration on...',
    time: '3h ago',
    unread: true,
    important: true,
    category: 'Important',
    categoryColor: 'bg-yellow-500',
    avatar: 'AR',
    platform: 'Outlook',
    platformLogo: '📧',
    platformColor: 'bg-blue-700'
  },
  {
    id: 5,
    sender: 'GitHub',
    email: 'noreply@github.com',
    subject: 'Pull request merged: feat/new-dashboard',
    preview: 'Your pull request has been successfully merged into the main branch. View the changes...',
    time: '5h ago',
    unread: false,
    important: false,
    category: 'Awaiting Reply',
    categoryColor: 'bg-orange-500',
    avatar: 'GH',
    platform: 'Slack',
    platformLogo: '💼',
    platformColor: 'bg-purple-500'
  },
  {
    id: 6,
    sender: 'Amazon',
    email: 'shipment-tracking@amazon.com',
    subject: 'Your package has been delivered',
    preview: 'Great news! Your recent order has been delivered to your address. You can track...',
    time: '2h ago',
    unread: true,
    important: false,
    category: 'Promotions',
    categoryColor: 'bg-green-500',
    avatar: 'AM',
    platform: 'WhatsApp',
    platformLogo: '💬',
    platformColor: 'bg-green-500'
  },
  {
    id: 7,
    sender: 'Notion',
    email: 'updates@notion.so',
    subject: 'New features in Notion AI',
    preview: 'Discover the latest AI-powered features that will supercharge your productivity...',
    time: '4h ago',
    unread: true,
    important: false,
    category: 'Updates',
    categoryColor: 'bg-indigo-500',
    avatar: 'NO',
    platform: 'Telegram',
    platformLogo: '📨',
    platformColor: 'bg-blue-500'
  },
  {
    id: 8,
    sender: 'Jessica Wong',
    email: 'jessica@company.com',
    subject: 'Re: Project timeline discussion',
    preview: 'Thanks for the detailed breakdown. I have a few questions about the milestones...',
    time: '6h ago',
    unread: false,
    important: false,
    category: 'FYI',
    categoryColor: 'bg-blue-500',
    avatar: 'JW',
    platform: 'Outlook',
    platformLogo: '📧',
    platformColor: 'bg-blue-700'
  },
  {
    id: 9,
    sender: 'Stripe',
    email: 'notifications@stripe.com',
    subject: 'Payment received for Invoice #1234',
    preview: 'We received a payment of $2,500.00 for invoice #1234. The payment has been...',
    time: '8h ago',
    unread: false,
    important: true,
    category: 'Important',
    categoryColor: 'bg-yellow-500',
    avatar: 'ST',
    platform: 'Gmail',
    platformLogo: '✉️',
    platformColor: 'bg-red-500'
  },
  {
    id: 10,
    sender: 'Netflix',
    email: 'info@netflix.com',
    subject: 'New releases this week',
    preview: 'Check out the latest movies and TV shows added to Netflix this week...',
    time: '1d ago',
    unread: false,
    important: false,
    category: 'Marketing',
    categoryColor: 'bg-purple-500',
    avatar: 'NF',
    platform: 'Instagram',
    platformLogo: '📷',
    platformColor: 'bg-pink-500'
  },
  {
    id: 11,
    sender: 'David Kim',
    email: 'david@clientcompany.com',
    subject: 'Urgent: Contract review needed',
    preview: 'Hi, we need to review the contract terms before tomorrow\'s meeting. Can you...',
    time: '30m ago',
    unread: true,
    important: true,
    category: 'To Respond',
    categoryColor: 'bg-red-500',
    avatar: 'DK'
  },
  {
    id: 12,
    sender: 'Slack',
    email: 'notifications@slack.com',
    subject: 'Weekly activity summary',
    preview: 'Here\'s your team\'s activity summary for this week in the Development workspace...',
    time: '1d ago',
    unread: false,
    important: false,
    category: 'Updates',
    categoryColor: 'bg-indigo-500',
    avatar: 'SL'
  }
];

const selectedEmail = {
  sender: 'Sarah Johnson',
  email: 'sarah@company.com',
  subject: 'Q4 Budget Review Meeting',
  time: '2 minutes ago',
  content: `Hi team,

I wanted to schedule a review meeting for our Q4 budget planning. Can we find a time that works for everyone next week?

I've prepared the preliminary budget analysis and would like to go through the following items:

• Revenue projections for Q4
• Department spending allocations
• New project funding requests
• Cost optimization opportunities

Please let me know your availability for Tuesday, Wednesday, or Thursday afternoon.

Best regards,
Sarah`,
  avatar: 'SJ'
};

export default function Index() {
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('Inbox');
  const [showCompose, setShowCompose] = useState(false);
  const [replyTo, setReplyTo] = useState<string>('');
  const [replySubject, setReplySubject] = useState<string>('');
  const [selectedEmailId, setSelectedEmailId] = useState<number>(1);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('All');
  const [showDexterAI, setShowDexterAI] = useState(false);

  // Filter emails based on selected category
  const getFilteredEmails = () => {
    switch (selectedSidebarItem) {
      case 'Inbox':
        return emailsData;
      case 'Sent':
        return []; // Would fetch sent emails from API
      case 'Starred':
        return emailsData.filter(email => email.important);
      case 'Archive':
        return []; // Would fetch archived emails from API
      case 'Trash':
        return []; // Would fetch deleted emails from API
      case 'To Respond':
        return emailsData.filter(email => email.category === 'To Respond');
      case 'Awaiting Reply':
        return emailsData.filter(email => email.category === 'Awaiting Reply');
      case 'Important':
        return emailsData.filter(email => email.category === 'Important');
      case 'FYI':
        return emailsData.filter(email => email.category === 'FYI');
      case 'Marketing':
        return emailsData.filter(email => email.category === 'Marketing');
      case 'Promotions':
        return emailsData.filter(email => email.category === 'Promotions');
      case 'Updates':
        return emailsData.filter(email => email.category === 'Updates');
      default:
        return emailsData.filter(email => email.category === selectedSidebarItem);
    }
  };

  const filteredEmails = getFilteredEmails();
  const selectedEmail = emailsData.find(email => email.id === selectedEmailId) || emailsData[0];

  const handleReply = () => {
    setReplyTo(selectedEmail.email);
    setReplySubject(`Re: ${selectedEmail.subject}`);
    setShowCompose(true);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Dexter</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search emails, contacts, or commands..."
              className="pl-10 w-96"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowCompose(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <PenTool className="w-4 h-4 mr-2" />
            Compose
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings">
              <Settings className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
            <div className="h-full border-r border-border">
              <div className="p-4">
                <div className="space-y-1">
                  {sidebarItems.map((item) => (
                    <Button
                      key={item.label}
                      variant={selectedSidebarItem === item.label ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedSidebarItem(item.label)}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.count > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.count}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-2">Integrations</h3>
                  {integrations.map((integration) => (
                    <Button
                      key={integration.label}
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link to={`/integrations/${integration.label.toLowerCase().replace(' ', '-')}`}>
                        <span className="mr-3 text-sm">{integration.logo}</span>
                        {integration.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Email List */}
          <ResizablePanel defaultSize={35} minSize={30} maxSize={50}>
            <div className="h-full border-r border-border">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">{selectedSidebarItem}</h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">•</span>
                      <select
                        value={selectedIntegration}
                        onChange={(e) => setSelectedIntegration(e.target.value)}
                        className="text-sm bg-transparent border-none focus:outline-none text-muted-foreground"
                      >
                        <option value="All">All Platforms</option>
                        {integrations.map((integration) => (
                          <option key={integration.label} value={integration.label}>
                            {integration.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-80px)]">
                <div className="divide-y divide-border">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={cn(
                        "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                        email.unread && "bg-muted/30",
                        selectedEmailId === email.id && "bg-accent/30 border-l-2 border-primary"
                      )}
                      onClick={() => setSelectedEmailId(email.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {email.avatar}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className={cn(
                                "text-sm",
                                email.unread ? "font-semibold" : "font-normal"
                              )}>
                                {email.sender}
                              </span>
                              {email.important && (
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {email.time}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge
                              variant="secondary"
                              className={cn("text-xs text-white", email.categoryColor)}
                            >
                              {email.category}
                            </Badge>
                            {(email as any).platform && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                <span className="mr-1">{(email as any).platformLogo}</span>
                                {(email as any).platform}
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className={cn(
                            "text-sm mb-1 truncate",
                            email.unread ? "font-medium" : "font-normal"
                          )}>
                            {email.subject}
                          </h3>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {email.preview}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Message Content */}
          <ResizablePanel defaultSize={45}>
            <MessageView message={selectedEmail} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <ComposeModal
        open={showCompose}
        onClose={() => {
          setShowCompose(false);
          setReplyTo('');
          setReplySubject('');
        }}
        replyTo={replyTo}
        subject={replySubject}
      />

      <DexterAI
        open={showDexterAI}
        onClose={() => setShowDexterAI(false)}
      />

      {/* Dexter AI Floating Button */}
      <Button
        onClick={() => setShowDexterAI(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg z-50"
        size="icon"
      >
        <div className="text-xl">🤖</div>
      </Button>
    </div>
  );
}
