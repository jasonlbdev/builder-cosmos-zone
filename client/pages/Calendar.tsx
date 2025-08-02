import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Video,
  Phone,
  Mail,
  Settings,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location?: string;
  type: 'meeting' | 'call' | 'event';
  status: 'confirmed' | 'tentative' | 'cancelled';
  emailContext?: {
    messageId: string;
    sender: string;
    subject: string;
    platform: string;
  };
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Q4 Budget Review Meeting',
    description: 'Review budget allocations and revenue projections for Q4',
    startTime: new Date(2024, 11, 20, 14, 0),
    endTime: new Date(2024, 11, 20, 15, 30),
    attendees: ['sarah@company.com', 'john@company.com', 'you@company.com'],
    location: 'Conference Room A',
    type: 'meeting',
    status: 'confirmed',
    emailContext: {
      messageId: '1',
      sender: 'Sarah Johnson',
      subject: 'Q4 Budget Review Meeting',
      platform: 'Outlook'
    }
  },
  {
    id: '2',
    title: 'Project Sync Call',
    description: 'Weekly project synchronization with the development team',
    startTime: new Date(2024, 11, 22, 10, 0),
    endTime: new Date(2024, 11, 22, 11, 0),
    attendees: ['dev-team@company.com', 'you@company.com'],
    type: 'call',
    status: 'confirmed'
  },
  {
    id: '3',
    title: 'Client Presentation',
    description: 'Present project milestone updates to the client',
    startTime: new Date(2024, 11, 25, 16, 0),
    endTime: new Date(2024, 11, 25, 17, 0),
    attendees: ['client@external.com', 'you@company.com'],
    location: 'Zoom Meeting',
    type: 'meeting',
    status: 'tentative'
  }
];

export default function Calendar() {
  const [searchParams] = useSearchParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newEventDialog, setNewEventDialog] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  // Handle email context from URL parameters
  useEffect(() => {
    const emailContext = searchParams.get('from-email');
    const messageId = searchParams.get('messageId');
    const sender = searchParams.get('sender');
    const subject = searchParams.get('subject');
    const platform = searchParams.get('platform');

    if (emailContext && messageId && sender && subject) {
      setNewEventDialog(true);
      // Pre-populate event with email context
    }
  }, [searchParams]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'meeting': return <Video className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'tentative': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">
              Manage your meetings and events
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={view} onValueChange={(value: 'month' | 'week' | 'day') => setView(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <Dialog open={newEventDialog} onOpenChange={setNewEventDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <NewEventForm 
                  onClose={() => setNewEventDialog(false)}
                  emailContext={searchParams.get('from-email') ? {
                    messageId: searchParams.get('messageId') || '',
                    sender: searchParams.get('sender') || '',
                    subject: searchParams.get('subject') || '',
                    platform: searchParams.get('platform') || ''
                  } : undefined}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto h-full">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 flex-1">
            {getDaysInMonth(currentDate).map((date, index) => (
              <div
                key={index}
                className={cn(
                  "min-h-[120px] border border-border p-2 bg-card hover:bg-accent/50 transition-colors",
                  date && date.toDateString() === new Date().toDateString() && "bg-primary/5 border-primary"
                )}
              >
                {date && (
                  <>
                    <div className="font-medium text-sm mb-2">{date.getDate()}</div>
                    <div className="space-y-1">
                      {getEventsForDate(date).slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: `hsl(var(--primary))` }}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-center space-x-1 text-primary-foreground">
                            {getEventTypeIcon(event.type)}
                            <span className="truncate">{event.title}</span>
                          </div>
                          <div className="text-primary-foreground/80">
                            {formatTime(event.startTime)}
                          </div>
                        </div>
                      ))}
                      {getEventsForDate(date).length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{getEventsForDate(date).length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {getEventTypeIcon(selectedEvent.type)}
                <span>{selectedEvent.title}</span>
                <div className={cn("w-2 h-2 rounded-full", getStatusColor(selectedEvent.status))} />
              </DialogTitle>
            </DialogHeader>
            <EventDetailsView event={selectedEvent} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function NewEventForm({ 
  onClose, 
  emailContext 
}: { 
  onClose: () => void;
  emailContext?: {
    messageId: string;
    sender: string;
    subject: string;
    platform: string;
  };
}) {
  const [title, setTitle] = useState(emailContext ? `Meeting: ${emailContext.subject}` : '');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [attendees, setAttendees] = useState(emailContext ? emailContext.sender : '');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would create the event via API
    console.log('Creating event:', {
      title,
      description,
      startDate,
      startTime,
      endTime,
      attendees: attendees.split(',').map(email => email.trim()),
      location,
      emailContext
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {emailContext && (
        <div className="p-3 bg-accent rounded-md">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="w-4 h-4" />
            <span>Creating event from email:</span>
            <Badge variant="outline">{emailContext.platform}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            From: {emailContext.sender} - {emailContext.subject}
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="title">Event Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter event title..."
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter event description..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="start-time">Start Time</Label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="end-time">End Time</Label>
          <Input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="attendees">Attendees</Label>
        <Input
          id="attendees"
          value={attendees}
          onChange={(e) => setAttendees(e.target.value)}
          placeholder="Enter email addresses, separated by commas..."
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location or meeting link..."
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create Event
        </Button>
      </div>
    </form>
  );
}

function EventDetailsView({ event }: { event: CalendarEvent }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-muted-foreground">Description</Label>
        <p className="mt-1">{event.description || 'No description provided'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground">Start Time</Label>
          <div className="flex items-center space-x-2 mt-1">
            <Clock className="w-4 h-4" />
            <span>{event.startTime.toLocaleString()}</span>
          </div>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">End Time</Label>
          <div className="flex items-center space-x-2 mt-1">
            <Clock className="w-4 h-4" />
            <span>{event.endTime.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {event.location && (
        <div>
          <Label className="text-sm text-muted-foreground">Location</Label>
          <div className="flex items-center space-x-2 mt-1">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
        </div>
      )}

      <div>
        <Label className="text-sm text-muted-foreground">Attendees</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {event.attendees.map((attendee, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs">
                  {attendee.split('@')[0].charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{attendee}</span>
            </div>
          ))}
        </div>
      </div>

      {event.emailContext && (
        <div>
          <Label className="text-sm text-muted-foreground">Related Email</Label>
          <div className="flex items-center space-x-2 mt-1 p-2 bg-accent rounded">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{event.emailContext.subject}</span>
            <Badge variant="outline" className="text-xs">
              {event.emailContext.platform}
            </Badge>
          </div>
        </div>
      )}

      <div className="flex space-x-2 pt-4">
        <Button size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Edit Event
        </Button>
        <Button size="sm" variant="outline">
          Join Meeting
        </Button>
        <Button size="sm" variant="outline">
          Send Update
        </Button>
      </div>
    </div>
  );
}
