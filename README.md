### How to add new batches in the future:
1. Open apps/backend/src/config/batches.ts.
2. Add a new entry for the year (e.g., "2028").
3. Paste the new Google Sheet ID in the spreadsheetId field.
4. If the form structure remains the same as 2027, the existing mapping will work "out of the box".

>   The 2026 batch remains untouched and continues to work as it did before. You can now simply give a fileId (spreadsheet ID) in the URL to see data rendered for any new live form.

<hr/>
 
# The batch-switching glitches and caching issues Fixed!

## Backend Optimizations
* Multi-Level Caching: Implemented a more robust caching strategy in studentsControllers.ts.
    * Processed Data Cache: The backend now caches the fully mapped and standardized student list for each batch, avoiding redundant processing on every request.
🛠️ Frontend Stability & UX (apps/frontend)
* Eliminated Race Conditions: Added isMounted protection and cleanup logic to all data-fetching useEffect hooks across BranchPage, Home, StudentCard, and StudentModal. This ensures that if
    a user switches batches or branches rapidly, only the result of the latest request is applied to the UI, preventing old data from "popping in" over new data.
* Flicker-Free Batch Initialization: Refactored BatchProvider to initialize its state directly from the URL's query parameters (?batch=...) on the first render. This removes the previous
    behavior where it would default to "2026" and then "flicker" to "2027" a moment later, which was triggering redundant and incorrect API calls.
* Stale Data Prevention: Updated BranchPage to immediately clear the student list and show loading skeletons whenever the batch or branch changes. This ensures the user never sees data from
    the previous batch while new data is being fetched.
* Type Safety & Code Quality: Resolved several linting errors and replaced any types with proper interfaces to ensure long-term maintainability and prevent runtime crashes.

## Verification
* Performance: Backend response times for student lists and images are now significantly faster due to the improved caching.
* Direct Links: Navigating directly to https://domain.com/branch/CSE?batch=2027 now correctly fetches and displays the 2027 batch data immediately without any intermediate 2026 state.
* Stability: Rapidly switching between batches in the BatchSelector is now smooth, with proper loading states and no data or avatar glitches.
* Build Integrity: The project now passes linting checks with zero errors.

The system is now optimized to handle high traffic and frequent batch switching while maintaining a smooth and reliable user experience.

# Token-based Access Control System

## Overview
The TPO Portal now features a robust, secure, and user-friendly access control system. Instead of public access, the portal is now restricted via unique, trackable links provided to HRs and Partners. This ensures that student data is only accessible to authorized recruitment partners.

## Technical Implementation
*   **Database**: PostgreSQL (via Prisma) stores unique tokens and their metadata.
*   **Authentication**:
    *   **Stateless Tokens**: Cryptographically random UUIDs (`crypto.randomUUID`) are used as entry keys.
    *   **Stateful Sessions**: Upon token validation, the backend issues a signed JWT stored in a `httpOnly`, `Secure`, `SameSite` cookie named `tpo_session`.
*   **Admin Security**: A separate `/admin` dashboard protected by a single `ADMIN_PASSWORD` env var allows for link management.

## Database Schema (`AccessToken`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique internal identifier (CUID) |
| `token` | String | The actual secret key (UUID, unique) |
| `label` | String | User-friendly name (e.g., "Google HR") |
| `expiresAt` | DateTime | Optional expiry date (null = permanent) |
| `isActive` | Boolean | Kill-switch to revoke access immediately |
| `lastUsedAt` | DateTime | Tracks the last time the link was used |

## The Flow: Step-by-Step

### 1. Link Generation (Admin)
*   The Admin logs into `/admin` using the `ADMIN_PASSWORD`.
*   The Admin generates a new token by providing a **Label** and **Expiry** (1 Day, 7 Days, 30 Days, or Never).
*   The system creates a database record and provides a full URL: `https://.../portal?token=UUID`.
*   **Security Note**: The full token string is only displayed **once** upon creation and is masked thereafter for security.

### 2. Token Validation (HR/Partner)
*   The HR partner clicks the provided link. The `/portal` page intercepts the `token` query parameter from the URL.
*   The frontend sends the token to the `POST /api/validate-token` endpoint.
*   The backend performs a three-point check:
    1.  **Existence**: Does the token exist in the database?
    2.  **Status**: Is the `isActive` flag true?
    3.  **Expiry**: If an expiry date is set, is it still in the future?
*   If valid, the backend updates `lastUsedAt` and sets a signed `tpo_session` cookie (valid for 4 hours).

### 3. Portal Entry & Caching
*   Upon successful validation, the user is redirected to the home page (`/`).
*   **Caching Strategy**: If the token was set to "Never" expire (permanent), the token itself is stored in the browser's `localStorage`. This allows for a "revisit" flow where the user doesn't need to use the original link again.

### 4. Continuous Protection (`TokenGate`)
*   All sensitive portal pages (Home, Branch listing, Student profiles) are wrapped in a `<TokenGate>` client component.
*   On every page mount, the gate:
    1.  Checks for a valid `tpo_session` cookie by hitting `/api/check-session`.
    2.  If the session is missing/expired, it attempts to use the token from `localStorage` to silently re-validate.
    3.  If both fail, the user is redirected to the `/access-denied` page.

## Security Measures
*   **HttpOnly Cookies**: Session JWTs are inaccessible to client-side scripts, protecting against XSS attacks.
*   **Masked Tokens**: In the Admin panel, tokens are displayed in a masked format (e.g., `a3f9...xz`) to prevent data leaks.
*   **Instant Revocation**: Revoking a token in the Admin panel sets `isActive = false` in the database, which instantly kills all existing sessions for that token.
*   **Cryptographic Randomness**: Tokens are generated using the OS's cryptographically secure random number generator, making them impossible to guess or brute-force.