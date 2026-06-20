import type { ApiClient, Logbook, Task } from "./types";

const STORAGE_KEY = "gettoit:tasks";
const LOCAL_USER_ID = "default-user";

/**
 * Fully client-side data store backed by the WebView's localStorage.
 *
 * This is what powers the standalone Android app: there is no server, no
 * network, and no PostgreSQL - the device persists everything locally, so the
 * app works offline on any phone. It implements the exact same `ApiClient`
 * contract as the REST client, so the UI and store code are identical.
 */

function readAll(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

function writeAll(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function delay<T>(value: T): Promise<T> {
  // Tiny async hop so behavior matches the network client (keeps optimistic UI honest).
  return new Promise((resolve) => setTimeout(() => resolve(value), 0));
}

export const localApi: ApiClient = {
  listTasks: (localDate) => {
    const tasks = readAll()
      .filter((t) => t.localDate === localDate)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
    return delay(tasks);
  },

  createTask: (title, localDate) => {
    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      userId: LOCAL_USER_ID,
      title,
      completed: false,
      localDate,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };
    const tasks = readAll();
    tasks.push(task);
    writeAll(tasks);
    return delay(task);
  },

  updateTask: (id, data) => {
    const tasks = readAll();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return Promise.reject(new Error("Task not found"));

    const current = tasks[idx];
    const completed = data.completed ?? current.completed;
    const updated: Task = {
      ...current,
      ...(data.title !== undefined ? { title: data.title } : {}),
      completed,
      completedAt: completed
        ? (current.completedAt ?? new Date().toISOString())
        : null,
      updatedAt: new Date().toISOString(),
    };
    tasks[idx] = updated;
    writeAll(tasks);
    return delay(updated);
  },

  deleteTask: (id) => {
    writeAll(readAll().filter((t) => t.id !== id));
    return delay(undefined);
  },

  getLogbook: () => {
    const tasks = readAll();
    const byDate = new Map<string, { total: number; completed: number }>();
    for (const t of tasks) {
      const entry = byDate.get(t.localDate) ?? { total: 0, completed: 0 };
      entry.total += 1;
      if (t.completed) entry.completed += 1;
      byDate.set(t.localDate, entry);
    }

    const days = [...byDate.entries()]
      .map(([localDate, { total, completed }]) => ({
        localDate,
        total,
        completed,
        completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
      }))
      .sort((a, b) => (a.localDate < b.localDate ? 1 : -1));

    const totals = days.reduce(
      (acc, d) => ({ total: acc.total + d.total, completed: acc.completed + d.completed }),
      { total: 0, completed: 0 },
    );

    const logbook: Logbook = {
      days,
      summary: {
        activeDays: days.length,
        totalTasks: totals.total,
        totalCompleted: totals.completed,
        overallCompletionRate:
          totals.total === 0 ? 0 : Math.round((totals.completed / totals.total) * 100),
      },
    };
    return delay(logbook);
  },
};
