# GetToIt

A focused daily to-do app built on a "clean slate" mental model: each local
midnight, today's list clears itself, while every task is preserved as history
in a read-only **Logbook**.

It is a small but deliberately production-shaped codebase: a React SPA frontend
and a separate REST API backed by PostgreSQL.

## Architecture

```
GetToIt/
├── client/   Vite + React + TypeScript SPA (Tailwind, Framer Motion, Zustand)
└── server/   Express + TypeScript REST API (Prisma + PostgreSQL, zod)
```

### The "Midnight Reset" model
There is no server-side cron job. The browser computes its own local calendar
day (`YYYY-MM-DD`) and sends it with every request. The daily slate is just the
set of `Task` rows for today's `localDate`, so when the local day rolls over the
query naturally returns an empty list - correct in every timezone, with zero
downtime. Past rows are never deleted; they power the Logbook.

### Optimistic UI
The Zustand store (`client/src/lib/store.ts`) applies create / toggle / delete
mutations to the UI instantly and fires the network request in the background,
rolling back the affected item if the request fails.

### Single-user mode
Tasks are attributed to a constant `DEFAULT_USER_ID` (`server/src/constants.ts`).
The schema and all queries are already keyed on `userId`, so adding real auth
later is a localized change.

## API

| Method | Path                          | Description                       |
| ------ | ----------------------------- | --------------------------------- |
| GET    | `/api/tasks?localDate=...`    | Today's slate                     |
| POST   | `/api/tasks`                  | Create `{ title, localDate }`     |
| PATCH  | `/api/tasks/:id`              | Toggle complete / rename          |
| DELETE | `/api/tasks/:id`              | Remove a task                     |
| GET    | `/api/logbook`                | History grouped by local day      |

## Getting started

Prerequisites: Node 18+ and Docker (for PostgreSQL).

### 1. Backend

```bash
cd server
cp .env.example .env          # adjust if needed
docker compose up -d          # start PostgreSQL
npm install
npx prisma migrate dev --name init
npm run dev                   # http://localhost:4000
```

### 2. Frontend

```bash
cd client
cp .env.example .env          # VITE_API_URL defaults to http://localhost:4000
npm install
npm run dev                   # http://localhost:5173
```

Open http://localhost:5173.

## Tech stack
- **Frontend:** Vite, React 18, TypeScript, Tailwind CSS, Framer Motion, Zustand
- **Backend:** Node, Express, TypeScript, Prisma, PostgreSQL, zod
