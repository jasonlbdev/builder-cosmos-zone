import { Task } from "./types";

export const mockTasks: Task[] = [
  {
    id: "task_1",
    title: "Review Q4 budget proposal",
    description: "Analyze the updated Q4 budget proposal and provide comprehensive feedback on resource allocation",
    status: "todo",
    priority: "high",
    assignee: "john.smith@company.com",
    assignees: ["john.smith@company.com", "sarah.johnson@techcorp.com"],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    tags: ["budget", "review", "q4", "urgent"],
    emailContext: {
      messageId: "1",
      sender: "sarah.johnson@techcorp.com",
      subject: "Q4 Budget Review Meeting",
      platform: "Gmail",
      platformLogo: "📧"
    },
    followUpConfig: {
      enabled: true,
      timeframe: 48, // 48 hours
      message: "Gentle reminder about the Q4 budget review. Please let me know if you need any additional information.",
      recipients: ["sarah.johnson@techcorp.com"]
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
  },
  {
    id: "task_2",
    title: "Finalize marketing campaign strategy",
    description: "Complete the marketing strategy document for the new product launch",
    status: "in-progress",
    priority: "medium",
    assignee: "marketing@startup.io",
    assignees: ["marketing@startup.io", "design@startup.io"],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    tags: ["marketing", "product-launch", "strategy"],
    emailContext: {
      messageId: "2",
      sender: "marketing@startup.io",
      subject: "New Product Launch Campaign",
      platform: "Gmail",
      platformLogo: "📧"
    },
    followUpConfig: {
      enabled: false,
      timeframe: 0,
      message: "",
      recipients: []
    },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
  },
  {
    id: "task_3",
    title: "Update security protocols",
    description: "Review and update company security protocols based on the GitHub security alert",
    status: "todo",
    priority: "urgent",
    assignee: "security@company.com",
    assignees: ["security@company.com", "it@company.com"],
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    tags: ["security", "protocols", "urgent", "github"],
    emailContext: {
      messageId: "5",
      sender: "noreply@github.com",
      subject: "Security alert: New sign-in from Chrome on Windows",
      platform: "Gmail",
      platformLogo: "📧"
    },
    followUpConfig: {
      enabled: true,
      timeframe: 24, // 24 hours
      message: "This is a critical security task. Please prioritize this immediately.",
      recipients: ["security@company.com"]
    },
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
  },
  {
    id: "task_4",
    title: "Plan team building event",
    description: "Organize a team building event for the development team",
    status: "completed",
    priority: "low",
    assignee: "hr@company.com",
    assignees: ["hr@company.com"],
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (completed)
    tags: ["team-building", "hr", "completed"],
    followUpConfig: {
      enabled: false,
      timeframe: 0,
      message: "",
      recipients: []
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    id: "task_5",
    title: "Prepare presentation slides",
    description: "Create presentation slides for the upcoming board meeting",
    status: "todo",
    priority: "medium",
    assignee: "ceo@company.com",
    assignees: ["ceo@company.com", "finance@company.com"],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    tags: ["presentation", "board-meeting", "slides"],
    followUpConfig: {
      enabled: true,
      timeframe: 168, // 1 week
      message: "Reminder: Board presentation slides due next week.",
      recipients: ["assistant@company.com"]
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  }
];

export const getTasksByStatus = (status: "todo" | "in-progress" | "completed") => {
  return mockTasks.filter(task => task.status === status);
};

export const getTasksByPriority = (priority: "low" | "medium" | "high" | "urgent") => {
  return mockTasks.filter(task => task.priority === priority);
};

export const getTasksWithEmailContext = () => {
  return mockTasks.filter(task => task.emailContext);
};

export const getOverdueTasks = () => {
  const now = new Date();
  return mockTasks.filter(task => 
    task.dueDate && 
    task.dueDate < now && 
    task.status !== "completed"
  );
};
