import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { ZodError } from "zod";
import { tasksRouter } from "./routes/tasks.js";
import { logbookRouter } from "./routes/logbook.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const corsOrigin = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/tasks", tasksRouter);
app.use("/api/logbook", logbookRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler: zod -> 400, everything else -> 500.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Validation failed", details: err.flatten() });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`GetToIt API listening on http://localhost:${port}`);
});
