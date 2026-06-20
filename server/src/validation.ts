import { z } from "zod";

/** Matches a YYYY-MM-DD local calendar day. */
const localDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "localDate must be in YYYY-MM-DD format");

export const listTasksQuerySchema = z.object({
  localDate,
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(280),
  localDate,
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(280).optional(),
    completed: z.boolean().optional(),
  })
  .refine((data) => data.title !== undefined || data.completed !== undefined, {
    message: "Provide at least one of: title, completed",
  });

export const idParamSchema = z.object({
  id: z.string().min(1),
});
