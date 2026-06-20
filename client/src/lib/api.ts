import type { Logbook, Task } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  listTasks: (localDate: string) =>
    request<Task[]>(`/api/tasks?localDate=${encodeURIComponent(localDate)}`),

  createTask: (title: string, localDate: string) =>
    request<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title, localDate }),
    }),

  updateTask: (id: string, data: { title?: string; completed?: boolean }) =>
    request<Task>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteTask: (id: string) =>
    request<void>(`/api/tasks/${id}`, { method: "DELETE" }),

  getLogbook: () => request<Logbook>("/api/logbook"),
};
