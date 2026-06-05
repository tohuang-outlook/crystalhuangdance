# Crystal Huang | Dancer 💃✨

A personal dance portfolio website for Crystal Huang, built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- 🎨 Dark elegant design with blue/gold gradient accents
- 📱 Fully responsive (mobile-first)
- 🖼️ Hero section with professional dance photography
- 💃 Dance styles showcase
- 🏆 Achievements timeline
- 🖼️ Gallery with lightbox viewer
- 📬 Contact form

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Full-Stack Production Runtime

This project now supports a single-process production deployment where Express serves:

- the built frontend from `dist`
- API routes under `/api/*`
- processed uploaded videos under `/uploads/videos/*`
- SPA routes such as `/login`, `/register`, `/upload`, and `/my-videos`

Use the production server locally with:

```bash
npm run build
npm run server:start
```

## Railway Deployment

Recommended deployment target: Railway with the entire app deployed together.

### Required environment variables

```bash
NODE_ENV=production
SESSION_SECRET=replace-with-a-long-random-secret
SQLITE_DB_PATH=/data/crystalhuangdance.sqlite
```

Optional overrides:

```bash
DATA_DIRECTORY=/data
UPLOADS_DIRECTORY=/data/uploads
FRONTEND_DIST_DIRECTORY=/app/dist
TRUST_PROXY=true
```

### Persistent volume

Attach a Railway volume mounted at:

```bash
/data
```

This keeps the SQLite database and uploaded/processed videos persistent across deploys.

### Railway build and start

If you use the included `Dockerfile`, Railway will install FFmpeg, build the frontend, and start the full-stack server automatically.

If you configure commands manually instead:

- Build command: `npm install && npm run build`
- Start command: `npm run server:start`

### Validation checklist

After Railway deploys its generated domain, verify:

- homepage loads
- `/login` loads
- `/register` loads
- registration works
- login works
- `/upload` is protected before login
- YouTube link upload works
- local video upload works
- uploaded video is compressed and playable
- `/my-videos` lists uploaded entries
