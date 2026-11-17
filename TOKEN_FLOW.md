# Token-Based Access Control Flow

This document explains how to use the Token-Based Access Control system for the TPO Portal.

## 1. Admin Setup
1. Set `SESSION_SECRET`, `SUPER_ADMIN_EMAIL`, and the Brevo variables (`BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`) in your backend `.env` file. Run `npx prisma migrate deploy` then `pnpm seed` (in `apps/backend`) once to create the super admin.
2. For the Vercel backend deployment, set `DATABASE_URL` for Production. The backend generates the Prisma Client during installation and again during its build.
3. Navigate to `/admin` on the portal.
4. Sign in with your staff account (see "Staff Accounts" below). `/admin` redirects to `/login` if you are not signed in.

## 2. Managing Access Tokens
Once logged in to the Admin Dashboard:
- **Create a Link**:
    - Enter a Label (e.g., "Google HR - North Region").
    - Select an Expiry (1 Day, 7 Days, 30 Days, or Never).
    - Click "Generate Access Link".
- **Distribute Link**:
    - Copy the generated link (e.g., `https://tpo.domain.com/portal?token=abc123...`).
    - Send this link to the HR/Partner.
- **Revoke Access**:
    - You can instantly revoke any active token by clicking the "Revoke" (trash icon) button in the tokens table.

## 3. HR / Partner Flow
1. **Initial Visit**: 
    - HR clicks the special link.
    - The `/portal` route extracts the token and validates it with the backend.
    - A secure, httpOnly session cookie is set (valid for 4 hours).
    - If the token was set to "Never" expire (permanent), the token is also cached in the browser's `localStorage`.
2. **Browsing**:
    - HR is redirected to the home page.
    - All data-fetching API calls are protected by the session cookie.
3. **Subsequent Visits**:
    - If the HR returns later:
        - The `TokenGate` component checks `localStorage` for a cached token.
        - If found, it silently re-validates the token and refreshes the session.
        - If not found in `localStorage`, it checks if the session cookie is still valid.
        - If both fail, HR is redirected to the `/access-denied` page.

## 4. Security Rules
- **One-Time Visibility**: The full token string is only shown once when it is created. It is masked in the table thereafter.
- **Backend Verification**: Every API call and portal entry is verified against the database. Revoking a token in the Admin panel takes effect immediately.
- **Cryptographic Randomness**: Tokens are generated using `crypto.randomUUID()`, making them impossible to guess.

## 5. Staff Accounts (Email + Password)
Staff sign in at `/login` (the home page redirects there when there is no valid session).
- **Whitelist**: only emails in the `whitelisted_emails` table can activate an account. The super admin (`SUPER_ADMIN_EMAIL`, seeded by `pnpm seed`) adds, edits, disables or removes entries from `/admin`.
- **First Time Activation**: enter email -> OTP emailed via Brevo (6 digits, 10 min, 5 attempts, 60 s resend cooldown) -> verify -> set password -> signed in. Non-whitelisted or disabled emails get no OTP.
- **Sign in**: email + password sets the `tpo_user` httpOnly cookie (8 h). The whitelist row is re-checked on every request, so disabling/removing an email cuts access immediately.
- **Forgot password**: same OTP flow with purpose `RESET`.
- **Roles**: `SUPER_ADMIN` manages the whitelist and tokens; `ADMIN` can only manage access tokens. Both can browse the portal. Recruiter access links (`tpo_session`) still work unchanged.
- The old shared `ADMIN_PASSWORD` login was removed.
