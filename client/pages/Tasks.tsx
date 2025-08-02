import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Calendar,
  Clock,
  User,
  Mail,
  Filter,
  Search,
  MoreHorizontal,
  Flag,
  CheckCircle2,
  Circle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: Date;
  tags: string[];
  emailContext?: {
    messageId: string;
    sender: string;
    subject: string;
    platform: string;
    platformLogo: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review Q4 budget proposals',
    description: 'Review budget allocations, revenue projections, department spending, and new project funding requests.',
    status: 'todo',
    priority: 'high',
    assignee: 'you@company.com',
    dueDate: new Date(2024, 11, 22),
    tags: ['finance', 'quarterly'],
    emailContext: {
      messageId: '1',
      sender: 'Sarah Johnson',
      subject: 'Q4 Budget Review Meeting',
      platform: 'Outlook',
      platformLogo: '📧'
    },
    createdAt: new Date(2024, 11, 18),
    updatedAt: new Date(2024, 11, 18)
  },
  {
    id: '2',
    title: 'Prepare project timeline discussion',
    description: 'Review milestones and prepare talking points for the project timeline meeting.',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'you@company.com',
    dueDate: new Date(2024, 11, 20),
    tags: ['project', 'planning'],
    emailContext: {
      messageId: '8',
      sender: 'Jessica Wong',
      subject: 'Re: Project timeline discussion',
      platform: 'Outlook',
      platformLogo: '📧'
    },
    createdAt: new Date(2024, 11, 17),
    updatedAt: new Date(2024, 11, 19)
  },
  {
    id: '3',
    title: 'Test new dashboard features',
    description: 'Validate all functionality and test edge cases for the new dashboard implementation.',
    status: 'completed',
    priority: 'medium',
    assignee: 'you@company.com',
    dueDate: new Date(2024, 11, 15),
    tags: ['development', 'testing'],
    emailContext: {
      messageId: '5',
      sender: 'GitHub',
      subject: 'Pull request merged: feat/new-dashboard',
      platform: 'Slack',
      platformLogo: '💼'
    },
    createdAt: new Date(2024, 11, 10),
    updatedAt: new Date(2024, 11, 15)
  },
  {
    id: '4',
    title: 'Follow up on collaboration opportunity',
    description: 'Reach out to Alex Rivera regarding the collaboration proposal discussed.',
    status: 'todo',
    priority: 'urgent',
    assignee: 'you@company.com',
    dueDate: new Date(2024, 11, 21),
    tags: ['business', 'partnership'],
    emailContext: {
      messageId: '4',
      sender: 'Alex Rivera',
      subject: 'Collaboration Opportunity',
      platform: 'Outlook',
      platformLogo: '📧'
    },
    createdAt: new Date(2024, 11, 19),
    updatedAt: new Date(2024, 11, 19)
  }
];

