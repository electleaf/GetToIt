import { AnimatePresence, motion } from "framer-motion";
import type { Task } from "../lib/types";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TaskList({ tasks, loading, onToggle, onRemove }: TaskListProps) {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[50px] animate-pulse rounded-xl bg-ink-raised ring-1 ring-white/5"
          />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-14 text-center"
      >
        <p className="text-[15px] font-medium text-white/70">A clean slate</p>
        <p className="mt-1 text-sm text-white/35">
          Add the first thing you want to get to today.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.ul layout className="space-y-2.5">
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
