# Token-Based Access Control Flow

This document explains how to use the Token-Based Access Control system for the TPO Portal.

## 1. Admin Setup
1. Set the `ADMIN_PASSWORD` and `SESSION_SECRET` in your backend `.env` file.
2. Navigate to `/admin` on the portal.
3. Login with the configured `ADMIN_PASSWORD`.

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
