# Forgot Password Design

## Goal
Add a self-serve password recovery flow for registered users on the Crystal Huang website.

## Product Scope
The website will support an email-based password reset flow for existing accounts.

### User Flow
1. User visits `/forgot-password`.
2. User submits an email address.
3. System always returns the same success message, whether the account exists or not.
4. If the account exists, the backend creates a short-lived reset token and emails a reset link.
5. User clicks the link and lands on `/reset-password?token=...`.
6. User enters a new password.
7. Backend validates the token, updates the stored password hash, invalidates the token, and redirects the user back to login.

## Delivery Choice
- Email provider: Resend
- Sender: `noreply@crystalhuangdance.org`
- Reset token lifetime: 15 minutes
- Account enumeration protection: always show a generic success response on forgot-password submission

## Frontend Requirements

### New Routes
- `/forgot-password`
- `/reset-password`

### Forgot Password Page
Fields:
- Email

Behavior:
- Submit button triggers password reset request
- Success state always shows a generic confirmation message such as:
  - "If an account exists for this email, a reset link has been sent."
- No UI should reveal whether the email exists

### Reset Password Page
Fields:
- New password
- Confirm new password

Behavior:
- Read reset token from query string
- Validate matching passwords before submission
- On success, show confirmation and route user back to `/login`
- On expired or invalid token, show a clear error and link back to `/forgot-password`

## Backend Requirements

### New API Endpoints
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### `POST /api/auth/forgot-password`
Input:
- `email`

Behavior:
- Normalize email to lowercase
- Look up user by email
- Always return success response regardless of whether user exists
- If user exists:
  - Generate secure random reset token
  - Store only token hash in database
  - Store expiry timestamp set to 15 minutes from issuance
  - Send reset email through Resend

Output:
- `200 OK`
- Generic success payload/message

### `POST /api/auth/reset-password`
Input:
- `token`
- `password`

Behavior:
- Hash incoming token and look it up
- Reject if token is invalid, expired, or already consumed
- Validate password rules
- Hash new password with bcrypt
- Update user password hash
- Delete or invalidate the reset token
- Optionally clear existing reset tokens for that user

Output:
- `200 OK` on success
- `400` or `410` for invalid/expired token

## Data Model Changes

### New Table: `password_reset_tokens`
Suggested fields:
- `id`
- `user_id`
- `token_hash`
- `expires_at`
- `created_at`
- `used_at` (optional, nullable)

Rules:
- Tokens must never be stored in plaintext
- Tokens should be single-use
- Expired tokens should be rejected

## Email Design

### Sender
- `noreply@crystalhuangdance.org`

### Email Contents
Subject example:
- `Reset your Crystal Huang account password`

Body requirements:
- Clear explanation that a password reset was requested
- Reset button or direct link
- Mention that the link expires in 15 minutes
- Short note to ignore the message if the user did not request it

## Security Requirements
- Do not reveal whether an email exists
- Store only hashed reset tokens
- Tokens expire after 15 minutes
- Tokens are single-use
- All password updates must use bcrypt hashing
- Reset endpoints must be rate-limit ready, even if full rate limiting is deferred

## Acceptance Criteria
1. A user can request password recovery from `/forgot-password`.
2. The UI always shows the same success message, regardless of account existence.
3. Existing users receive a reset email through Resend.
4. The reset link expires after 15 minutes.
5. Users can successfully set a new password through `/reset-password`.
6. Used or expired tokens cannot be reused.
7. The user can sign in with the new password after reset.
8. The old password no longer works.

## Deployment Requirements
Environment variables required:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL=noreply@crystalhuangdance.org`
- `APP_BASE_URL=https://www.crystalhuangdance.org`

## Notes
- This is a self-serve reset flow; admin does not need to manually reset standard user passwords.
- Admin-specific account recovery can remain a separate operational fallback if needed later.
