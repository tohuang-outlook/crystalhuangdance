# Admin User And Video Management Design

## Objective

Add an administrator role to the existing authentication and upload system so a trusted site owner can:

- sign in as an admin
- open a dedicated `/admin` page
- view all registered users
- view all uploaded videos across all users
- delete an individual video
- delete a user and all of that user's uploaded videos

This should extend the existing full-stack auth/upload system without changing the normal member experience for non-admin users.

## Scope

In scope:

- role-based access control for `user` and `admin`
- a safe way to promote an existing account to admin by email
- backend admin-only API endpoints
- frontend admin dashboard page
- delete flows for users and videos
- deletion of processed uploaded video files when related records are removed
- test coverage for admin authorization and destructive actions

Out of scope for this phase:

- editing user profiles
- editing video metadata
- bulk delete actions
- audit logs
- multiple admin roles or fine-grained permissions
- password reset or invitation flows

## Current Context

The site already has:

- email/password registration and login
- session-based auth
- protected routes for `/upload` and `/my-videos`
- per-user YouTube link submissions
- per-user uploaded video processing and storage
- a Railway-ready full-stack deployment path

Current behavior is user-scoped:

- a signed-in user can only see their own videos
- there is no admin role
- there is no admin dashboard

## Recommended Approach

Use a simple role column on the `users` table and add a dedicated admin dashboard.

Why this approach:

- it fits the current session-based auth structure cleanly
- it keeps member and admin experiences clearly separated
- it is easy to reason about and test
- it allows manual promotion of a trusted existing account without exposing admin creation in the public UI

## Role Model

The `users` table gains a `role` field.

Allowed values:

- `user`
- `admin`

Rules:

- all newly registered accounts default to `user`
- admins are promoted manually after account creation
- frontend checks may hide admin UI from non-admin users
- backend must be the source of truth and reject non-admin access even if someone manually hits admin URLs

## Admin Account Creation

First version uses manual promotion by email.

Flow:

1. the site owner creates an account through the normal registration flow
2. a local/admin script is run with that email address
3. the matching account is updated from `user` to `admin`

This avoids exposing any public “create admin” path on the website.

## Backend Changes

### User Data Model

Extend `users` with:

- `role TEXT NOT NULL DEFAULT 'user'`

Safe user payloads returned to the client should now include:

- `id`
- `email`
- `role`

### Authorization Helpers

Add a reusable admin guard on top of existing auth checks.

Expected behavior:

- unauthenticated request to admin API returns `401`
- authenticated non-admin request to admin API returns `403`
- authenticated admin request proceeds

### New Admin Endpoints

Add:

- `GET /api/admin/users`
- `GET /api/admin/videos`
- `DELETE /api/admin/videos/:videoId`
- `DELETE /api/admin/users/:userId`

#### `GET /api/admin/users`

Returns all users ordered by newest first or oldest first consistently, with enough summary info for the dashboard.

Suggested payload per user:

- `id`
- `email`
- `role`
- `createdAt`
- `updatedAt`
- `videoCount`

#### `GET /api/admin/videos`

Returns all videos across all users, including uploader context.

Suggested payload per video:

- existing serialized video fields
- `userId`
- `userEmail`

#### `DELETE /api/admin/videos/:videoId`

Deletes:

- the database record
- the processed uploaded file on disk if it is a local upload

Rules:

- deleting a YouTube link removes only the database record
- deleting a local upload removes both the record and the stored processed file if present

#### `DELETE /api/admin/users/:userId`

Deletes:

- the user record
- all videos belonging to that user
- all locally stored processed video files belonging to that user

Rules:

- this is a cascading destructive action
- admin cannot accidentally leave orphaned video rows or files behind
- if a related file is already missing, deletion should continue and clean up the database anyway

## File Deletion Rules

Only delete files that are site-managed processed uploads.

Do not attempt to delete:

- YouTube links
- arbitrary paths outside the configured uploads area

Implementation should resolve file paths against the configured processed videos directory and avoid unsafe path traversal.

## Frontend Changes

### Auth Context

Auth state should preserve `role` on the logged-in user object so the frontend can:

- decide whether to show an admin link
- protect admin page rendering

### Navigation

When logged in as admin, show an `Admin` link in the authenticated navigation.

When logged in as a normal user, do not show it.

### Protected Admin Route

Add `/admin` as a route that requires:

- authenticated user
- role `admin`

Behavior:

- unauthenticated visitors go to `/login`
- authenticated non-admin users go to a safe destination such as `/` or `/my-videos`

### Admin Dashboard

Create a dedicated `/admin` page with two main sections:

1. `All Users`
2. `All Videos`

#### All Users section

Display:

- email
- role
- created date
- video count
- delete action

#### All Videos section

Display:

- title
- uploader email
- source type
- created date
- status
- delete action

### Destructive UI

Before deleting a video or user, require confirmation.

First version can use native `confirm()` or a lightweight confirm UI.

Delete user confirmation should clearly state:

- the user will be deleted
- all associated videos will also be deleted

### Empty And Error States

Provide clean states for:

- no users
- no videos
- failed admin data load
- failed delete action

## Security Rules

Mandatory rules:

- public registration always creates `user`, never `admin`
- admin endpoints are server-protected
- normal users cannot read all users or all videos
- normal users cannot delete anyone else's data
- session payload should not trust client-written role data
- destructive actions should resolve current role from the authenticated session/user state

## Testing Strategy

Add tests for:

1. registration defaults role to `user`
2. promoted admin can access admin endpoints
3. normal user gets `403` on admin endpoints
4. unauthenticated request gets `401`
5. admin user list returns all users
6. admin video list returns all videos
7. deleting a YouTube video removes only DB data
8. deleting a local upload removes DB row and file
9. deleting a user removes the user plus all related videos
10. deleting a user with local uploads removes related files

Frontend tests should cover:

- admin route protection
- admin link visibility by role
- admin page renders both sections from API data

## UX Notes

Keep the first admin page practical and simple.

This is an operations surface, not a public-facing portfolio section.

It should match the site's visual language enough to feel integrated, but clarity and safety matter more than presentation flourishes.

## Acceptance Criteria

The feature is complete when:

1. a registered account can be promoted to admin by email
2. admin login preserves admin role in session/user payload
3. `/admin` is only accessible to admins
4. admin can see all registered users
5. admin can see all uploaded videos with uploader identity
6. admin can delete a video
7. admin can delete a user and all of that user's videos
8. locally uploaded files are removed from disk when related admin deletions occur
9. non-admin users cannot access admin APIs or UI
10. tests and production build pass

## Implementation Notes

Keep this intentionally first-phase and operational:

- simple role model
- manual admin promotion
- focused admin dashboard
- safe cascading deletion

This gives the site owner immediate moderation/control without overbuilding a full back-office system.
