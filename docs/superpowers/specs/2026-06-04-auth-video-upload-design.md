# Authentication And Video Upload Design

Date: 2026-06-04
Project: Crystal Huang professional dancer website

## Goal

Add a first-version private user system so visitors can register, log in, and upload video content only after authentication.

The current website is a public React/Vite dossier site with no backend, no routing, and no user state. This feature adds the minimum production-shaped account and upload workflow needed to support authenticated video submission without changing the public-facing identity of the site.

## Current Project Context

The website is currently a frontend-only Vite + React + TypeScript app.

Important current characteristics:

- no backend server
- no routing layer
- no database
- no authentication
- no upload capability
- public media is currently served from `public/`

This means the feature cannot be added as a small UI patch. It requires introducing a lightweight backend, authenticated routes, database persistence, and a server-managed upload pipeline.

## Product Direction

The first release should prioritize:

1. clear account ownership
2. secure access control
3. predictable upload behavior
4. automatic video compression
5. minimal operational complexity

The system should feel like a private utility attached to the existing site, not like a consumer social platform. There is no need for profiles, feeds, comments, likes, or public user pages.

## Chosen First-Version Architecture

The first version will use a single-repo, two-part architecture:

1. `Frontend`
   - existing Vite + React app
   - add route-aware pages for `register`, `login`, `upload`, and `my videos`

2. `Backend`
   - add a small Node.js + Express API server inside the same repo
   - handle auth, session validation, upload intake, FFmpeg compression, and metadata persistence

3. `Database`
   - use `SQLite` for the first version
   - store the database file locally on the server

4. `Storage`
   - store uploaded and compressed videos on the server filesystem
   - store only file paths in the database

This keeps the first implementation focused and realistic for the current project size. It avoids introducing cloud storage, OAuth, or infrastructure complexity before the basic workflow is proven.

## Authentication Model

Authentication will use traditional email/password registration and login.

### Supported account actions

1. `Register`
2. `Login`
3. `Logout`
4. `Session restore`

### Register form

Fields:

- `email`
- `password`
- `confirm password`

Validation:

- email must be valid format
- email must be unique
- password and confirm password must match
- password must meet a minimum length requirement of `8` characters

### Login form

Fields:

- `email`
- `password`

Validation:

- both required
- invalid credentials return a generic auth error

### Password storage

Passwords must never be stored in plaintext.

The backend will hash passwords with `bcrypt` before insertion into the database.

### Session model

The first version will use a server-issued, HTTP-only session cookie.

Why this choice:

- simpler than building JWT refresh flows
- better default security than storing tokens in localStorage
- fits a same-origin website + backend deployment model

### Session behavior

- successful login sets the session cookie
- successful registration can immediately create a logged-in session
- authenticated requests rely on the cookie
- logout destroys the session and clears the cookie

## Access Control Rules

The website keeps its current public content model, but adds private upload capabilities.

### Public users

Users who are not logged in:

- can browse the public site
- cannot see upload controls
- cannot access upload pages
- cannot call protected upload APIs successfully

### Authenticated users

Users who are logged in:

- can see a navigation entry for upload features
- can access the upload page
- can access their uploaded video list
- can submit either YouTube links or local video files

### Route protection

The following frontend routes must be protected:

- `/upload`
- `/my-videos`

If an unauthenticated user visits either route directly, they must be redirected to `/login`.

### API protection

Protected backend endpoints must reject unauthenticated requests even if the frontend UI is bypassed.

## Frontend Page Structure

The first version adds four functional views:

1. `Register Page`
2. `Login Page`
3. `Upload Page`
4. `My Videos Page`

### Register page

Purpose:

- create a new account

Success behavior:

- create user
- start session
- redirect to `/upload`

### Login page

Purpose:

- authenticate an existing user

Success behavior:

- start session
- redirect to `/upload`

### Upload page

Purpose:

- allow authenticated users to submit videos in two supported ways

The page should expose two modes:

1. `YouTube Link`
2. `Upload File`

### My Videos page

Purpose:

- show the user the content they have already submitted

The page should display a simple list or table with:

- title
- source type
- processing status
- created date
- playable output or YouTube link when ready

## Upload Modes

Two upload modes are supported.

### Mode A: YouTube Link

User flow:

1. user pastes a YouTube URL
2. frontend submits it to the backend
3. backend validates that it is a supported YouTube URL
4. backend stores the record in the database

Behavior:

- do not download the video
- store the URL string only
- mark the item as `ready` when validation succeeds

### Mode B: Local Video Upload

User flow:

1. user selects a local video file
2. frontend validates basic file rules
3. frontend uploads the file
4. backend stores a temporary original
5. backend compresses it with `FFmpeg`
6. backend saves the compressed output to the server
7. backend writes metadata into the database

