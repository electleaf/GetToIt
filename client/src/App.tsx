import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { AddTaskForm } from "./components/AddTaskForm";
import { TaskList } from "./components/TaskList";
import { LogbookPanel } from "./components/LogbookPanel";
import { useTaskStore } from "./lib/store";
import { getLocalDate, msUntilNextLocalMidnight } from "./lib/date";

export default function App() {
  const {
    tasks,
    loading,
    error,
    localDate,
    loadTasks,
    addTask,
    toggleTask,
    removeTask,
    clearError,
  } = useTaskStore();
  const [showLogbook, setShowLogbook] = useState(false);

  // Initial load + automatic rollover to the next local day at midnight.
  useEffect(() => {
    loadTasks(getLocalDate());

    let timer: ReturnType<typeof setTimeout>;
    const scheduleMidnight = () => {
      timer = setTimeout(() => {
        loadTasks(getLocalDate());
        scheduleMidnight();
      }, msUntilNextLocalMidnight() + 500);
    };
    scheduleMidnight();

    // Also re-check when the tab regains focus (covers sleep/wake).
    const onFocus = () => {
      if (getLocalDate() !== useTaskStore.getState().localDate) {
        loadTasks(getLocalDate());
      }
    };
    window.addEventListener("focus", onFocus);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadTasks]);

  // Auto-dismiss errors after a few seconds.
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(clearError, 4000);
    return () => clearTimeout(t);
  }, [error, clearError]);

  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col px-5 py-12 sm:py-16">
      <Header
        localDate={localDate}
        remaining={remaining}
        total={tasks.length}
        showLogbook={showLogbook}
        onToggleLogbook={() => setShowLogbook((v) => !v)}
      />

      <div className="mt-8">
        <AddTaskForm onAdd={addTask} />
      </div>

      <div className="mt-5">
        <TaskList
          tasks={tasks}
          loading={loading}
          onToggle={toggleTask}
          onRemove={removeTask}
        />
      </div>

      <AnimatePresence>{showLogbook && <LogbookPanel />}</AnimatePresence>

      <AnimatePresence>
        {error && (
          <div className="fixed inset-x-0 bottom-6 mx-auto w-fit rounded-lg bg-red-500/90 px-4 py-2 text-sm text-white shadow-lg">
            {error}
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-auto pt-12 text-center text-xs text-white/20">
        Each local midnight, today&apos;s slate clears. Your history lives in the
        Logbook.
      </footer>
    </div>
  );
}
