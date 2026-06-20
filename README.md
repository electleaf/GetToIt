# GetToIt

A focused daily to-do app built on a "clean slate" mental model: each local
midnight, today's list clears itself, while every task is preserved as history
in a read-only **Logbook**.

It ships in three forms from one codebase:

- a **web app** (React SPA) backed by a real REST API + PostgreSQL, and
- a **standalone Android app** that stores tasks on-device and works fully
  offline (no server required), built automatically in the cloud.

For a deep dive into how it all fits together, see
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Repository layout

```
GetToIt/
├── client/                 Vite + React + TypeScript SPA
│   ├── src/                UI, state, and the two data layers (remote + local)
│   ├── android/            Capacitor-generated native Android project
│   └── capacitor.config.ts Native app config (appId com.electleaf.gettoit)
├── server/                 Express + TypeScript REST API (Prisma + PostgreSQL)
└── .github/workflows/      GitHub Actions: builds the Android APK in the cloud
```

## Key ideas

### The "Midnight Reset" model
There is no server-side cron job. The client computes its own local calendar day
(`YYYY-MM-DD`) and sends it with every request. The daily slate is just the set
of tasks for today's `localDate`, so when the local day rolls over the query
naturally returns an empty list - correct in every timezone, with zero downtime.
Past rows are never deleted; they power the Logbook.

### One UI, two data layers
The React app talks to a small `ApiClient` interface. There are two
implementations, selected at runtime:

| Runtime            | Implementation                | Storage                  |
| ------------------ | ----------------------------- | ------------------------ |
| Web browser        | `remoteApi` (REST `fetch`)    | PostgreSQL via Express   |
| Android (native)   | `localApi` (on-device)        | WebView `localStorage`   |

`Capacitor.isNativePlatform()` decides which one is used, so the components and
the Zustand store are identical across both.

### Optimistic UI
The Zustand store applies create / toggle / delete mutations to the UI instantly
and reconciles with the data layer in the background, rolling back the affected
item if the operation fails.

## Run the web app locally

Prerequisites: **Node 22+** and Docker (for PostgreSQL).

### 1. Backend

```bash
cd server
cp .env.example .env
docker compose up -d                 # start PostgreSQL
npm install
npx prisma migrate dev --name init   # create the schema
npm run dev                          # http://localhost:4000
```

### 2. Frontend

```bash
cd client
cp .env.example .env                 # VITE_API_URL defaults to http://localhost:4000
npm install
npm run dev                          # http://localhost:5173
```

Open http://localhost:5173.

## Get the Android app

The APK is built automatically by GitHub Actions on every push to `main` and
published to a release.

- **Download:** https://github.com/electleaf/GetToIt/releases/tag/android-latest
  (grab `GetToIt.apk`)
- On your phone, allow "Install from unknown sources" and open the APK.
- The Android app is fully standalone: it stores tasks on the device and needs
  no server or network connection.

### Build the APK yourself
Requires Node 22+, JDK 21, and the Android SDK (compileSdk 36).

```bash
cd client
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
# APK at client/android/app/build/outputs/apk/debug/app-debug.apk
```

## API reference

| Method | Path                          | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/api/tasks?localDate=...`    | Today's slate                |
| POST   | `/api/tasks`                  | Create `{ title, localDate }`|
| PATCH  | `/api/tasks/:id`              | Toggle complete / rename     |
| DELETE | `/api/tasks/:id`              | Remove a task                |
| GET    | `/api/logbook`                | History grouped by local day |

## Tech stack
- **Frontend:** Vite, React 18, TypeScript, Tailwind CSS, Framer Motion, Zustand
- **Backend:** Node, Express, TypeScript, Prisma, PostgreSQL, zod
- **Mobile:** Capacitor (Android)
- **CI/CD:** GitHub Actions (cloud APK build + release)
