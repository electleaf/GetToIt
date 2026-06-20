export interface Task {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  localDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface LogbookDay {
  localDate: string;
  total: number;
  completed: number;
  completionRate: number;
}

export interface LogbookSummary {
  activeDays: number;
  totalTasks: number;
  totalCompleted: number;
  overallCompletionRate: number;
}

export interface Logbook {
  days: LogbookDay[];
  summary: LogbookSummary;
}
