# Project Handoff & Current Status

This document tracks recent changes, active system state, and open work for new agents and contributors.

---

## 1. Recently Completed Work

### Multi-Select Academy Course Certification Filter
* **UI**: Replaced single `<select>` in `apps/frontend/components/master-filter-panel.tsx` with a compact multi-select popover dropdown featuring "Select All", "Clear", checkboxes, and badge count.
* **Backend**: Updated `buildMasterFilterSQL` in `apps/backend/src/controllers/newArchitectureController.ts` to parse comma-separated course names and bind parameterized SQL queries (`certificate_name IN (?, ...)`).
* **Export**: Connected `selectedCertificates` to CSV export query generator.

### Candidate Directory & Filter Panel on `/academic-upload`
* **UI**: Replaced manual roll-number autocomplete in `apps/frontend/app/academic-upload/page.tsx` with `MasterFilterPanel` and a Filtered Candidate Directory table.
* **Status Badges**: Candidates display `✓ Record Uploaded (CGPA: X.XX)` with an **"Edit Record"** button, or `⚠ No Record` with an **"Add Record"** button.
* **Two-Way Binding**: Clicking Edit or Add selects the candidate, auto-scrolls to the form, and pre-fills their existing academic marks.
* **Live Refresh**: Saving a record triggers an immediate background refresh of the candidate directory table.

### DNS & Custom Domain
* Configured `tpo.ggits.org` pointing via Cloudflare CNAME to Vercel production deployment (`tpoportal.vercel.app`).

---

## 2. In-Progress & Uncommitted Changes

The following files contain local modifications that are typechecked and verified but **not yet committed**:
* `apps/backend/src/controllers/newArchitectureController.ts`
* `apps/frontend/types/student-v2.ts`
* `apps/frontend/app/new/page.tsx`
* `apps/frontend/components/master-filter-panel.tsx`
* `apps/frontend/app/academic-upload/page.tsx`

> **Note**: Do not run `git add`, `git commit`, or `git push`. The user executes all Git operations manually.

---

## 3. Known Tech Debt & Edge Cases

1. **MySQL Collation Inconsistencies (`gg_app`)**:
   * Some tables in the live ERP use `utf8mb4_general_ci` while others use `utf8mb4_unicode_ci`.
   * Any join or equality check between certificates or strings must explicitly include `COLLATE utf8mb4_unicode_ci` to prevent MySQL error `1267: Illegal mix of collations`.
2. **Next.js Turbopack Sandboxed Builds**:
   * Running `next build` inside an offline/sandboxed terminal fails because Turbopack tries to download Google Fonts (`Geist` / `Geist Mono`) from `fonts.googleapis.com`.
   * For verification, run TypeScript typechecks (`tsc --noEmit`).
3. **VM Backend Redeploy Required**:
   * After the user commits and pushes changes to `main`, the backend container on the VM host (`182.19.81.116`) must be rebuilt and restarted via `docker compose build && docker compose up -d`.
