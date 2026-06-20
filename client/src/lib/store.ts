import { create } from "zustand";
import { api } from "./api";
import type { Task } from "./types";

interface TaskState {
  tasks: Task[];
  localDate: string;
  loading: boolean;
  error: string | null;

  setLocalDate: (localDate: string) => void;
  loadTasks: (localDate: string) => Promise<void>;
  addTask: (title: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  clearError: () => void;
}

/** Creates a placeholder task so the UI can render before the server responds. */
function makeOptimisticTask(title: string, localDate: string): Task {
  const now = new Date().toISOString();
  return {
    id: `temp-${crypto.randomUUID()}`,
    userId: "default-user",
    title,
    completed: false,
    localDate,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  localDate: "",
  loading: false,
  error: null,

  setLocalDate: (localDate) => set({ localDate }),

  clearError: () => set({ error: null }),

  loadTasks: async (localDate) => {
    set({ loading: true, error: null, localDate });
    try {
      const tasks = await api.listTasks(localDate);
      // Guard against a day-rollover race: ignore stale responses.
      if (get().localDate === localDate) {
        set({ tasks, loading: false });
      }
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  // Optimistic create: show immediately, reconcile the real row, roll back on error.
  addTask: async (title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const { localDate } = get();
    const optimistic = makeOptimisticTask(trimmed, localDate);
    set((s) => ({ tasks: [...s.tasks, optimistic], error: null }));

    try {
      const saved = await api.createTask(trimmed, localDate);
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === optimistic.id ? saved : t)),
      }));
    } catch (err) {
      set((s) => ({
        tasks: s.tasks.filter((t) => t.id !== optimistic.id),
        error: (err as Error).message,
      }));
    }
  },

  // Optimistic toggle: flip locally, roll back the single task if the call fails.
  toggleTask: async (id) => {
    const current = get().tasks.find((t) => t.id === id);
    if (!current || id.startsWith("temp-")) return;
    const nextCompleted = !current.completed;

    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id
          ? { ...t, completed: nextCompleted, completedAt: nextCompleted ? new Date().toISOString() : null }
          : t,
      ),
      error: null,
    }));

    try {
      const saved = await api.updateTask(id, { completed: nextCompleted });
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? saved : t)) }));
    } catch (err) {
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? current : t)),
        error: (err as Error).message,
      }));
    }
  },

  // Optimistic delete: remove locally, restore in place if the call fails.
  removeTask: async (id) => {
    if (id.startsWith("temp-")) return;
    const snapshot = get().tasks;
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id), error: null }));

    try {
      await api.deleteTask(id);
    } catch (err) {
      set({ tasks: snapshot, error: (err as Error).message });
    }
  },
}));
