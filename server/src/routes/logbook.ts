import { Router } from "express";
import { prisma } from "../prisma.js";
import { DEFAULT_USER_ID } from "../constants.js";

export const logbookRouter = Router();

/**
 * GET /api/logbook - read-only history grouped by local day.
 * Returns, per day (newest first): total tasks, completed count, and rate.
 */
logbookRouter.get("/", async (_req, res, next) => {
  try {
    const grouped = await prisma.task.groupBy({
      by: ["localDate"],
      where: { userId: DEFAULT_USER_ID },
      _count: { _all: true },
    });

    // groupBy can't sum booleans directly, so fetch completed counts separately.
    const completedGrouped = await prisma.task.groupBy({
      by: ["localDate"],
      where: { userId: DEFAULT_USER_ID, completed: true },
      _count: { _all: true },
    });

    const completedByDate = new Map(
      completedGrouped.map((g) => [g.localDate, g._count._all]),
    );

    const days = grouped
      .map((g) => {
        const total = g._count._all;
        const completed = completedByDate.get(g.localDate) ?? 0;
        return {
          localDate: g.localDate,
          total,
          completed,
          completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
        };
      })
      .sort((a, b) => (a.localDate < b.localDate ? 1 : -1));

    const totals = days.reduce(
      (acc, d) => {
        acc.total += d.total;
        acc.completed += d.completed;
        return acc;
      },
      { total: 0, completed: 0 },
    );

    res.json({
      days,
      summary: {
        activeDays: days.length,
        totalTasks: totals.total,
        totalCompleted: totals.completed,
        overallCompletionRate:
          totals.total === 0 ? 0 : Math.round((totals.completed / totals.total) * 100),
      },
    });
  } catch (err) {
    next(err);
  }
});
