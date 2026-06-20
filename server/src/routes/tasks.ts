import { Router } from "express";
import { prisma } from "../prisma.js";
import { DEFAULT_USER_ID } from "../constants.js";
import {
  createTaskSchema,
  idParamSchema,
  listTasksQuerySchema,
  updateTaskSchema,
} from "../validation.js";

export const tasksRouter = Router();

/** GET /api/tasks?localDate=YYYY-MM-DD - today's slate for the current user. */
tasksRouter.get("/", async (req, res, next) => {
  try {
    const { localDate } = listTasksQuerySchema.parse(req.query);
    const tasks = await prisma.task.findMany({
      where: { userId: DEFAULT_USER_ID, localDate },
      orderBy: { createdAt: "asc" },
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

/** POST /api/tasks - create a task on a given local day. */
tasksRouter.post("/", async (req, res, next) => {
  try {
    const { title, localDate } = createTaskSchema.parse(req.body);
    const task = await prisma.task.create({
      data: { title, localDate, userId: DEFAULT_USER_ID },
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

/** PATCH /api/tasks/:id - rename and/or toggle completion. */
tasksRouter.patch("/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateTaskSchema.parse(req.body);

    const existing = await prisma.task.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });
    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.completed !== undefined
          ? { completed: data.completed, completedAt: data.completed ? new Date() : null }
          : {}),
      },
    });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/tasks/:id - remove a task. */
tasksRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const existing = await prisma.task.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });
    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }
    await prisma.task.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
