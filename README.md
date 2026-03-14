# mylogo

Starter template for new apps. Copy this folder, rename, and customize.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vite + React + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | React Router |
| Backend | Hono + TypeScript |
| Database | libSQL (SQLite/Turso) |
| Auth | Clerk (cloud) + localStorage (local) |

## Quick Start

### Option A — One-command bootstrap (recommended)

```bash
cd ~/shared/projects/app-template
./bootstrap-new-app.sh my-new-app 5199 3099 /my-new-app/
```

This automatically creates:
- project copy in `~/shared/projects/my-new-app`
- ports wired in frontend/backend
- `.env` files
- `APPS.md` (app manifest with file locations)
- nginx snippet at `ops/nginx.my-new-app.conf`

Then run:
```bash
cd ~/shared/projects/my-new-app/frontend && npm install && npm run dev
cd ~/shared/projects/my-new-app/backend && npm install && npm run dev
```

### Option B — Manual copy

```bash
# 1. Copy the template
cp -r ~/shared/projects/app-template ~/shared/projects/my-new-app

# 2. Frontend
cd frontend
npm install
npm run dev  # runs on port 5199

# 3. Backend
cd backend
npm install
npm run dev  # runs on port 3099
```

## Customize Per App

- **App name**: Search-replace "App" in all files
- **Frontend port**: `frontend/vite.config.ts` → change `5199`
- **Backend port**: `backend/src/index.ts` → change `3099`
- **Base path**: Set `VITE_BASE_PATH` env var (default `/`)
- **Colors**: `frontend/src/index.css` → CSS variables under `@theme`
- **Theme**: Change `--color-accent` for your brand color

## Auth: Cloud + Local

The template supports **two auth modes**, auto-detected:

### Clerk (Cloud / Production)
Set `VITE_CLERK_PUBLISHABLE_KEY` in `frontend/.env.local`:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```
And `CLERK_SECRET_KEY` in `backend/.env`:
```
CLERK_SECRET_KEY=sk_test_...
```
When set, the app uses Clerk's `<SignIn>` component and JWT verification.

### Local (No Clerk)
Without Clerk keys, the app falls back to a simple login page (`user/user` by default).
Auth state is stored in `localStorage`. Good for dev/self-hosted.

### Auth Disabled (Dev Mode)
For frictionless local development, set in `frontend/.env.local`:
```
VITE_AUTH_DISABLED=true
```
This auto-authenticates the user immediately (no login screen). Use only in local dev.

### How it works
- `frontend/src/App.tsx`: Checks `VITE_CLERK_PUBLISHABLE_KEY` → renders `ClerkApp` or `LegacyApp`
- `frontend/src/lib/useApi.ts`: Attaches Clerk JWT to API calls when available
- `backend/src/index.ts`: Validates Clerk JWT on `/api/*` routes if `CLERK_SECRET_KEY` is set

## Layout: Desktop + Mobile

Responsive layout with **two navigation modes**:

### Desktop (md+)
- **Sidebar** on the left, collapsible (16px collapsed / 224px expanded)
- State persisted in `localStorage`
- Grouped nav items with collapsible sections

### Mobile (<md)
- **Bottom navigation bar** with 4-5 key routes + "More" catch-all
- Fixed at bottom with safe-area padding for notched phones
- No sidebar visible on mobile

### Key files
- `frontend/src/components/Layout.tsx` — orchestrates sidebar/bottom nav
- `frontend/src/components/Sidebar.tsx` — desktop sidebar with groups
- `frontend/src/components/BottomNav.tsx` — mobile bottom tabs

## Dynamic Base Path

For deploying behind a reverse proxy (e.g. `/myapp/`):

```bash
# Build with custom base path
VITE_BASE_PATH=/myapp/ npm run build
```

Use `API` and `BASE_PATH` from `src/config.ts` instead of hardcoded paths:
```ts
import { API } from '@/config';
fetch(`${API}/health`);
```

## Deployment

### Local VM (SQLite file)
```bash
cd backend && npm run start
cd frontend && npm run build
# Serve frontend/dist via nginx
```

### Vercel + Turso (Cloud)
1. Create Turso DB: `turso db create myapp`
2. Set env vars in Vercel: `TURSO_URL`, `TURSO_AUTH_TOKEN`, `CLERK_SECRET_KEY`
3. Create `api/index.ts` at project root for serverless (see Kompta for reference)
4. Frontend auto-detects `/` base path on Vercel

### Nginx config (VM)
```nginx
location /myapp/ {
    alias /path/to/frontend/dist/;
    try_files $uri $uri/ /myapp/index.html;
}
location /myapp/api/ {
    proxy_pass http://127.0.0.1:3099/api/;
}
```

## PM2 (Backend Process)
```bash
pm2 start backend/src/index.ts --name myapp-backend --interpreter tsx
pm2 save
```

**Note**: To change env vars in PM2, you must delete and recreate the process:
```bash
pm2 delete myapp-backend
CLERK_SECRET_KEY=... pm2 start ...
```

## Documentation

- [Secrets Management](../docs/secrets.md) — where credentials live, how to rotate
- [App Factory Workflow](./WORKFLOW.md) — idea → production pipeline
- [Full Deploy Script](./deploy-full.sh) — one-command deployment
- [Testing Guide](../docs/testing.md) — unified test account strategy (user/user everywhere)
- [Screenshot Guide](../docs/screenshots.md) — how to capture proof of working deployments
