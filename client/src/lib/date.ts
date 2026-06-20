/**
 * Returns the user's current local calendar day as YYYY-MM-DD.
 *
 * This is the heart of the "midnight reset": the value is computed from the
 * browser's own clock/timezone, so when the local day flips the app simply
 * asks the API for a different `localDate` and gets a fresh, empty slate -
 * no server-side cron job and no timezone math on the backend.
 */
export function getLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Milliseconds from now until the next local midnight. */
export function msUntilNextLocalMidnight(now: Date = new Date()): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

/** Human-friendly label, e.g. "Mon, Jun 16". */
export function formatDayLabel(localDate: string): string {
  const [y, m, d] = localDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
