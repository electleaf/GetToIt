import { motion } from "framer-motion";
import type { Task } from "../lib/types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TaskItem({ task, onToggle, onRemove }: TaskItemProps) {
  const pending = task.id.startsWith("temp-");

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: pending ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className="group flex items-center gap-3 rounded-xl bg-ink-raised px-4 py-3 ring-1 ring-white/5 transition-colors hover:bg-ink-hover"
    >
      <button
        onClick={() => onToggle(task.id)}
        disabled={pending}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ring-1 transition-colors ${
          task.completed
            ? "bg-accent ring-accent"
            : "ring-white/15 hover:ring-white/40"
        }`}
      >
        {task.completed && (
          <motion.svg
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 6.5L5 9L9.5 3.5"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </button>

      <span
        className={`flex-1 text-[15px] transition-colors ${
          task.completed ? "text-white/30 line-through" : "text-white/90"
        }`}
      >
        {task.title}
      </span>

      <button
        onClick={() => onRemove(task.id)}
        disabled={pending}
        aria-label="Delete task"
        className="text-white/20 opacity-0 transition-opacity hover:text-white/70 group-hover:opacity-100"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </motion.li>
  );
}
