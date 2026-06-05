# Railway Full-Stack Deployment Design

## Goal

Deploy the Crystal Huang website as a single full-stack application on Railway so that the public site can support:

- public dossier pages
- email/password registration and login
- protected upload flows
- local video upload, compression, and playback

The deployment should first be validated on a Railway-provided domain before moving the production custom domain.

## Deployment Strategy

The site will be deployed as a **single Node/Express application** that serves both:

1. the built frontend (`dist`)
2. the backend API (`/api/*`)

This avoids cross-origin cookie issues and keeps authentication, uploads, and SPA routing on the same origin.

## Production Architecture

### Frontend

- Vite continues to build the React frontend into `dist/`
- In production, the frontend is served by Express
- Frontend API requests remain same-origin and continue to target `/api/*`

### Backend

- Express remains the application server
- Express handles:
  - `/api/auth/*`
  - `/api/videos/*`
  - `/uploads/*`
  - static frontend assets from `dist/`
  - SPA route fallback to `dist/index.html`

### Persistence

Railway persistent volume will be mounted at:

`/data`

The backend will store:

- SQLite database at `/data/crystalhuangdance.sqlite`
- uploaded / processed videos under `/data/uploads/...`

This ensures user data and uploaded media persist across deploys.

## Environment Variables

Railway production must define:

- `NODE_ENV=production`
- `SESSION_SECRET=<long-random-secret>`
- `SQLITE_DB_PATH=/data/crystalhuangdance.sqlite`

`PORT` will be supplied by Railway.

## Required App Behavior in Production

### Static and SPA behavior

The deployed app must:

- serve built frontend files from `dist`
- return frontend routes like `/login`, `/register`, `/upload`, and `/my-videos` via SPA fallback
- keep `/api/*` routes working as backend routes
- keep `/uploads/*` serving processed user video files

### Auth and session behavior

The deployed app must:

- allow account creation
- allow login/logout
- preserve session with same-origin cookies
- protect upload and my-videos routes on the frontend
- reject unauthorized backend access to protected APIs

### Upload behavior

The deployed app must:

- accept YouTube links
- accept local uploads up to the configured raw upload limit
- reject videos longer than 5 minutes
- compress uploaded videos with FFmpeg
- keep processed output below 20MB
- save processed output under the Railway volume path

## Files Expected To Change

- `server/index.js`
  - serve built frontend in production
  - add SPA fallback behavior

- `server/config.js`
  - make persistent data directories configurable for production

- `server/app.js`
  - confirm cookie/session production safety
  - trust proxy only if needed by Railway deployment

- `package.json`
  - ensure production build/start scripts match Railway expectations

- `README.md`
  - add deployment notes for Railway

- optional deployment config files if needed:
  - `railway.json`
  - `nixpacks.toml`

## Railway Setup Flow

1. Make the repo production-ready for full-stack serving.
2. Push to GitHub.
3. Create a new Railway project from the GitHub repo.
4. Add a persistent volume mounted at `/data`.
5. Configure environment variables:
   - `NODE_ENV=production`
   - `SESSION_SECRET=...`
   - `SQLITE_DB_PATH=/data/crystalhuangdance.sqlite`
6. Set build command:
   - `npm install && npm run build`
7. Set start command:
   - `npm run server:start`
8. Validate using the Railway-provided domain first.
9. Only after validation, point `crystalhuangdance.org` to Railway.

## Validation Checklist

Before moving the custom domain, the Railway URL must pass:

1. Home page loads.
2. `/login` loads.
3. `/register` loads.
4. User can register.
5. User can log in.
6. Protected route `/upload` works after login.
7. Protected route `/my-videos` works after login.
8. YouTube link upload works.
9. Local upload works.
10. Uploaded local video is compressed and playable.
11. Uploaded content remains available after a redeploy.

## Non-Goals For This Deployment Pass

This deployment pass does **not** include:

- switching to cloud object storage
- replacing SQLite with Postgres
- background job workers for transcoding
- admin moderation workflows

Those can be future upgrades once the first Railway deployment is stable.
