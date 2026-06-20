import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { formatDayLabel } from "../lib/date";
import type { Logbook } from "../lib/types";

export function LogbookPanel() {
  const [data, setData] = useState<Logbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .getLogbook()
      .then((d) => active && setData(d))
      .catch((e) => active && setError((e as Error).message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="panel mt-4 p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-white/80">Logbook</h2>
          <span className="text-xs text-white/30">history, read-only</span>
        </div>

        {loading && <p className="mt-4 text-sm text-white/35">Loading history...</p>}
        {error && <p className="mt-4 text-sm text-red-400/80">{error}</p>}

        {data && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat label="Active days" value={data.summary.activeDays} />
              <Stat label="Completed" value={data.summary.totalCompleted} />
              <Stat
                label="Completion"
                value={`${data.summary.overallCompletionRate}%`}
              />
            </div>

            <div className="mt-5 space-y-1.5">
              {data.days.length === 0 && (
                <p className="text-sm text-white/35">
                  No history yet. Completed and past days will appear here.
                </p>
              )}
              {data.days.map((day) => (
                <div
                  key={day.localDate}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-ink-hover"
                >
                  <span className="w-28 shrink-0 text-white/60">
                    {formatDayLabel(day.localDate)}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${day.completionRate}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-white/40">
                    {day.completed}/{day.total}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-ink px-3 py-3 ring-1 ring-white/5">
      <div className="text-lg font-semibold text-white/90">{value}</div>
      <div className="mt-0.5 text-xs text-white/40">{label}</div>
    </div>
  );
}
