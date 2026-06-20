import { motion } from "framer-motion";
import { formatDayLabel } from "../lib/date";

interface HeaderProps {
  localDate: string;
  remaining: number;
  total: number;
  showLogbook: boolean;
  onToggleLogbook: () => void;
}

export function Header({
  localDate,
  remaining,
  total,
  showLogbook,
  onToggleLogbook,
}: HeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold tracking-tight"
        >
          GetToIt
        </motion.h1>
        <p className="mt-1 text-sm text-white/40">
          {localDate ? formatDayLabel(localDate) : "..."}
          {total > 0 && (
            <span className="ml-2 text-white/30">
              {remaining === 0 ? "all clear" : `${remaining} of ${total} left`}
            </span>
          )}
        </p>
      </div>

      <button
        onClick={onToggleLogbook}
        className="rounded-full px-3.5 py-1.5 text-xs font-medium text-white/60 ring-1 ring-white/10 transition-colors hover:bg-ink-hover hover:text-white/90"
      >
        {showLogbook ? "Hide Logbook" : "Logbook"}
      </button>
    </header>
  );
}
