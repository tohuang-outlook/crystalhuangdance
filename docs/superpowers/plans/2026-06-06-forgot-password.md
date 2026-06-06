# Forgot Password Implementation Plan

## Objective
Implement a self-serve forgot-password flow using Resend, expiring single-use reset tokens, and new frontend routes for requesting and completing password resets.

## Phase 1: Backend data and config foundation
1. Add password reset token persistence to the database schema.
2. Extend database access layer with helpers to create, look up, invalidate, and clean up reset tokens.
3. Extend server config to support:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `APP_BASE_URL`
4. Add validation around required production email config where appropriate.

## Phase 2: Email and auth backend flow
1. Add a small email delivery module using Resend.
2. Implement `POST /api/auth/forgot-password`:
   - normalize email
   - always return generic success
   - create secure token for existing users
   - store hashed token with 15-minute expiry
   - send reset email
3. Implement `POST /api/auth/reset-password`:
   - validate token
   - reject invalid/expired/used token
   - hash new password with bcrypt
   - update stored password hash
   - invalidate token
4. Add token generation and hashing utilities.

## Phase 3: Frontend routes and UX
1. Add `/forgot-password` page.
2. Add `/reset-password` page.
3. Add auth service methods for forgot-password and reset-password requests.
4. Add navigation links:
   - login -> forgot password
   - reset success -> back to login
5. Ensure success/error messaging matches the approved security behavior.

## Phase 4: Tests
1. Add backend tests for:
   - generic success response
   - token creation for existing users
   - no account enumeration
   - successful reset
   - expired token rejection
   - reused token rejection
2. Add frontend tests for:
   - forgot-password form submission
   - reset-password form validation
   - success and invalid-token states
3. Keep `npm run test:ci` green.

## Phase 5: Deployment readiness
1. Document the required Railway environment variables.
2. Confirm production base URL is used in reset links.
3. Verify local build and test flows.
4. Prepare a short operator note for setting up Resend domain/senders.

## Verification checklist
- `npm run test:ci`
- `npm run build`
- manual flow:
  - request reset
  - receive link
  - reset password
  - old password fails
  - new password succeeds
