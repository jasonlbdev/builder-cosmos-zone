import { useState } from 'react';
import { X, Send, Paperclip, Smile, Bold, Italic, Underline, Link, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  replyTo?: string;
  subject?: string;
  platform?: string;
  platformLogo?: string;
}

export function ComposeModal({ open, onClose, replyTo, subject, platform = 'Email', platformLogo = '📧' }: ComposeModalProps) {
  const [to, setTo] = useState(replyTo || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [emailSubject, setEmailSubject] = useState(subject || '');
  const [content, setContent] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const isEmailPlatform = ['Email', 'Outlook', 'Gmail'].includes(platform);
  const isMessagingPlatform = ['WhatsApp', 'Slack', 'Telegram', 'Instagram', 'Facebook'].includes(platform);

  const getPlaceholderText = () => {
    switch (platform) {
      case 'WhatsApp':
        return 'Type a message...';
      case 'Slack':
        return 'Message #channel or @person...';
      case 'Telegram':
        return 'Write a message...';
      case 'Instagram':
      case 'Facebook':
        return 'Write a message...';
      default:
        return 'Compose your email...';
    }
  };

  const getModalTitle = () => {
    if (subject) return `Reply - ${platform}`;
    return `New ${isEmailPlatform ? 'Email' : 'Message'} - ${platform}`;
  };

  const handleSend = async () => {
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: to.split(',').map(email => email.trim()),
          cc: cc ? cc.split(',').map(email => email.trim()) : undefined,
          bcc: bcc ? bcc.split(',').map(email => email.trim()) : undefined,
          subject: emailSubject,
          content: content,
        }),
      });

      if (response.ok) {
        onClose();
        // Reset form
        setTo('');
        setCc('');
        setBcc('');
        setEmailSubject('');
        setContent('');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const generateAIContent = async () => {
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'reply',
          context: { to, subject: emailSubject }
        }),
      });

      const data = await response.json();
      if (data.suggestion) {
        setContent(data.suggestion);
      }
    } catch (error) {
      console.error('Failed to generate AI content:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>New Message</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-full max-h-[70vh]">
          <div className="p-6 space-y-4">
            {/* Recipients */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="to" className="text-sm font-medium min-w-0 w-8">
                  To:
                </Label>
                <Input
                  id="to"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Enter email addresses..."
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCc(!showCc)}
                  className="text-xs"
                >
                  Cc
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBcc(!showBcc)}
                  className="text-xs"
                >
                  Bcc
                </Button>
              </div>

              {showCc && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="cc" className="text-sm font-medium min-w-0 w-8">
                    Cc:
                  </Label>
                  <Input
                    id="cc"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="Enter CC email addresses..."
                    className="flex-1"
                  />
                </div>
              )}

              {showBcc && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="bcc" className="text-sm font-medium min-w-0 w-8">
                    Bcc:
                  </Label>
                  <Input
                    id="bcc"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    placeholder="Enter BCC email addresses..."
                    className="flex-1"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Label htmlFor="subject" className="text-sm font-medium min-w-0 w-8">
                  Subject:
                </Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter subject..."
                  className="flex-1"
                />
              </div>
            </div>

            <Separator />

            {/* Formatting Toolbar */}
            <div className="flex items-center space-x-2 py-2">
              <Button variant="ghost" size="sm">
                <Bold className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Italic className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Underline className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Link className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="ghost" size="sm">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Smile className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={generateAIContent}
                className="text-primary"
              >
                <Zap className="w-4 h-4 mr-1" />
                AI Draft
              </Button>
            </div>

            <Separator />
          </div>

          {/* Content */}
          <div className="flex-1 px-6">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Compose your message..."
              className="min-h-[300px] resize-none border-0 focus:ring-0 text-sm leading-relaxed"
            />
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="px-6 py-3 bg-muted/30 border-t">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => setContent(content + ' ' + suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  Save Draft
                </Button>
                <Button variant="outline" size="sm">
                  Schedule Send
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSend}
                  disabled={!to || !emailSubject || !content}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ComposeModal;