export default function Tasks() {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [newTaskDialog, setNewTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Handle email context from URL parameters
  useEffect(() => {
    const emailContext = searchParams.get('from-email');
    const messageId = searchParams.get('messageId');
    const sender = searchParams.get('sender');
    const subject = searchParams.get('subject');
    const platform = searchParams.get('platform');
    const platformLogo = searchParams.get('platformLogo');

    if (emailContext && messageId && sender && subject) {
      setNewTaskDialog(true);
      // Pre-populate task with email context
    }
  }, [searchParams]);

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-50 border-red-200';
      case 'high': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-3 h-3" />;
      case 'high': return <Flag className="w-3 h-3" />;
      default: return <Flag className="w-3 h-3" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const isOverdue = (dueDate: Date | undefined) => {
    if (!dueDate) return false;
    return dueDate < new Date() && dueDate.toDateString() !== new Date().toDateString();
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'todo' : 
                         task.status === 'todo' ? 'in-progress' : 'completed';
        return { ...task, status: newStatus, updatedAt: new Date() };
      }
      return task;
    }));
  };

  const getTaskStats = () => {
    const stats = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: tasks.length,
      todo: stats.todo || 0,
      inProgress: stats['in-progress'] || 0,
      completed: stats.completed || 0,
      overdue: tasks.filter(task => task.dueDate && isOverdue(task.dueDate)).length
    };
  };

  const stats = getTaskStats();

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">
              Manage your tasks and track progress
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={newTaskDialog} onOpenChange={setNewTaskDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <NewTaskForm 
                  onClose={() => setNewTaskDialog(false)}
                  emailContext={searchParams.get('from-email') ? {
                    messageId: searchParams.get('messageId') || '',
                    sender: searchParams.get('sender') || '',
                    subject: searchParams.get('subject') || '',
                    platform: searchParams.get('platform') || '',
                    platformLogo: searchParams.get('platformLogo') || '📧'
                  } : undefined}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto h-full">
          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Circle className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">To Do</p>
                    <p className="text-2xl font-bold text-blue-500">{stats.todo}</p>
                  </div>
                  <Circle className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-500">{stats.inProgress}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-2xl font-bold text-red-500">{stats.overdue}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <Card 
                key={task.id} 
                className={cn(
                  "cursor-pointer hover:shadow-md transition-shadow",
                  task.status === 'completed' && "opacity-75"
                )}
                onClick={() => setSelectedTask(task)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task.id);
                      }}
                      className="mt-1"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className={cn(
                            "font-medium text-sm",
                            task.status === 'completed' && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getPriorityColor(task.priority))}
                          >
                            {getPriorityIcon(task.priority)}
                            <span className="ml-1 capitalize">{task.priority}</span>
                          </Badge>
                          
                          {task.dueDate && (
                            <Badge 
                              variant={isOverdue(task.dueDate) ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(task.dueDate)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {task.emailContext && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <span className="text-sm">{task.emailContext.platformLogo}</span>
                              <span>From: {task.emailContext.sender}</span>
                            </div>
                          )}
                          
                          {task.tags.length > 0 && (
                            <div className="flex space-x-1">
                              {task.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {task.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{task.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {task.assignee && (
                          <div className="flex items-center space-x-1">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">
                                {task.assignee.split('@')[0].charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredTasks.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms' : 'Create your first task to get started'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Task Details Dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {getStatusIcon(selectedTask.status)}
                <span>{selectedTask.title}</span>
              </DialogTitle>
            </DialogHeader>
            <TaskDetailsView task={selectedTask} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function NewTaskForm({ 
  onClose, 
  emailContext 
}: { 
  onClose: () => void;
  emailContext?: {
    messageId: string;
    sender: string;
    subject: string;
    platform: string;
    platformLogo: string;
  };
}) {
  const [title, setTitle] = useState(emailContext ? `Follow up: ${emailContext.subject}` : '');
  const [description, setDescription] = useState(emailContext ? `Task created from email by ${emailContext.sender}` : '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would create the task via API
    console.log('Creating task:', {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      emailContext
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {emailContext && (
        <div className="p-3 bg-accent rounded-md">
          <div className="flex items-center space-x-2 text-sm">
            <MessageSquare className="w-4 h-4" />
            <span>Creating task from email:</span>
            <Badge variant="outline">{emailContext.platform}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            From: {emailContext.sender} - {emailContext.subject}
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title..."
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="due-date">Due Date</Label>
          <Input
            id="due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Enter tags separated by commas..."
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create Task
        </Button>
      </div>
    </form>
  );
}

function TaskDetailsView({ task }: { task: Task }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-muted-foreground">Description</Label>
        <p className="mt-1">{task.description || 'No description provided'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground">Status</Label>
          <div className="flex items-center space-x-2 mt-1">
            {getStatusIcon(task.status)}
            <span className="capitalize">{task.status.replace('-', ' ')}</span>
          </div>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Priority</Label>
          <div className="flex items-center space-x-2 mt-1">
            <Flag className="w-4 h-4" />
            <span className="capitalize">{task.priority}</span>
          </div>
        </div>
      </div>

      {task.dueDate && (
        <div>
          <Label className="text-sm text-muted-foreground">Due Date</Label>
          <div className="flex items-center space-x-2 mt-1">
            <Calendar className="w-4 h-4" />
            <span>{task.dueDate.toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {task.tags.length > 0 && (
        <div>
          <Label className="text-sm text-muted-foreground">Tags</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {task.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {task.emailContext && (
        <div>
          <Label className="text-sm text-muted-foreground">Related Email</Label>
          <div className="flex items-center space-x-2 mt-1 p-2 bg-accent rounded">
            <span className="text-sm">{task.emailContext.platformLogo}</span>
            <span className="text-sm">{task.emailContext.subject}</span>
            <Badge variant="outline" className="text-xs">
              {task.emailContext.platform}
            </Badge>
          </div>
        </div>
      )}

      <div className="flex space-x-2 pt-4">
        <Button size="sm">
          Edit Task
        </Button>
        <Button size="sm" variant="outline">
          Add Comment
        </Button>
        <Button size="sm" variant="outline">
          Share Task
        </Button>
      </div>
    </div>
  );

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  }
}
