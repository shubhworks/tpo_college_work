### How to add new batches in the future:
1. Open apps/backend/src/config/batches.ts.
2. Add a new entry for the year (e.g., "2028").
3. Paste the new Google Sheet ID in the spreadsheetId field.
4. If the form structure remains the same as 2027, the existing mapping will work "out of the box".

>   The 2026 batch remains untouched and continues to work as it did before. You can now simply give a fileId (spreadsheet ID) in the URL to see data rendered for any new live form.

<hr/>
 
# The batch-switching glitches and caching issues Fixed!

## Backend Optimizations (apps/backend)
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