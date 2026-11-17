# CLAUDE.md - Training & Placement Cell Admin Portal

For current status and open work, read DOCS/HANDOFF.md.

## 1. Project Summary
Training & Placement Cell (TPO) portal for Gyan Ganga Group of Institutions (GGITS). Manages student placement eligibility, multi-parameter candidate filtering, technical certifications tracking, academic marks uploads, and recruiter Excel exports.

## 2. Commands
* **Install**: `pnpm install` (root; triggers backend `prisma generate` via postinstall)
* **Dev**: `pnpm dev` (root Turborepo) | Backend: `cd apps/backend && pnpm dev` | Frontend: `cd apps/frontend && pnpm dev`
* **Build**: `pnpm build` (root) | Backend: `cd apps/backend && pnpm build` | Frontend: `cd apps/frontend && pnpm build`
* **Test**: [UNVERIFIED: No automated test suite or test runner configured in package.json]
* **Single Test**: N/A
* **Lint**: `pnpm lint` (root) | Frontend: `cd apps/frontend && pnpm lint` | Format: `pnpm format`
* **Typecheck**:
  * Root: `pnpm check-types`
  * Backend: `cd apps/backend && ./node_modules/.bin/tsc -p ./tsconfig.json --noEmit`
  * Frontend: `cd apps/frontend && ./node_modules/.bin/tsc -p ./tsconfig.json --noEmit`
* **DB Migrate**:
  * PostgreSQL (Tokens): `cd apps/backend && npx prisma migrate deploy`
  * MySQL (`gg_app` ERP): **DO NOT MIGRATE**. Live external database managed by college IT.

## 3. Architecture
* **Monorepo**: Managed via `pnpm` workspace + Turborepo (`apps/frontend`, `apps/backend`, `packages/*`).
* **Frontend**: Next.js 16 (App Router, React 19, Tailwind CSS v4) hosted on Vercel (`tpo.ggits.org`).
* **Backend**: Express.js + TypeScript running in Docker on college VM (`182.19.81.116`), reverse-proxied by Caddy with auto-SSL (`tpoapi.shubhashish.me`).
* **Databases**:
  * Neon PostgreSQL: Stores API access tokens (`access_tokens` table via Prisma).
  * Live ERP MySQL (`gg_app` on `182.19.81.116:3306`): Direct queries for students, departments, sessions, skills, certificates, and academic details (`students_acadmic_details`).
  * Google Sheets: Legacy read fallback for 2026/2027 batches.
* **Deeper Docs**:
  * Read `DEPLOY.md` when touching deployment or Caddy VM setup.
  * Read `DOCS/MASTER_FILTERING_ARCH.md` for SQL schema mapping and filter engine design.
  * Read `TOKEN_FLOW.md` for token-based recruiter access control.
  * Read `STUDENT_API.md` for student profile JSON endpoints.

### Backend route layout (`apps/backend/src/index.ts`)
* **Two generations of API**: legacy Google Sheets routes (`/batches`, `/students`, `/students/:enrollment`, `/image/:enrollment`, `/students/:enrollment/certs`; `studentsControllers.ts`, `config/batches.ts`, in-memory TTL `cache.ts`) sit behind a global `app.use(tokenAuth)`. New MySQL-backed routes (`/api/new/*` in `newArchitectureController.ts`, `/api/academic/*` in `academicUploadController.ts`) are registered **before** that middleware and currently have no auth middleware attached; the admin token routes use `adminAuth`. Check this ordering before adding any route.
* **Staff auth**: `whitelisted_emails` (also holds the scrypt password hash + role) and `otp_codes` in Postgres. Flow in `authController.ts`: request-otp -> verify-otp (returns short-lived setup JWT) -> set-password; then `login` sets the `tpo_user` cookie. `middleware/adminAuth.ts` (`adminAuth`, `superAdminAuth`, `resolveUser`) re-checks the DB row every request; `tokenAuth` accepts either `tpo_session` (recruiter link) or `tpo_user`. Seed the super admin with `cd apps/backend && pnpm seed`. Details in `TOKEN_FLOW.md`.
* **Filter engine**: `buildMasterFilterSQL` in `newArchitectureController.ts` is shared by `/api/new/students` and `/api/new/export`; frontend counterpart is `components/master-filter-panel.tsx` (used by `app/new` and `app/academic-upload`).

## 4. Conventions Not Enforced by Tooling
* **Compact Filter UI**: Keep filter controls compact using popover dropdowns to prevent excessive vertical height above candidate listings.
* **Academic Department Resolution**: A student's actual department must be queried via `student_session` -> `classes` -> `department` (latest active session), not by branch code alone.
* **Clickable Links**: In assistant responses, format file references as clickable Markdown links (`file://...`) with line numbers.

## 5. Gotchas & Landmines
* **NEVER RUN GIT WRITE COMMANDS**: Do NOT execute `git add`, `git commit`, `git push`, or branch creation. The user executes all Git operations manually.
* **NEVER RUN DATABASE WRITES ON MYSQL**: The `gg_app` MySQL database is a live shared production ERP. `ALTER`, `DROP`, or direct `UPDATE`/`DELETE` are strictly forbidden. Only read queries and the specific endpoint upserting to `students_acadmic_details` are allowed.
* **MySQL Collation Conflicts**: Tables in `gg_app` mix `utf8mb4_general_ci` and `utf8mb4_unicode_ci`. Comparisons and joins between certificate/text fields must use explicit `COLLATE utf8mb4_unicode_ci` to prevent error 1267.
* **Sandboxed Next.js Build**: Running `next build` inside an isolated sandbox fails due to Google Fonts network requests (`Geist`). Use `tsc --noEmit` to verify build integrity in sandboxed environments.
* **Dangling Node Processes**: When testing database scripts with Node, always end pools or call `process.exit(0)` to avoid orphan background processes.

## 6. Decisions Made & Why
* **Live MySQL over Google Sheets**: Replaced Google Sheets sync with direct parameterized MySQL connection pool for modern cohorts (2024-2028+) to enable instant multi-criteria filtering and live counts.
* **Popovers over Inline Lists**: Academic departments and specific academy courses use popover menus with "Select All" and "Clear" to conserve screen space.
* **Unified Filter on `/academic-upload`**: Replaced manual roll-number autocomplete with `MasterFilterPanel` + Candidate Directory to let admins browse entire batches, view upload status, and 1-click edit marks.
* **SQL Collation Casting**: Applied `COLLATE utf8mb4_unicode_ci` in query strings rather than altering database table schemas to prevent breaking college ERP software.

## 7. Environment Variables (Names Only)
* **Frontend**: `NEXT_PUBLIC_BACKEND_URL`
* **Backend**: `PORT`, `NODE_ENV`, `FRONTEND_URL`, `SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `DATABASE_URL`, `SESSION_SECRET`, `SUPER_ADMIN_EMAIL`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `GG_DB_HOST`, `GG_DB_PORT`, `GG_DB_USER`, `GG_DB_PASSWORD`, `GG_DB_NAME`

## 8. Workflow Rules
* **Before calling a task done**, always run and confirm zero errors:
  1. Backend typecheck: `cd apps/backend && ./node_modules/.bin/tsc -p ./tsconfig.json --noEmit`
  2. Frontend typecheck: `cd apps/frontend && ./node_modules/.bin/tsc -p ./tsconfig.json --noEmit`
* **Commits**: Provide conventional commit messages (`feat: ...`, `fix: ...`) in the chat response for the user to commit manually.
