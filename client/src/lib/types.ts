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

/**
 * The data-access contract shared by both backends:
 * - the remote REST client (used on the web), and
 * - the on-device local store (used inside the native Android app).
 */
export interface ApiClient {
  listTasks(localDate: string): Promise<Task[]>;
  createTask(title: string, localDate: string): Promise<Task>;
  updateTask(id: string, data: { title?: string; completed?: boolean }): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  getLogbook(): Promise<Logbook>;
}