## Local Video Rules

### Accepted formats

First version accepted types:

- `.mp4`
- `.mov`
- `.avi`

### Duration limit

Maximum allowed source duration:

- `5 minutes`

The frontend should validate this before upload when browser metadata is available.

The backend must also validate it after ingest so the rule cannot be bypassed.

### Final output size limit

Compressed output must be:

- strictly below `20MB`

Operational target:

- aim for `18MB` to `19MB` when encoding

This gives a safety margin for bitrate estimation variance.

## Compression Pipeline

Compression is a core system requirement, not an optional enhancement.

### Processing steps

1. receive upload
2. save original to a temporary directory
3. inspect media duration and stream details with FFmpeg/ffprobe
4. reject if duration exceeds `5 minutes`
5. calculate a target bitrate based on duration and the `< 20MB` requirement
6. transcode to a web-friendly output
7. verify final file size
8. mark record as `ready` or `failed`

### Output format

The first version should standardize uploaded videos to:

- container: `mp4`
- video codec: `H.264`
- audio codec: `AAC`

This keeps browser playback reliable and consistent.

### Failure behavior

If compression fails:

- delete incomplete outputs
- keep a database record for the attempt
- mark status as `failed`
- show the user a clear upload failure message

## Storage Layout

The backend will use two local filesystem directories:

1. `server/uploads/temp`
   - temporary originals

2. `server/uploads/processed`
   - final compressed outputs

Only processed outputs are intended for long-term serving.

Temporary originals should be deleted after successful processing.

## Data Model

The first release uses two primary tables.

### `users`

Fields:

- `id`
- `email`
- `password_hash`
- `created_at`
- `updated_at`

Rules:

- `email` must be unique

### `videos`

Fields:

- `id`
- `user_id`
- `source_type`
- `title`
- `youtube_url`
- `file_path`
- `original_filename`
- `duration_seconds`
- `file_size_bytes`
- `status`
- `created_at`
- `updated_at`

Field semantics:

- `source_type` values:
  - `youtube`
  - `upload`
- `status` values:
  - `processing`
  - `ready`
  - `failed`

Rules:

- `user_id` must reference the owning account
- `youtube_url` is populated only for `youtube`
- `file_path` is populated only for `upload`

## UX Behavior

### Logged-out state

- upload entry points remain hidden
- direct access to protected routes redirects to login

### Logged-in state

- navbar or account area exposes `Upload Video`
- logged-in user can enter upload and my-videos views

### Upload processing feedback

When a local file is uploading or compressing, the UI must show:

- a loading state
- explicit status text such as:
  - `影片上傳與壓縮中，請稍候...`

The goal is to prevent repeated clicks and reduce the impression that the site has frozen.

The first version does not require true byte-level progress from FFmpeg, but it must show a stable in-progress state until the request completes.

## Suggested Route Map

Frontend routes:

- `/`
- `/register`
- `/login`
- `/upload`
- `/my-videos`

Backend API routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/videos/youtube`
- `POST /api/videos/upload`
- `GET /api/videos`

## Security Requirements

The first version should enforce these baseline controls:

1. passwords are hashed with bcrypt
2. auth cookie is HTTP-only
3. protected routes require a valid session
4. backend validates ownership before returning private video records
5. backend validates file extension and actual media metadata
6. backend rejects over-duration uploads
7. backend rejects outputs that exceed `20MB`
8. failed processing does not expose broken files as successful uploads

## Testing Requirements

Implementation should verify:

1. registration succeeds with valid inputs
2. duplicate email registration fails
3. login succeeds with correct credentials
4. login fails with incorrect credentials
5. unauthenticated access to `/upload` redirects to `/login`
6. protected upload APIs reject unauthenticated requests
7. valid YouTube URLs are accepted and stored
8. invalid YouTube URLs are rejected
9. local videos over `5 minutes` are rejected
10. uploaded local videos are compressed to under `20MB`
11. compressed outputs remain playable and audio/video stay synchronized
12. upload UI shows processing state while backend work is underway

## Acceptance Criteria

The feature is considered complete when:

1. a visitor can register with email/password
2. a registered user can log in and log out
3. logged-out users cannot reach upload functionality
4. logged-in users can submit YouTube links
5. logged-in users can upload supported local videos under `5 minutes`
6. the backend compresses uploaded videos so final outputs are under `20MB`
7. uploaded outputs can be played back successfully
8. users can review their own submitted items in `My Videos`

## Out Of Scope

The first version does not include:

- Google login
- password reset email flows
- admin moderation dashboard
- public user profiles
- cloud storage
- multi-user collaboration on one video record
- background job queue infrastructure
- advanced transcoding presets by device

These can be added later once the first private upload system is stable.
